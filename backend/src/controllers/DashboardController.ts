import { Request, Response } from 'express';
import { DashboardService } from '@services/DashboardService';
import { ApiResponse } from '@utils/responses';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  async stats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.dashboardService.getStats();
      ApiResponse.success(res, 200, 'Dashboard stats fetched successfully', stats);
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async recentInquiries(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number.parseInt(String(req.query.limit || '5'), 10);
      const data = await this.dashboardService.getRecentInquiries(
        Number.isFinite(limit) && limit > 0 ? Math.min(limit, 20) : 5
      );
      ApiResponse.success(
        res,
        200,
        'Recent inquiries fetched successfully',
        data
      );
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }
}
