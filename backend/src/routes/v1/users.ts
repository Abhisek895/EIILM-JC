import { Router } from 'express';
import { UserController } from '@controllers/UserController';
import { authenticateToken, authorizeRole } from '@middlewares/auth';

const router = Router();
const controller = new UserController();

router.get(
  '/',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  (req, res) => controller.list(req, res)
);

router.get(
  '/:id',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  (req, res) => controller.get(req, res)
);

router.post(
  '/',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  (req, res) => controller.create(req, res)
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  (req, res) => controller.update(req, res)
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  (req, res) => controller.delete(req, res)
);

export default router;
