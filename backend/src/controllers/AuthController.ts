import { Request, Response } from 'express';
import { UserService } from '@services/UserService';
import { ApiResponse } from '@utils/responses';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, roleId } = req.body;

      if (!name || !email || !password || !roleId) {
        ApiResponse.error(res, 400, 'Missing required fields');
        return;
      }

      const user = await this.userService.createUser({
        name,
        email,
        password,
        roleId,
      });

      ApiResponse.success(res, 201, 'User registered successfully', {
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        ApiResponse.error(res, 400, 'Email and password are required');
        return;
      }

      const result = await this.userService.authenticateUser(email, password);

      if (!result) {
        ApiResponse.error(res, 401, 'Invalid credentials');
        return;
      }

      ApiResponse.success(res, 200, 'Login successful', {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
        token: result.token,
        refreshToken: result.refreshToken,
      });
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    // Implement token blacklisting or session management
    ApiResponse.success(res, 200, 'Logout successful');
  }
}
