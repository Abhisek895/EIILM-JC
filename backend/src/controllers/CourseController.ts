import { Request, Response } from 'express';
import { CourseService } from '@services/CourseService';
import { ApiResponse } from '@utils/responses';
import { parsePagination } from '@utils/pagination';
import { AuthRequest } from '@middlewares/auth';

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit } = parsePagination(req.query.page, req.query.limit);
      const includeAllStatuses = req.user
        ? ['admin', 'super_admin'].includes(req.user.role)
        : false;

      const search = req.query.search as string | undefined;

      const result = await this.courseService.listCourses(
        page,
        limit,
        includeAllStatuses,
        search
      );

      ApiResponse.paginated(
        res,
        200,
        'Courses fetched successfully',
        result.data,
        {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
        }
      );
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number.parseInt(req.params.id, 10);
      const course = await this.courseService.getCourseById(id);

      if (!course) {
        ApiResponse.error(res, 404, 'Course not found');
        return;
      }

      ApiResponse.success(res, 200, 'Course fetched successfully', course);
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { courseName, courseType } = req.body;

      if (!courseName || !courseType) {
        ApiResponse.error(res, 400, 'courseName and courseType are required');
        return;
      }

      const created = await this.courseService.createCourse(req.body);
      ApiResponse.success(res, 201, 'Course created successfully', created);
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number.parseInt(req.params.id, 10);
      await this.courseService.updateCourse(id, req.body);
      ApiResponse.success(res, 200, 'Course updated successfully');
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Number.parseInt(req.params.id, 10);
      await this.courseService.deleteCourse(id);
      ApiResponse.success(res, 200, 'Course deleted successfully');
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }
}
