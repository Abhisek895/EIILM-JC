import { Request, Response } from 'express';
import { UserService } from '@services/UserService';
import { ApiResponse } from '@utils/responses';

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

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, roleId } = req.body;
      if (!name || !email || !password) {
        ApiResponse.error(res, 400, 'Name, email and password are required');
        return;
      }
      const user = await this.userService.createUser({
        name,
        email,
        password,
        roleId,
      });
      ApiResponse.success(res, 201, 'User created successfully', this.userService.buildSafeUser(user));
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = Number.parseInt(req.params.id, 10);
      const { name, email, password, roleId, status } = req.body;
      const updatedUser = await this.userService.updateUser(userId, {
        name,
        email,
        password,
        roleId,
        status,
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

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = Number.parseInt(req.params.id, 10);
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
