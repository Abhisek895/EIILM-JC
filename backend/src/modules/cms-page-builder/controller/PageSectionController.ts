import { Request, Response } from 'express';
import { PageSectionService } from '../service/PageSectionService';
import { ApiResponse } from '@utils/responses';
import { parsePagination } from '@utils/pagination';

export class PageSectionController {
  private service = new PageSectionService();

  async listByPage(req: Request, res: Response): Promise<void> {
    try {
      const { pageKey } = req.query;
      if (!pageKey || typeof pageKey !== 'string') {
        ApiResponse.error(res, 400, 'pageKey query param is required');
        return;
      }
      const sections = await this.service.getSectionsForPage(pageKey);
      ApiResponse.success(res, 200, 'Page sections fetched', sections);
    } catch (e: any) { ApiResponse.error(res, 500, e.message); }
  }

  async listAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit } = parsePagination(req.query.page, req.query.limit);
      const result = await this.service.listAll(page, limit);
      ApiResponse.paginated(res, 200, 'All sections fetched', result.data, {
        page: result.page, limit, total: result.total, totalPages: result.totalPages,
      });
    } catch (e: any) { ApiResponse.error(res, 500, e.message); }
  }

  async upsert(req: Request, res: Response): Promise<void> {
    try {
      const { pageKey, sectionKey, config, sortOrder } = req.body;
      if (!pageKey || !sectionKey) {
        ApiResponse.error(res, 400, 'pageKey and sectionKey are required');
        return;
      }
      const section = await this.service.upsert(pageKey, sectionKey, config || {}, sortOrder);
      ApiResponse.success(res, 200, 'Section saved', section);
    } catch (e: any) { ApiResponse.error(res, 400, e.message); }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      await this.service.update(Number(req.params.id), req.body);
      ApiResponse.success(res, 200, 'Section updated');
    } catch (e: any) { ApiResponse.error(res, 400, e.message); }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      await this.service.delete(Number(req.params.id));
      ApiResponse.success(res, 200, 'Section deleted');
    } catch (e: any) { ApiResponse.error(res, 500, e.message); }
  }
}
