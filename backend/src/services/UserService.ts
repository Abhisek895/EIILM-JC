import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { Config } from '@config/environment';
import { Database } from '@config/database';
import { UserRepository } from '@repositories/UserRepository';
// IMPORTANT: Import from @models/index, not individual model files.
// This guarantees that all Sequelize associations (User belongsTo Role, etc.)
// are registered before any query runs.
import { User, MediaLibrary, AuditLog } from '@models/index';
import { RoleRepository } from '@repositories/RoleRepository';

export type SafeUser = {
  id: number;
  name: string;
  email: string;
  roleId: number;
  role: string;
  status: string;
  permissions?: any;
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
    password?: string;
    roleId?: number;
    roleName?: string;
    permissions?: any;
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
      password: data.password || require('crypto').randomBytes(16).toString('hex'), // plain text — beforeCreate hook hashes it
      roleId,
      status: data.password ? 'active' : 'pending',
      permissions: data.permissions || null,
    });

    return createdUser;
  }

  async getUserById(userId: number): Promise<User | null> {
    return this.userRepo.findById(userId, {
      include: [{ association: 'role', attributes: ['id', 'name'] }],
    });
  }

  async updateUser(
    userId: number,
    data: {
      name?: string;
      email?: string;
      password?: string;
      roleId?: number;
      roleName?: string;
      status?: 'active' | 'inactive' | 'blocked' | 'pending';
      permissions?: any;
    }
  ): Promise<User | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) return null;

    if (data.name !== undefined) user.name = data.name;
    if (data.email !== undefined) user.email = data.email.toLowerCase().trim();
    if (data.roleId !== undefined) {
      user.roleId = data.roleId;
    } else if (data.roleName) {
      const resolvedRole = await this.roleRepo.findByName(data.roleName);
      if (resolvedRole) {
        user.roleId = resolvedRole.id;
      }
    }
    
    if (data.status !== undefined) user.status = data.status;
    if (data.password) {
      user.password = data.password; // hook hashes it
      user.status = 'active';
    }
    if (data.permissions !== undefined) user.permissions = data.permissions;

    await user.save();

    // Reload with association
    return this.userRepo.findById(userId, {
      include: [{ association: 'role', attributes: ['id', 'name'] }],
    });
  }

  async deleteUser(userId: number): Promise<boolean> {
    const db = Database.getInstance();
    return await db.transaction(async (t) => {
      // Temporarily disable foreign key checks to bypass all 80+ table constraints
      await db.query('SET FOREIGN_KEY_CHECKS = 0', { transaction: t });

      const affectedRows = await User.destroy({ where: { id: userId }, transaction: t });

      await db.query('SET FOREIGN_KEY_CHECKS = 1', { transaction: t });
      return affectedRows > 0;
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
    console.log('authenticateUser: Finding user by email:', normalizedEmail);
    const user = await this.userRepo.findByEmail(normalizedEmail);

    if (!user) {
      console.log('authenticateUser: User not found');
      return null;
    }

    console.log('authenticateUser: Comparing password...');
    const passwordValid = await user.comparePassword(password);
    console.log('authenticateUser: Password valid:', passwordValid);

    if (!passwordValid) {
      return null;
    }

    if (user.status !== 'active') {
      throw new Error('User account is not active');
    }

    console.log('authenticateUser: Loading role...');
    // Load user with role association if not already loaded
    const userWithRole = user.role
      ? user
      : await this.userRepo.findById(user.id, {
        include: [{ association: 'role', attributes: ['id', 'name'] }],
      });

    if (!userWithRole) {
      return null;
    }

    console.log('authenticateUser: Issuing tokens...');
    const { token, refreshToken } = this.issueTokensForUser(userWithRole);

    console.log('authenticateUser: Updating lastLogin...');
    // Update last login timestamp
    await this.userRepo.update(user.id, { lastLogin: new Date() });

    console.log('authenticateUser: Success');

    return {
      user: this.toSafeUser(userWithRole),
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
        permissions: user.permissions,
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
      permissions: user.permissions,
    };
  }

  private normalizeRoleName(roleName: string): string {
    return roleName
      .toLowerCase()
      .trim()
      .replace(/[\s-]+/g, '_');
  }
}
