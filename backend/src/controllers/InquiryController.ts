import { Request, Response } from 'express';
import { InquiryService } from '@services/InquiryService';
import { ApiResponse } from '@utils/responses';
import { parsePagination } from '@utils/pagination';

export class InquiryController {
  private inquiryService: InquiryService;

  constructor() {
    this.inquiryService = new InquiryService();
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { fullName } = req.body;
      if (!fullName) {
        ApiResponse.error(res, 400, 'fullName is required');
        return;
      }

      const inquiry = await this.inquiryService.createInquiry(req.body);
      ApiResponse.success(res, 201, 'Inquiry submitted successfully', inquiry);
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit } = parsePagination(req.query.page, req.query.limit);
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const result = await this.inquiryService.listInquiries(page, limit, search, status);

      ApiResponse.paginated(
        res,
        200,
        'Inquiries fetched successfully',
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

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number.parseInt(req.params.id, 10);
      await this.inquiryService.updateInquiry(id, req.body);
      ApiResponse.success(res, 200, 'Inquiry updated successfully');
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }
}
