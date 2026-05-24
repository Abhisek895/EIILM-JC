import { Router } from 'express';
import { FacultyController } from '../controller/FacultyController';
import { authenticateToken, authorizeRole } from '@middlewares/auth';

const router = Router();
const ctrl = new FacultyController();

router.get('/', (req, res) => ctrl.list(req, res));
router.get('/:id', (req, res) => ctrl.getById(req, res));

router.post(
  '/',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  (req, res) => ctrl.create(req, res)
);
router.put(
  '/:id',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  (req, res) => ctrl.update(req, res)
);
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  (req, res) => ctrl.remove(req, res)
);

export default router;
