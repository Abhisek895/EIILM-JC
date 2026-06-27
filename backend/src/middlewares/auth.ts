import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Config } from '@config/environment';
import { ApiResponse } from '@utils/responses';

type JwtUser = {
  id: number;
  email: string;
  roleId: number;
  role: string;
  permissions?: any;
};

export interface AuthRequest extends Request {
  user?: JwtUser;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    ApiResponse.error(res, 401, 'Unauthorized: token missing');
    return;
  }

  try {
    const decoded = jwt.verify(token, Config.jwt.secret) as JwtUser;
    req.user = decoded;
    next();
  } catch (err) {
    ApiResponse.error(res, 401, 'Unauthorized: invalid token');
  }
};

export const authenticateTokenOptional = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    next();
    return;
  }

  try {
    req.user = jwt.verify(token, Config.jwt.secret) as JwtUser;
  } catch (err) {
    // If token is invalid in optional mode, continue as anonymous.
  }

  next();
};

export const authorizeRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponse.error(res, 401, 'Unauthorized');
      return;
    }

    const normalizedRole = req.user.role
      .toLowerCase()
      .trim()
      .replace(/[\s-]+/g, '_');
    const normalizedAllowedRoles = allowedRoles.map((role) =>
      role.toLowerCase().trim().replace(/[\s-]+/g, '_')
    );

    if (!normalizedAllowedRoles.includes(normalizedRole)) {
      ApiResponse.error(res, 403, 'Forbidden: insufficient permissions');
      return;
    }

    next();
  };
};

export const authorizePermission = (moduleName: string, action: 'read' | 'write' | 'delete') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponse.error(res, 401, 'Unauthorized');
      return;
    }

    // Super Admin overrides all permission checks
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Admin has implicit access to specific operational modules if no explicit permissions object exists?
    // Wait, let's rely purely on the permissions object for explicit checks to be robust.
    // However, if we're migrating, existing admins might not have a permissions object.
    // To be safe during migration, we can fallback to old role-based checks if permissions are null.
    const perms = req.user.permissions;
    if (!perms || !perms.modules) {
      // Fallback for legacy admin
      if (req.user.role === 'admin') {
        const legacyAdminModules = ['dashboard', 'inquiries', 'notices', 'events', 'media', 'users'];
        if (legacyAdminModules.includes(moduleName)) {
          // If it's users module, admin can only read/write/delete under certain conditions handled in controller
          return next(); 
        }
      }
      
      // Fallback for faculty
      if (req.user.role === 'faculty') {
        const legacyFacultyModules = ['dashboard', 'inquiries'];
        if (legacyFacultyModules.includes(moduleName) && action === 'read') {
          return next();
        }
      }

      console.log(`[AUTH 403] Legacy User blocked for ${moduleName} ${action}. Role: ${req.user.role}`);
      ApiResponse.error(res, 403, `Forbidden: Requires ${action} permission on ${moduleName}`);
      return;
    }

    // canManageRbac inherently grants read/write/delete access to the users module
    if (moduleName === 'users' && perms.canManageRbac) {
      return next();
    }

    const modulePerms = perms.modules[moduleName] || [];
    if (modulePerms.includes(action)) {
      return next();
    }

    console.log(`[AUTH 403] User blocked. Required: ${moduleName} ${action}. User perms:`, perms);
    ApiResponse.error(res, 403, `Forbidden: Requires ${action} permission on ${moduleName}`);
  };
};
