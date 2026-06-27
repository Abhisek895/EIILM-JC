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

  async analytics(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.dashboardService.getAnalytics();
      ApiResponse.success(
        res,
        200,
        'Analytics data fetched successfully',
        data
      );
    } catch (error: any) {
      ApiResponse.error(res, 400, error.message);
    }
  }

  async trackPageView(req: Request, res: Response): Promise<void> {
    try {
      const { path } = req.body;
      const userAgent = req.headers['user-agent'] || null;
      let ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
      if (Array.isArray(ipAddress)) ipAddress = ipAddress[0];
      
      // MOCK IP for testing locally (Real Indian residential IP)
      if (ipAddress === '::1' || ipAddress === '127.0.0.1' || !ipAddress) {
        ipAddress = '122.163.74.52'; // Real residential IP that has City/Region data
      }
      
      await this.dashboardService.trackPageView(path, userAgent, ipAddress as string | null);
      
      ApiResponse.success(res, 200, 'Tracked successfully', null);
    } catch (error: any) {
      // Don't throw 400 for tracking failure, just silently fail or log it so frontend isn't impacted
      console.error('Failed to track page view:', error);
      ApiResponse.success(res, 200, 'Silently failed tracking', null);
    }
  }
}
