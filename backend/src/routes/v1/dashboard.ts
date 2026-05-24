import { Router } from 'express';
import { DashboardController } from '@controllers/DashboardController';
import { authenticateToken, authorizeRole } from '@middlewares/auth';

const router = Router();
const controller = new DashboardController();

router.use(authenticateToken, authorizeRole(['admin', 'super_admin']));
router.get('/stats', (req, res) => controller.stats(req, res));
router.get('/recent-inquiries', (req, res) =>
  controller.recentInquiries(req, res)
);

export default router;
