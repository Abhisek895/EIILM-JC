import { Request, Response, NextFunction } from 'express';
import { InfrastructureService } from '../service/InfrastructureService';

export class InfrastructureController {
  private service: InfrastructureService;

  constructor() {
    this.service = new InfrastructureService();
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const category = req.query.category as string;

      const result = await this.service.list(page, limit, category);
      res.json({
        success: true,
        data: result.rows,
        meta: {
          total: result.count,
          page,
          limit,
          totalPages: Math.ceil(result.count / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const item = await this.service.getById(id);
      
      if (!item) {
        return res.status(404).json({ success: false, message: 'Infrastructure not found' });
      }
      
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.service.create(req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const item = await this.service.update(id, req.body);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await this.service.delete(id);
      res.json({ success: true, message: 'Infrastructure deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
