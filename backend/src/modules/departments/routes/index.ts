import { Router } from 'express';
import { DepartmentController } from '../controller/DepartmentController';
import { authenticateToken, authorizeRole } from '@middlewares/auth';

const router = Router();
const ctrl = new DepartmentController();

// Public endpoints
router.get('/', (req, res) => ctrl.list(req, res));
router.get('/:slug', (req, res) => ctrl.getBySlug(req, res));

// Admin-only
router.post(
  '/',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  (req, res) => ctrl.create(req, res)
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
