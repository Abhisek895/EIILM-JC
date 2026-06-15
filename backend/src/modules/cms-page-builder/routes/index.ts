import { Router } from 'express';
import { PageSectionController } from '../controller/PageSectionController';
import { authenticateToken, authorizePermission } from '@middlewares/auth';

const router = Router();
const ctrl = new PageSectionController();

// Public — frontend fetches sections for a page by pageKey
router.get('/', (req, res) => ctrl.listByPage(req, res));

// Admin
router.get(
  '/all',
  authenticateToken,
  authorizePermission('media', 'read'),
  (req, res) => ctrl.listAll(req, res)
);
router.post(
  '/',
  authenticateToken,
  authorizePermission('media', 'write'),
  (req, res) => ctrl.upsert(req, res)
);
router.put(
  '/:id',
  authenticateToken,
  authorizePermission('media', 'write'),
  (req, res) => ctrl.update(req, res)
);
router.delete(
  '/:id',
  authenticateToken,
  authorizePermission('media', 'delete'),
  (req, res) => ctrl.remove(req, res)
);

export default router;
