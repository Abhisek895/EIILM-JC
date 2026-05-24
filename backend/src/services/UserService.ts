import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { Config } from '@config/environment';
import { UserRepository } from '@repositories/UserRepository';
import { User } from '@models/User';
import { RoleRepository } from '@repositories/RoleRepository';

type SafeUser = {
  id: number;
  name: string;
  email: string;
  roleId: number;
  role: string;
  status: string;
};

type LoginResponse = {
  user: SafeUser;
  token: string;
  refreshToken: string;
};

export class UserService {
  private userRepo: UserRepository;
  private roleRepo: RoleRepository;

  constructor() {
    this.userRepo = new UserRepository();
    this.roleRepo = new RoleRepository();
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    roleId?: number;
    roleName?: string;
  }): Promise<User> {
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    let roleId = data.roleId;

    if (!roleId) {
      const resolvedRole = await this.roleRepo.findByName(
        data.roleName || 'student'
      );
      if (!resolvedRole) {
        throw new Error(
          "Role not found. Run seed first: 'npm run seed' in backend."
        );
      }
      roleId = resolvedRole.id;
    }

    const createdUser = await this.userRepo.create({
      name: data.name,
      email: data.email.toLowerCase().trim(),
      password: data.password,
      roleId,
    });

    return createdUser;
  }

  async getUserById(userId: number): Promise<User | null> {
    return this.userRepo.findById(userId, {
      include: [{ association: 'role', attributes: ['id', 'name'] }],
    });
  }

  async listUsers(): Promise<SafeUser[]> {
    const users = await this.userRepo.findAll({
      include: [{ association: 'role', attributes: ['id', 'name'] }],
      order: [['id', 'DESC']],
    });

    return users.map((user) => this.toSafeUser(user));
  }

  async authenticateUser(
    email: string,
    password: string
  ): Promise<LoginResponse | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepo.findByEmail(normalizedEmail);

    if (!user || !(await user.comparePassword(password))) {
      return null;
    }

    if (user.status !== 'active') {
      throw new Error('User account is not active');
    }

    const { token, refreshToken } = this.issueTokensForUser(user);

    // Update last login
    await this.userRepo.update(user.id, { lastLogin: new Date() });

    return {
      user: this.toSafeUser(user),
      token,
      refreshToken,
    };
  }

  issueTokensForUser(user: User): { token: string; refreshToken: string } {
    return {
      token: this.generateToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  buildSafeUser(user: User): SafeUser {
    return this.toSafeUser(user);
  }

  verifyRefreshToken(token: string): { id: number; email: string } {
    const decoded = jwt.verify(token, Config.jwt.refreshSecret as Secret) as {
      id: number;
      email: string;
    };

    return decoded;
  }

  private generateToken(user: User): string {
    const roleName = this.normalizeRoleName(user.role?.name || 'student');
    const signOptions: SignOptions = {
      expiresIn: Config.jwt.expiresIn as SignOptions['expiresIn'],
    };

    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        role: roleName,
      },
      Config.jwt.secret as Secret,
      signOptions
    );
  }

  private generateRefreshToken(user: User): string {
    const signOptions: SignOptions = {
      expiresIn: Config.jwt.refreshExpiresIn as SignOptions['expiresIn'],
    };

    return jwt.sign(
      { id: user.id, email: user.email },
      Config.jwt.refreshSecret as Secret,
      signOptions
    );
  }

  private toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      role: this.normalizeRoleName(user.role?.name || 'student'),
      status: user.status,
    };
  }

  private normalizeRoleName(roleName: string): string {
    return roleName
      .toLowerCase()
      .trim()
      .replace(/[\s-]+/g, '_');
  }
}
