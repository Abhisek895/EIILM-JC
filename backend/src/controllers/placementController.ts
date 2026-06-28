import { Response } from 'express';
import { Placement } from '@models/index';
import { AuthRequest } from '@middlewares/auth';

export const placementController = {
  // Create a new placement record
  create: async (req: AuthRequest, res: Response) => {
    try {
      const placement = await Placement.create({
        ...req.body,
        // Assuming tenantId might be passed or derived, leaving as null if not applicable in single tenant
        tenantId: null,
      });
      res.status(201).json({ success: true, data: placement });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to create placement', error: error.message });
    }
  },

  // Get all placement records (with optional pagination/filtering)
  getAll: async (req: AuthRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const search = req.query.search as string;
      const placementType = req.query.placementType as string;
      const offset = (page - 1) * limit;

      const whereClause: any = {};
      if (status) {
        whereClause.status = status;
      }
      if (placementType && placementType !== 'all') {
        whereClause.placementType = placementType;
      }
      if (search) {
        const { Op } = require('sequelize');
        whereClause[Op.or] = [
          { studentName: { [Op.substring]: search } },
          { companyName: { [Op.substring]: search } },
          { course: { [Op.substring]: search } },
        ];
      }

      const { count, rows } = await Placement.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['created_at', 'DESC']],
      });

      res.status(200).json({
        success: true,
        data: rows,
        meta: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch placements', error: error.message });
    }
  },

  // Get a specific placement record
  getById: async (req: AuthRequest, res: Response) => {
    try {
      const placement = await Placement.findByPk(req.params.id);
      if (!placement) {
        return res.status(404).json({ success: false, message: 'Placement not found' });
      }
      res.status(200).json({ success: true, data: placement });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch placement', error: error.message });
    }
  },

  // Update a placement record
  update: async (req: AuthRequest, res: Response) => {
    try {
      const placement = await Placement.findByPk(req.params.id);
      if (!placement) {
        return res.status(404).json({ success: false, message: 'Placement not found' });
      }

      await placement.update(req.body);
      res.status(200).json({ success: true, data: placement });
    } catch (error: any) {
      console.error('Update Placement Error:', error);
      res.status(500).json({ success: false, message: 'Failed to update placement', error: error.message });
    }
  },

  // Delete a placement record
  delete: async (req: AuthRequest, res: Response) => {
    try {
      const placement = await Placement.findByPk(req.params.id);
      if (!placement) {
        return res.status(404).json({ success: false, message: 'Placement not found' });
      }

      await placement.destroy();
      res.status(200).json({ success: true, message: 'Placement deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete placement', error: error.message });
    }
  },
};
