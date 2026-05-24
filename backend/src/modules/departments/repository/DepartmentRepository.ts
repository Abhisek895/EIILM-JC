import { Department } from '@models/index';
import { BaseRepository } from '@repositories/BaseRepository';
import { Op } from 'sequelize';

export class DepartmentRepository extends BaseRepository<Department> {
  constructor() {
    super(Department);
  }

  async findBySlug(slug: string): Promise<Department | null> {
    return this.findOne({ where: { slug }, include: [{ association: 'faculty' }] });
  }

  async findAllActive(page: number, limit: number) {
    return this.paginate(page, limit, {
      where: { status: 'active' },
      order: [['name', 'ASC']],
    });
  }

  async findByName(name: string): Promise<Department | null> {
    return this.findOne({
      where: { name: { [Op.like]: name } },
    });
  }
}
