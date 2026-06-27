import { Faculty } from '@models/index';
import { BaseRepository } from '@repositories/BaseRepository';

export class FacultyRepository extends BaseRepository<Faculty> {
  constructor() {
    super(Faculty);
  }

  async findAllActive(page: number, limit: number, departmentId?: number) {
    const where: Record<string, unknown> = { status: 'active' };
    if (departmentId) where.departmentId = departmentId;

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
