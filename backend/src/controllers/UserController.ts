import { Request, Response } from 'express';
import { AuthRequest } from '@middlewares/auth';
import { UserService } from '@services/UserService';
import { ApiResponse } from '@utils/responses';
import { EmailService } from '@services/EmailService';
import jwt from 'jsonwebtoken';
import { Config } from '@config/environment';
import { Role } from '@models/Role';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.listUsers();
      ApiResponse.success(res, 200, 'Users fetched successfully', users);
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const userId = Number.parseInt(req.params.id, 10);
      const user = await this.userService.getUserById(userId);
      if (!user) {
        ApiResponse.error(res, 404, 'User not found');
        return;
      }
      ApiResponse.success(res, 200, 'User fetched successfully', this.userService.buildSafeUser(user));
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, email, password, roleId, roleName, permissions } = req.body;

      if (!name || !email) {
        ApiResponse.error(res, 400, 'Name and email are required');
        return;
      }

      // Resolve intended role
      let targetRole: Role | null = null;
      if (roleId) {
        targetRole = await Role.findByPk(roleId);
      } else if (roleName) {
        targetRole = await Role.findOne({ where: { name: roleName } });
      }

      const assignedRoleName = targetRole?.name || roleName;
      const isPrivilegedRole = assignedRoleName === 'super_admin' || assignedRoleName === 'admin' || (targetRole && targetRole.id <= 2);

      // Prevent non-super_admin from creating super_admin or admin
      if (req.user?.role !== 'super_admin' && isPrivilegedRole) {
        ApiResponse.error(res, 403, 'Permission denied: Only a Super Admin can create Admin or Super Admin accounts.');
        return;
      }

      // RBAC Permission Escalation Check
      if (req.user?.role !== 'super_admin' && permissions) {
        if (!req.user?.permissions?.canManageRbac) {
          ApiResponse.error(res, 403, 'Permission denied: You do not have the rights to manage user RBAC permissions.');
          return;
        }

        // Ensure admin is only granting permissions they themselves possess
        const userModules = req.user?.permissions?.modules || {};
        for (const [mod, acts] of Object.entries(permissions.modules || {})) {
          const allowedActs = userModules[mod] || [];
          for (const act of (acts as string[])) {
            if (!allowedActs.includes(act)) {
              ApiResponse.error(res, 403, `Permission denied: Cannot grant ${act} on ${mod} because you lack this permission.`);
              return;
            }
          }
        }
        
        if (permissions.canManageRbac && !req.user?.permissions?.canManageRbac) {
           ApiResponse.error(res, 403, 'Permission denied: Cannot grant RBAC management rights.');
           return;
        }
      }

      const user = await this.userService.createUser({
        name: String(name).trim(),
        email: String(email).toLowerCase().trim(),
        password,
        roleId: targetRole?.id || roleId,
        roleName: assignedRoleName,
        permissions,
      });

      // If password was not provided, send account setup email
      if (!password) {
        const token = jwt.sign(
          { id: user.id, email: user.email, purpose: 'setup_password' },
          Config.jwt.secret as jwt.Secret,
          { expiresIn: '24h' }
        );
        const frontendUrl = Config.frontend.url;
        const setupUrl = `${frontendUrl}/auth/setup-password?token=${token}`;
        
        await EmailService.sendAccountSetupEmail(user.email, {
          fullName: user.name,
          setupUrl,
        });
      }

      ApiResponse.success(res, 201, 'User created successfully', this.userService.buildSafeUser(user));
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = Number.parseInt(req.params.id, 10);
      const { name, email, password, roleId, roleName, status, permissions } = req.body;

      const existingUser = await this.userService.getUserById(userId);
      if (!existingUser) {
        ApiResponse.error(res, 404, 'User not found');
        return;
      }

      // Check existing user's privilege
      const existingRoleName = (existingUser as any).role?.name || '';
      const isTargetPrivileged = existingRoleName === 'admin' || existingRoleName === 'super_admin' || existingUser.roleId <= 2;

      // Non-super_admin cannot modify an admin or super_admin
      if (req.user?.role !== 'super_admin' && isTargetPrivileged) {
        ApiResponse.error(res, 403, 'Permission denied: Only a Super Admin can modify Admin or Super Admin accounts.');
        return;
      }

      // Resolve requested new role
      let targetRole: Role | null = null;
      if (roleId) {
        targetRole = await Role.findByPk(roleId);
      } else if (roleName) {
        targetRole = await Role.findOne({ where: { name: roleName } });
      }

      const newRoleName = targetRole?.name || roleName;
      if (newRoleName) {
        const isNewRolePrivileged = newRoleName === 'super_admin' || newRoleName === 'admin' || (targetRole && targetRole.id <= 2);
        if (req.user?.role !== 'super_admin' && isNewRolePrivileged) {
          ApiResponse.error(res, 403, 'Permission denied: Only a Super Admin can assign the Admin or Super Admin role.');
          return;
        }
      }

      // RBAC Permission Escalation Check
      if (req.user?.role !== 'super_admin' && permissions) {
        if (!req.user?.permissions?.canManageRbac) {
          ApiResponse.error(res, 403, 'Permission denied: You do not have the rights to manage user RBAC permissions.');
          return;
        }

        const userModules = req.user?.permissions?.modules || {};
        for (const [mod, acts] of Object.entries(permissions.modules || {})) {
          const allowedActs = userModules[mod] || [];
          for (const act of (acts as string[])) {
            if (!allowedActs.includes(act)) {
              ApiResponse.error(res, 403, `Permission denied: Cannot grant ${act} on ${mod} because you lack this permission.`);
              return;
            }
          }
        }
      }

      const updatePayload: Record<string, any> = {};
      if (name) updatePayload.name = String(name).trim();
      if (email) updatePayload.email = String(email).toLowerCase().trim();
      if (password) updatePayload.password = password;
      if (targetRole) {
        updatePayload.roleId = targetRole.id;
      } else if (roleId) {
        updatePayload.roleId = roleId;
      }
      if (status) updatePayload.status = status;
      if (permissions !== undefined) updatePayload.permissions = permissions;

      const updatedUser = await this.userService.updateUser(userId, updatePayload);
      if (!updatedUser) {
        ApiResponse.error(res, 404, 'User not found');
        return;
      }
      ApiResponse.success(res, 200, 'User updated successfully', this.userService.buildSafeUser(updatedUser));
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = Number.parseInt(req.params.id, 10);

      // Prevent user from deleting their own account
      if (req.user?.id === userId) {
        ApiResponse.error(res, 400, 'Cannot delete your own account.');
        return;
      }
      
      const existingUser = await this.userService.getUserById(userId);
      if (!existingUser) {
        ApiResponse.error(res, 404, 'User not found');
        return;
      }

      const targetRoleName = (existingUser as any).role?.name || '';
      const isTargetPrivileged = targetRoleName === 'admin' || targetRoleName === 'super_admin' || existingUser.roleId <= 2;

      // Only super_admin can delete an admin or super_admin
      if (req.user?.role !== 'super_admin' && isTargetPrivileged) {
        ApiResponse.error(res, 403, 'Permission denied: Cannot delete an Admin or Super Admin.');
        return;
      }

      const success = await this.userService.deleteUser(userId);
      if (!success) {
        ApiResponse.error(res, 404, 'User not found');
        return;
      }
      ApiResponse.success(res, 200, 'User deleted successfully');
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }
}
