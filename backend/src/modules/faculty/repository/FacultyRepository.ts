import { Faculty } from '@models/index';
import { BaseRepository } from '@repositories/BaseRepository';

export class FacultyRepository extends BaseRepository<Faculty> {
  constructor() {
    super(Faculty);
  }

  async findAllActive(page: number, limit: number, departmentId?: number, search?: string) {
    const where: any = { status: 'active' };
    if (departmentId) where.departmentId = departmentId;
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.substring]: search } },
        { designation: { [Op.substring]: search } },
        { email: { [Op.substring]: search } },
      ];
    }

    return this.paginate(page, limit, {
      where,
      include: [{ association: 'department', attributes: ['id', 'name', 'slug'] }],
      order: [
        ['sortOrder', 'DESC'],
        ['name', 'ASC'],
      ],
    });
  }

  async findByIdWithDept(id: number): Promise<Faculty | null> {
    return this.findById(id, {
      include: [{ association: 'department', attributes: ['id', 'name', 'slug'] }],
    });
  }
}
