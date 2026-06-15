import { Request, Response } from 'express';
import { FacultyService } from '../service/FacultyService';
import { ApiResponse } from '@utils/responses';
import { parsePagination } from '@utils/pagination';

export class FacultyController {
  private service: FacultyService;

  constructor() {
    this.service = new FacultyService();
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit } = parsePagination(req.query.page, req.query.limit);
      const departmentId = req.query.departmentId
        ? Number(req.query.departmentId)
        : undefined;
      const result = await this.service.list(page, limit, departmentId);
      ApiResponse.paginated(res, 200, 'Faculty fetched', result.data, {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error: any) {
      ApiResponse.error(res, 500, error.message);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const faculty = await this.service.getById(id);
      if (!faculty) {
        ApiResponse.error(res, 404, 'Faculty member not found');
        return;
      }
      ApiResponse.success(res, 200, 'Faculty member fetched', faculty);
    } catch (error: any) {
      ApiResponse.error(res, 500, error.message);
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.body.name) {
        ApiResponse.error(res, 400, 'name is required');
        return;
      }
      const faculty = await this.service.create(req.body);
      ApiResponse.success(res, 201, 'Faculty member created', faculty);
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      await this.service.update(id, req.body);
      ApiResponse.success(res, 200, 'Faculty member updated');
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      await this.service.delete(id);
      ApiResponse.success(res, 200, 'Faculty member deleted');
    } catch (error: any) {
      ApiResponse.error(res, 500, error.message);
    }
  }
}
