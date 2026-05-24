import { User } from '@models/User';
import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.findAll({ where: { status: 'active' } });
  }

  async findByRole(roleId: number): Promise<User[]> {
    return this.findAll({ where: { roleId } });
  }
}
