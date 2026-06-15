import { Infrastructure } from '@models/index';

export class InfrastructureRepository {
  async findAll(page: number, limit: number, category?: string) {
    const offset = (page - 1) * limit;
    const whereClause: any = {};
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    
    return Infrastructure.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['sortOrder', 'ASC'], ['created_at', 'DESC']],
    });
  }

  async findById(id: number) {
    return Infrastructure.findByPk(id);
  }

  async create(data: Partial<Infrastructure>) {
    return Infrastructure.create(data as any);
  }

  async update(id: number, data: Partial<Infrastructure>) {
    await Infrastructure.update(data, { where: { id } });
    return this.findById(id);
  }

  async delete(id: number) {
    return Infrastructure.destroy({ where: { id } });
  }
}
