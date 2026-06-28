import { BaseRepository } from './BaseRepository';
import { Course } from '@models/index';

export class CourseRepository extends BaseRepository<Course> {
  constructor() {
    super(Course);
  }

  async findAllWithFilters(page: number, limit: number, includeAllStatuses: boolean = false, search?: string) {
    const where: any = {};
    if (!includeAllStatuses) {
      where.status = 'published';
    }

    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { courseName: { [Op.substring]: search } },
        { courseCode: { [Op.substring]: search } },
        { specialization: { [Op.substring]: search } },
      ];
    }

    return this.paginate(page, limit, {
      where,
      order: [['id', 'DESC']],
    });
  }
}
