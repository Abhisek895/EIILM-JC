import { Router } from 'express';
import { SiteSettingController } from '../controller/SiteSettingController';
import { authenticateToken, authorizeRole } from '@middlewares/auth';

const router = Router();
const ctrl = new SiteSettingController();

// Public — returns key-value map (used by frontend for nav, footer, etc.)
router.get('/map', (req, res) => ctrl.getMap(req, res));

// Admin — full settings management
router.get(
  '/',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  (req, res) => ctrl.getAll(req, res)
);
router.put(
  '/bulk',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  (req, res) => ctrl.bulkUpdate(req, res)
);
router.put(
  '/:key',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  (req, res) => ctrl.update(req, res)
);

export default router;
