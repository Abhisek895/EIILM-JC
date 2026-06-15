import { Router } from 'express';
import { CourseController } from '@controllers/CourseController';
import {
  authenticateToken,
  authenticateTokenOptional,
  authorizePermission,
} from '@middlewares/auth';

const router = Router();
const controller = new CourseController();

router.get('/', authenticateTokenOptional, (req, res) => controller.list(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.post(
  '/',
  authenticateToken,
  authorizePermission('courses', 'write'),
  (req, res) => controller.create(req, res)
);
router.put(
  '/:id',
  authenticateToken,
  authorizePermission('courses', 'write'),
  (req, res) => controller.update(req, res)
);
router.delete(
  '/:id',
  authenticateToken,
  authorizePermission('courses', 'delete'),
  (req, res) => controller.delete(req, res)
);

export default router;
