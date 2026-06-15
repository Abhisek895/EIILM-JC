import { Request, Response } from 'express';
import { SiteSettingService } from '../service/SiteSettingService';
import { ApiResponse } from '@utils/responses';

export class SiteSettingController {
  private service = new SiteSettingService();

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.service.getAll();
      ApiResponse.success(res, 200, 'Settings fetched', settings);
    } catch (e: any) { ApiResponse.error(res, 500, e.message); }
  }

  async getMap(req: Request, res: Response): Promise<void> {
    try {
      const map = await this.service.getMap();
      ApiResponse.success(res, 200, 'Settings fetched', map);
    } catch (e: any) { ApiResponse.error(res, 500, e.message); }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { value, description } = req.body;
      if (value === undefined) { ApiResponse.error(res, 400, 'value is required'); return; }
      const setting = await this.service.set(key, String(value), description);
      ApiResponse.success(res, 200, 'Setting updated', setting);
    } catch (e: any) { ApiResponse.error(res, 400, e.message); }
  }

  async bulkUpdate(req: Request, res: Response): Promise<void> {
    try {
      const { settings } = req.body;
      if (!Array.isArray(settings)) {
        ApiResponse.error(res, 400, 'settings must be an array');
        return;
      }
      const result = await this.service.bulkSet(settings);
      ApiResponse.success(res, 200, 'Settings updated', result);
    } catch (e: any) { ApiResponse.error(res, 400, e.message); }
  }
}
