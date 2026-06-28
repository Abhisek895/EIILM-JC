import { CourseRepository } from '@repositories/CourseRepository';
import { Course } from '@models/Course';

type CreateCourseInput = {
  courseName: string;
  courseCode?: string;
  courseType: 'UG' | 'PG' | 'Diploma' | 'Certificate';
  duration?: string;
  eligibility?: string;
  fees?: string;
  description?: string;
  banner?: string;
  syllabus?: string;
  specialization?: string;
  status?: 'draft' | 'published' | 'archived';
};

export class CourseService {
  private courseRepo: CourseRepository;

  constructor() {
    this.courseRepo = new CourseRepository();
  }

  async listCourses(
    page: number,
    limit: number,
    includeAllStatuses: boolean = false,
    search?: string
  ) {
    return this.courseRepo.findAllWithFilters(page, limit, includeAllStatuses, search);
  }

  async getCourseById(id: number): Promise<Course | null> {
    return this.courseRepo.findById(id);
  }

  async createCourse(data: CreateCourseInput): Promise<Course> {
    const slug = this.createSlug(data.courseName);

    return this.courseRepo.create({
      ...data,
      slug,
      status: data.status || 'draft',
    });
  }

  async updateCourse(id: number, data: Partial<CreateCourseInput>): Promise<void> {
    const payload: Record<string, unknown> = { ...data };
    if (data.courseName) {
      payload.slug = this.createSlug(data.courseName);
    }
    await this.courseRepo.update(id, payload);
  }

  async deleteCourse(id: number): Promise<void> {
    await this.courseRepo.delete(id);
  }

  private createSlug(input: string): string {
    const base = input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    return `${base}-${Date.now()}`;
  }
}
