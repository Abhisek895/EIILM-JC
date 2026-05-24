import { Request, Response } from 'express';
import { UserService } from '@services/UserService';
import { ApiResponse } from '@utils/responses';
import { AuthRequest } from '@middlewares/auth';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, roleId, roleName } = req.body;

      if (!name || !email || !password) {
        ApiResponse.error(res, 400, 'Name, email and password are required');
        return;
      }

      const user = await this.userService.createUser({
        name,
        email,
        password,
        roleId,
        roleName,
      });

      ApiResponse.success(res, 201, 'User registered successfully', {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
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
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken,
      });
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        ApiResponse.error(res, 400, 'Refresh token is required');
        return;
      }

      const decoded = this.userService.verifyRefreshToken(refreshToken);
      const user = await this.userService.getUserById(decoded.id);

      if (!user) {
        ApiResponse.error(res, 404, 'User not found');
        return;
      }
      if (user.status !== 'active') {
        ApiResponse.error(res, 403, 'User account is not active');
        return;
      }

      const tokens = this.userService.issueTokensForUser(user);

      ApiResponse.success(res, 200, 'Token refreshed', {
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        user: this.userService.buildSafeUser(user),
      });
    } catch (error: any) {
      ApiResponse.error(res, 401, 'Invalid refresh token', error.message);
    }
  }

  async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ApiResponse.error(res, 401, 'Unauthorized');
        return;
      }

      const user = await this.userService.getUserById(req.user.id);
      if (!user) {
        ApiResponse.error(res, 404, 'User not found');
        return;
      }

      ApiResponse.success(res, 200, 'Profile fetched successfully', {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        role: (user.role?.name || req.user.role)
          .toLowerCase()
          .trim()
          .replace(/[\s-]+/g, '_'),
        status: user.status,
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
