import { User } from '@models/User';
import { Role } from '@models/Role';
import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({
      where: { email },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
    });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.findAll({
      where: { status: 'active' },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
    });
  }

  async findByRole(roleId: number): Promise<User[]> {
    return this.findAll({ where: { roleId } });
  }

  async findByRoleName(roleName: string): Promise<User[]> {
    return this.findAll({
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name'],
          where: { name: roleName },
        },
      ],
    });
  }
}
