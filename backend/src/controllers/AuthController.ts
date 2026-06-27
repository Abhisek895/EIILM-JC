import { Request, Response } from 'express';
import { UserService } from '@services/UserService';
import { ApiResponse } from '@utils/responses';
import { AuthRequest } from '@middlewares/auth';
import { EmailService } from '@services/EmailService';
import jwt from 'jsonwebtoken';
import { Config } from '@config/environment';

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
      console.log('Login attempt:', req.body.email);
      const { email, password } = req.body;

      if (!email || !password) {
        ApiResponse.error(res, 400, 'Email and password are required');
        return;
      }

      console.log('Calling authenticateUser...');
      const result = await this.userService.authenticateUser(email, password);
      console.log('authenticateUser returned', !!result);

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
      console.error('Login error:', error);
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

  async requestChangePasswordOtp(req: AuthRequest, res: Response): Promise<void> {
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

      // Generate a secure 6-digit numeric OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      // OTP valid for 10 minutes
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Save fields to User record
      user.otpCode = otpCode;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();

      // Dispatch verification email asynchronously
      await EmailService.sendPasswordChangeOtp(user.email, {
        fullName: user.name,
        otpCode,
      });

      ApiResponse.success(res, 200, 'Verification OTP sent successfully to your email address.');
    } catch (error: any) {
      ApiResponse.error(res, 500, error.message || 'Failed to send verification OTP.');
    }
  }

  async verifyChangePasswordOtp(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ApiResponse.error(res, 401, 'Unauthorized');
        return;
      }

      const { otpCode, newPassword } = req.body;

      if (!otpCode || !newPassword) {
        ApiResponse.error(res, 400, 'OTP code and new password are required.');
        return;
      }

      const user = await this.userService.getUserById(req.user.id);
      if (!user) {
        ApiResponse.error(res, 404, 'User not found');
        return;
      }

      // Check OTP and Expiry
      if (!user.otpCode || user.otpCode !== otpCode) {
        ApiResponse.error(res, 400, 'Invalid verification code.');
        return;
      }

      if (!user.otpExpiresAt || new Date() > new Date(user.otpExpiresAt)) {
        ApiResponse.error(res, 400, 'Verification code has expired. Please request a new one.');
        return;
      }

      // Valid OTP: Update password (hooks hash automatically) and clear OTP fields
      user.password = newPassword;
      user.otpCode = null;
      user.otpExpiresAt = null;
      await user.save();

      ApiResponse.success(res, 200, 'Password changed successfully!');
    } catch (error: any) {
      ApiResponse.error(res, 500, error.message || 'Failed to verify OTP and change password.');
    }
  }

  async setupPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        ApiResponse.error(res, 400, 'Token and password are required.');
        return;
      }

      // Verify token
      const decoded = jwt.verify(token, Config.jwt.secret as jwt.Secret) as { id: number; email: string; purpose: string };
      if (decoded.purpose !== 'setup_password') {
        ApiResponse.error(res, 400, 'Invalid token purpose.');
        return;
      }

      const user = await this.userService.getUserById(decoded.id);
      if (!user) {
        ApiResponse.error(res, 404, 'User not found.');
        return;
      }

      if (user.status !== 'pending') {
        ApiResponse.error(res, 400, 'User account is already setup.');
        return;
      }

      // Update password and status
      user.password = password;
      user.status = 'active';
      await user.save();

      ApiResponse.success(res, 200, 'Password setup successfully. You can now login.');
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        ApiResponse.error(res, 400, 'Setup link has expired. Please contact your administrator.');
      } else {
        ApiResponse.error(res, 500, error.message || 'Failed to setup password.');
      }
    }
  }

  async requestForgotPasswordOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        ApiResponse.error(res, 400, 'Email is required.');
        return;
      }

      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        // Return success even if user not found to prevent email enumeration
        ApiResponse.success(res, 200, 'If that email address is in our database, we will send you an OTP to reset your password.');
        return;
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.otpCode = otpCode;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();

      await EmailService.sendPasswordChangeOtp(user.email, {
        fullName: user.name,
        otpCode,
      });

      ApiResponse.success(res, 200, 'If that email address is in our database, we will send you an OTP to reset your password.');
    } catch (error: any) {
      ApiResponse.error(res, 500, error.message || 'Failed to process password reset request.');
    }
  }

  async verifyForgotPasswordOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otpCode, newPassword } = req.body;

      if (!email || !otpCode || !newPassword) {
        ApiResponse.error(res, 400, 'Email, OTP code, and new password are required.');
        return;
      }

      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        ApiResponse.error(res, 400, 'Invalid request.');
        return;
      }

      if (!user.otpCode || user.otpCode !== otpCode) {
        ApiResponse.error(res, 400, 'Invalid verification code.');
        return;
      }

      if (!user.otpExpiresAt || new Date() > new Date(user.otpExpiresAt)) {
        ApiResponse.error(res, 400, 'Verification code has expired. Please request a new one.');
        return;
      }

      user.password = newPassword;
      user.otpCode = null;
      user.otpExpiresAt = null;
      await user.save();

      ApiResponse.success(res, 200, 'Password reset successfully. You can now login.');
    } catch (error: any) {
      ApiResponse.error(res, 500, error.message || 'Failed to verify OTP and reset password.');
    }
  }
}
