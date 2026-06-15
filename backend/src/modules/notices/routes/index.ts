import { Router } from 'express';
import { NoticeController } from '../controller/NoticeController';
import { uploadCloud } from '@middlewares/uploadCloud';
import {
  authenticateToken,
  authenticateTokenOptional,
  authorizePermission,
} from '@middlewares/auth';

const router = Router();
const ctrl = new NoticeController();

// Public (shows published only) or admin (shows all)
router.get('/', authenticateTokenOptional, (req, res) => ctrl.list(req, res));
router.get('/:id', (req, res) => ctrl.getById(req, res));

router.post(
  '/',
  authenticateToken,
  authorizePermission('notices', 'write'),
  uploadCloud.single('file'),
  (req, res) => ctrl.create(req, res)
);
router.put(
  '/:id',
  authenticateToken,
  authorizePermission('notices', 'write'),
  uploadCloud.single('file'),
  (req, res) => ctrl.update(req, res)
);
router.delete(
  '/:id',
  authenticateToken,
  authorizePermission('notices', 'delete'),
  (req, res) => ctrl.remove(req, res)
);

export default router;
