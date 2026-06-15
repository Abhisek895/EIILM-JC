import { Router } from 'express';
import { FacultyController } from '../controller/FacultyController';
import { authenticateToken, authorizePermission } from '@middlewares/auth';

const router = Router();
const ctrl = new FacultyController();

router.get('/', (req, res) => ctrl.list(req, res));
router.get('/:id', (req, res) => ctrl.getById(req, res));

router.post(
  '/',
  authenticateToken,
  authorizePermission('faculty', 'write'),
  (req, res) => ctrl.create(req, res)
);
router.put(
  '/:id',
  authenticateToken,
  authorizePermission('faculty', 'write'),
  (req, res) => ctrl.update(req, res)
);
router.delete(
  '/:id',
  authenticateToken,
  authorizePermission('faculty', 'delete'),
  (req, res) => ctrl.remove(req, res)
);

export default router;
