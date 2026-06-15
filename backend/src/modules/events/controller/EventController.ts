import { Request, Response } from 'express';
import { EventService } from '../service/EventService';
import { ApiResponse } from '@utils/responses';
import { parsePagination } from '@utils/pagination';
import { AuthRequest } from '@middlewares/auth';

export class EventController {
  private service = new EventService();

  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit } = parsePagination(req.query.page, req.query.limit);
      const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);
      const result = isAdmin
        ? await this.service.listAll(page, limit)
        : await this.service.listPublished(page, limit);
      ApiResponse.paginated(res, 200, 'Events fetched', result.data, {
        page: result.page, limit, total: result.total, totalPages: result.totalPages,
      });
    } catch (e: any) { ApiResponse.error(res, 500, e.message); }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const event = await this.service.getById(Number(req.params.id));
      if (!event) { ApiResponse.error(res, 404, 'Event not found'); return; }
      ApiResponse.success(res, 200, 'Event fetched', event);
    } catch (e: any) { ApiResponse.error(res, 500, e.message); }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.body.title) { ApiResponse.error(res, 400, 'title is required'); return; }
      const event = await this.service.create(req.body);
      ApiResponse.success(res, 201, 'Event created', event);
    } catch (e: any) { ApiResponse.error(res, 400, e.message); }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      await this.service.update(Number(req.params.id), req.body);
      ApiResponse.success(res, 200, 'Event updated');
    } catch (e: any) { ApiResponse.error(res, 400, e.message); }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      await this.service.delete(Number(req.params.id));
      ApiResponse.success(res, 200, 'Event deleted');
    } catch (e: any) { ApiResponse.error(res, 500, e.message); }
  }
}
