import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Config } from '@config/environment';
import { ApiResponse } from '@utils/responses';

type JwtUser = {
  id: number;
  email: string;
  roleId: number;
  role: string;
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
    ApiResponse.error(res, 403, 'Forbidden: invalid token');
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
