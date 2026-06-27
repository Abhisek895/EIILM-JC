import { Router } from 'express';
import { DashboardController } from '@controllers/DashboardController';
import { authenticateToken, authorizePermission } from '@middlewares/auth';

const router = Router();
const controller = new DashboardController();

// Unsecured endpoint for tracking anonymous visitors
router.post('/track', (req, res) => controller.trackPageView(req, res));

router.use(authenticateToken);

router.get(
  '/analytics',
  authorizePermission('analytics', 'read'),
  (req, res) => controller.analytics(req, res)
);

router.use(authorizePermission('dashboard', 'read'));
router.get('/stats', (req, res) => controller.stats(req, res));
router.get('/recent-inquiries', (req, res) =>
  controller.recentInquiries(req, res)
);

export default router;
