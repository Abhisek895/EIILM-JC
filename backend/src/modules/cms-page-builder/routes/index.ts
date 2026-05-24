import { Router } from 'express';
import { PageSectionController } from '../controller/PageSectionController';
import { authenticateToken, authorizeRole } from '@middlewares/auth';

const router = Router();
const ctrl = new PageSectionController();

// Public — frontend fetches sections for a page by pageKey
router.get('/', (req, res) => ctrl.listByPage(req, res));

// Admin
router.get(
  '/all',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  (req, res) => ctrl.listAll(req, res)
);
router.post(
  '/',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  (req, res) => ctrl.upsert(req, res)
);
router.put(
  '/:id',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  (req, res) => ctrl.update(req, res)
);
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  (req, res) => ctrl.remove(req, res)
);

export default router;
