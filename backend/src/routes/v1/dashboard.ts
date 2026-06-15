import { Router } from 'express';
import { DashboardController } from '@controllers/DashboardController';
import { authenticateToken, authorizePermission } from '@middlewares/auth';

const router = Router();
const controller = new DashboardController();

router.use(authenticateToken, authorizePermission('dashboard', 'read'));
router.get('/stats', (req, res) => controller.stats(req, res));
router.get('/recent-inquiries', (req, res) =>
  controller.recentInquiries(req, res)
);

export default router;
