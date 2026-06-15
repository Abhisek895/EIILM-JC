import { Router } from 'express';
import { InquiryController } from '@controllers/InquiryController';
import { authenticateToken, authorizePermission } from '@middlewares/auth';

const router = Router();
const controller = new InquiryController();

router.post('/', (req, res) => controller.create(req, res));
router.get(
  '/',
  authenticateToken,
  authorizePermission('inquiries', 'read'),
  (req, res) => controller.list(req, res)
);
router.put(
  '/:id',
  authenticateToken,
  authorizePermission('inquiries', 'write'),
  (req, res) => controller.update(req, res)
);

export default router;
