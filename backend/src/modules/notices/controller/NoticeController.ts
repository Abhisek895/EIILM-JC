import { Request, Response } from 'express';
import { NoticeService } from '../service/NoticeService';
import { ApiResponse } from '@utils/responses';
import { parsePagination } from '@utils/pagination';
import { AuthRequest } from '@middlewares/auth';
import { getUploadedFileUrl } from '@middlewares/uploadCloud';

export class NoticeController {
  private service: NoticeService;

  constructor() {
    this.service = new NoticeService();
  }

  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit } = parsePagination(req.query.page, req.query.limit);
      const isAdmin =
        req.user &&
        ['admin', 'super_admin'].includes(req.user.role);

      const result = isAdmin
        ? await this.service.listAll(page, limit)
        : await this.service.listPublished(page, limit);

      ApiResponse.paginated(res, 200, 'Notices fetched', result.data, {
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
      const notice = await this.service.getById(id);
      if (!notice) {
        ApiResponse.error(res, 404, 'Notice not found');
        return;
      }
      ApiResponse.success(res, 200, 'Notice fetched', notice);
    } catch (error: any) {
      ApiResponse.error(res, 500, error.message);
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.body.title) {
        ApiResponse.error(res, 400, 'title is required');
        return;
      }
      if (req.file) {
        req.body.pdfUrl = getUploadedFileUrl(req.file);
      }
      const notice = await this.service.create(req.body);
      ApiResponse.success(res, 201, 'Notice created', notice);
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (req.file) {
        req.body.pdfUrl = getUploadedFileUrl(req.file);
      }
      await this.service.update(id, req.body);
      ApiResponse.success(res, 200, 'Notice updated');
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      await this.service.delete(id);
      ApiResponse.success(res, 200, 'Notice deleted');
    } catch (error: any) {
      ApiResponse.error(res, 500, error.message);
    }
  }
}
