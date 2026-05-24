import { Model, FindOptions } from 'sequelize';

export abstract class BaseRepository<T extends Model> {
  constructor(protected model: new () => T) {}

  async findAll(options?: FindOptions): Promise<T[]> {
    return this.model.findAll(options);
  }

  async findById(id: number | string, options?: FindOptions): Promise<T | null> {
    return this.model.findByPk(id, options);
  }

  async findOne(options: FindOptions): Promise<T | null> {
    return this.model.findOne(options);
  }

  async create(data: any): Promise<T> {
    return this.model.create(data);
  }

  async update(id: number | string, data: any): Promise<[number]> {
    return this.model.update(data, { where: { id } as any });
  }

  async delete(id: number | string): Promise<number> {
    return this.model.destroy({ where: { id } as any });
  }

  async count(options?: FindOptions): Promise<number> {
    return this.model.count(options);
  }

  async paginate(
    page: number = 1,
    limit: number = 10,
    options?: FindOptions
  ): Promise<{ data: T[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    const { count, rows } = await this.model.findAndCountAll({
      ...options,
      offset,
      limit,
    });

    return {
      data: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }
}
