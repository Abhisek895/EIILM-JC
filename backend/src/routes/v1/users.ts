import { Router } from 'express';
import { UserController } from '@controllers/UserController';
import { authenticateToken, authorizePermission, AuthRequest } from '@middlewares/auth';

const router = Router();
const controller = new UserController();

router.get(
  '/',
  authenticateToken,
  authorizePermission('users', 'read'),
  (req, res) => controller.list(req, res)
);

router.get(
  '/:id',
  authenticateToken,
  authorizePermission('users', 'read'),
  (req, res) => controller.get(req, res)
);

router.post(
  '/',
  authenticateToken,
  authorizePermission('users', 'write'),
  (req, res) => controller.create(req as AuthRequest, res)
);

router.put(
  '/:id',
  authenticateToken,
  authorizePermission('users', 'write'),
  (req, res) => controller.update(req as AuthRequest, res)
);

router.delete(
  '/:id',
  authenticateToken,
  authorizePermission('users', 'delete'),
  (req, res) => controller.delete(req as AuthRequest, res)
);

export default router;
