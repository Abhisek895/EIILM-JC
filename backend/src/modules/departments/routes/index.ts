import { Router } from 'express';
import { DepartmentController } from '../controller/DepartmentController';
import { authenticateToken, authorizePermission } from '@middlewares/auth';

const router = Router();
const ctrl = new DepartmentController();

// Public endpoints
router.get('/', (req, res) => ctrl.list(req, res));
router.get('/:slug', (req, res) => ctrl.getBySlug(req, res));

// Admin-only
router.post(
  '/',
  authenticateToken,
  authorizePermission('departments', 'write'),
  (req, res) => ctrl.create(req, res)
);
router.put(
  '/:id',
  authenticateToken,
  authorizePermission('departments', 'write'),
  (req, res) => ctrl.update(req, res)
);
router.delete(
  '/:id',
  authenticateToken,
  authorizePermission('departments', 'delete'),
  (req, res) => ctrl.remove(req, res)
);

export default router;
