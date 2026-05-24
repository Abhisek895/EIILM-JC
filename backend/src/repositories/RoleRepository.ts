import { BaseRepository } from './BaseRepository';
import { Role } from '@models/Role';
import { Op } from 'sequelize';

export class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super(Role);
  }

  async findByName(name: string): Promise<Role | null> {
    const normalized = name.trim();
    const titleCase =
      normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();

    return this.findOne({
      where: {
        name: {
          [Op.in]: [
            normalized,
            normalized.toLowerCase(),
            normalized.toUpperCase(),
            titleCase,
          ],
        },
      },
    });
  }
}
