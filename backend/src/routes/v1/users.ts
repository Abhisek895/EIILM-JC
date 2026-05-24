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

export default router;
