import jwt from 'jsonwebtoken';
import { Config } from '@config/environment';
import { UserRepository } from '@repositories/UserRepository';
import { User } from '@models/User';

export class UserService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    roleId: number;
  }): Promise<User> {
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    return this.userRepo.create(data);
  }

  async getUserById(userId: number): Promise<User | null> {
    return this.userRepo.findById(userId);
  }

  async authenticateUser(
    email: string,
    password: string
  ): Promise<{ user: User; token: string; refreshToken: string } | null> {
    const user = await this.userRepo.findByEmail(email);

    if (!user || !(await user.comparePassword(password))) {
      return null;
    }

    if (user.status !== 'active') {
      throw new Error('User account is not active');
    }

    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Update last login
    await this.userRepo.update(user.id, { lastLogin: new Date() });

    return { user, token, refreshToken };
  }

  private generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
      },
      Config.jwt.secret,
      { expiresIn: Config.jwt.expiresIn }
    );
  }

  private generateRefreshToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email },
      Config.jwt.refreshSecret,
      { expiresIn: Config.jwt.refreshExpiresIn }
    );
  }
}
