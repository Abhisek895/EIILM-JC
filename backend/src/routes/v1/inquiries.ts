import { Router } from 'express';
import { InquiryController } from '@controllers/InquiryController';
import { authenticateToken, authorizeRole } from '@middlewares/auth';

const router = Router();
const controller = new InquiryController();

router.post('/', (req, res) => controller.create(req, res));
router.get(
  '/',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  (req, res) => controller.list(req, res)
);
router.put(
  '/:id',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  (req, res) => controller.update(req, res)
);

export default router;
