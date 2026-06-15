import { Request, Response } from 'express';
import { AuthRequest } from '@middlewares/auth';
import { UserService } from '@services/UserService';
import { ApiResponse } from '@utils/responses';
import { EmailService } from '@services/EmailService';
import jwt from 'jsonwebtoken';
import { Config } from '@config/environment';

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
      
      // Prevent admin from creating super_admin or admin
      if (req.user?.role !== 'super_admin' && (roleName === 'super_admin' || roleName === 'admin')) {
        ApiResponse.error(res, 403, 'Permission denied: Only a Super Admin can create Admin or Super Admin.');
        return;
      }

      // ONLY sarkarabhisek50@gmail.com can create a super_admin
      if (roleName === 'super_admin' && req.user?.email !== 'sarkarabhisek50@gmail.com') {
        ApiResponse.error(res, 403, 'Permission denied: Only the system owner can create a Super Admin.');
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
        
        // Ensure admin cannot grant 'canManageRbac' if they don't have it (redundant check but good practice)
        if (permissions.canManageRbac && !req.user?.permissions?.canManageRbac) {
           ApiResponse.error(res, 403, 'Permission denied: Cannot grant RBAC management rights.');
           return;
        }
      }

      if (!name || !email) {
        ApiResponse.error(res, 400, 'Name and email are required');
        return;
      }
      const user = await this.userService.createUser({
        name,
        email,
        password,
        roleId,
        roleName,
        permissions,
      });

      // If password was not provided, user is pending. We need to send setup email.
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

      // Prevent admin from updating to super_admin or admin
      if (req.user?.role !== 'super_admin' && (roleName === 'super_admin' || roleName === 'admin')) {
        ApiResponse.error(res, 403, 'Permission denied: Only a Super Admin can assign the Admin or Super Admin role.');
        return;
      }

      // Check the existing user
      const existingUser = await this.userService.getUserById(userId);
      if (!existingUser) {
        ApiResponse.error(res, 404, 'User not found');
        return;
      }

      // Only sarkarabhisek50@gmail.com can edit the system owner account
      if (existingUser.email === 'sarkarabhisek50@gmail.com' && req.user?.email !== 'sarkarabhisek50@gmail.com') {
        ApiResponse.error(res, 403, 'Permission denied: The system owner account is protected and cannot be modified.');
        return;
      }

      // ONLY sarkarabhisek50@gmail.com can assign the super_admin role
      if (roleName === 'super_admin' && req.user?.email !== 'sarkarabhisek50@gmail.com') {
        ApiResponse.error(res, 403, 'Permission denied: Only the system owner can assign the Super Admin role.');
        return;
      }

      // Prevent admin from modifying an existing admin or super_admin
      const existingRole = (existingUser as any).role?.name || existingUser.roleId; // depends on associations, but usually role.name is joined
      if (req.user?.role !== 'super_admin') {
        const isTargetAdmin = (existingUser as any).role?.name === 'admin' || (existingUser as any).role?.name === 'super_admin';
        if (isTargetAdmin) {
          ApiResponse.error(res, 403, 'Permission denied: Cannot modify an Admin or Super Admin.');
          return;
        }
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

      const updatedUser = await this.userService.updateUser(userId, {
        name,
        email,
        password,
        roleId,
        roleName,
        status,
        permissions,
      });
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
      
      const existingUser = await this.userService.getUserById(userId);
      if (!existingUser) {
        ApiResponse.error(res, 404, 'User not found');
        return;
      }

      // Only sarkarabhisek50@gmail.com can delete the system owner account
      if (existingUser.email === 'sarkarabhisek50@gmail.com' && req.user?.email !== 'sarkarabhisek50@gmail.com') {
        ApiResponse.error(res, 403, 'Permission denied: The system owner account is protected and cannot be deleted.');
        return;
      }

      if (req.user?.role !== 'super_admin') {
        const isTargetAdmin = (existingUser as any).role?.name === 'admin' || (existingUser as any).role?.name === 'super_admin';
        if (isTargetAdmin) {
          ApiResponse.error(res, 403, 'Permission denied: Cannot delete an Admin or Super Admin.');
          return;
        }
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
