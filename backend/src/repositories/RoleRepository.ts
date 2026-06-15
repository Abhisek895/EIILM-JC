import { BaseRepository } from './BaseRepository';
import { Role } from '@models/index';
import { Op } from 'sequelize';

export class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super(Role);
  }

  async findByName(name: string): Promise<Role | null> {
    const normalized = name.trim();
    const withSpaces = normalized.replace(/_/g, ' ');
    const titleCase =
      withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase();
    
    // Also handle 'Super Admin' specifically since it's two capitalized words
    const titleCaseWords = withSpaces.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

    return this.findOne({
      where: {
        name: {
          [Op.in]: [
            normalized,
            normalized.toLowerCase(),
            normalized.toUpperCase(),
            withSpaces,
            titleCase,
            titleCaseWords
          ],
        },
      },
    });
  }
}
