import {
  FindAndCountOptions,
  FindOptions,
  Model,
  ModelStatic,
  UpdateOptions,
  WhereOptions,
} from 'sequelize';

export abstract class BaseRepository<T extends Model> {
  constructor(protected model: ModelStatic<T>) {}

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

  async update(
    id: number | string,
    data: Record<string, unknown>,
    options?: Omit<UpdateOptions, 'where'>
  ): Promise<[number]> {
    return this.model.update(data, {
      ...options,
      where: { id } as WhereOptions,
    });
  }

  async delete(id: number | string): Promise<number> {
    return this.model.destroy({ where: { id } as WhereOptions });
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
    const findOptions: FindAndCountOptions = {
      ...options,
      offset,
      limit,
    };

    const { count, rows } = await this.model.findAndCountAll(findOptions);

    return {
      data: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }
}
