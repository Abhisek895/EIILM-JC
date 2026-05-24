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
}
