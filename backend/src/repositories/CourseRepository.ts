import { BaseRepository } from './BaseRepository';
import { Course } from '@models/Course';

export class CourseRepository extends BaseRepository<Course> {
  constructor() {
    super(Course);
  }

  async findPublished(page: number, limit: number) {
    return this.paginate(page, limit, {
      where: { status: 'published' },
      order: [['id', 'DESC']],
    });
  }
}
