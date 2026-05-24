import { Request, Response } from 'express';
import { DepartmentService } from '../service/DepartmentService';
import { ApiResponse } from '@utils/responses';
import { parsePagination } from '@utils/pagination';

export class DepartmentController {
  private service: DepartmentService;

  constructor() {
    this.service = new DepartmentService();
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit } = parsePagination(req.query.page, req.query.limit);
      const result = await this.service.list(page, limit);
      ApiResponse.paginated(res, 200, 'Departments fetched', result.data, {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error: any) {
      ApiResponse.error(res, 500, error.message);
    }
  }

  async getBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const dept = await this.service.getBySlug(slug);
      if (!dept) {
        ApiResponse.error(res, 404, 'Department not found');
        return;
      }
      ApiResponse.success(res, 200, 'Department fetched', dept);
    } catch (error: any) {
      ApiResponse.error(res, 500, error.message);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const dept = await this.service.getById(id);
      if (!dept) {
        ApiResponse.error(res, 404, 'Department not found');
        return;
      }
      ApiResponse.success(res, 200, 'Department fetched', dept);
    } catch (error: any) {
      ApiResponse.error(res, 500, error.message);
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;
      if (!name) {
        ApiResponse.error(res, 400, 'name is required');
        return;
      }
      const dept = await this.service.create(req.body);
      ApiResponse.success(res, 201, 'Department created', dept);
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      await this.service.update(id, req.body);
      ApiResponse.success(res, 200, 'Department updated');
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      await this.service.delete(id);
      ApiResponse.success(res, 200, 'Department deleted');
    } catch (error: any) {
      ApiResponse.error(res, 500, error.message);
    }
  }
}
