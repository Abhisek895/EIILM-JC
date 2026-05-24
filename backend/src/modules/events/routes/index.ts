import { Router } from 'express';
import { EventController } from '../controller/EventController';
import { authenticateToken, authenticateTokenOptional, authorizeRole } from '@middlewares/auth';

const router = Router();
const ctrl = new EventController();

router.get('/', authenticateTokenOptional, (req, res) => ctrl.list(req, res));
router.get('/:id', (req, res) => ctrl.getById(req, res));
router.post('/', authenticateToken, authorizeRole(['admin', 'super_admin']), (req, res) => ctrl.create(req, res));
router.put('/:id', authenticateToken, authorizeRole(['admin', 'super_admin']), (req, res) => ctrl.update(req, res));
router.delete('/:id', authenticateToken, authorizeRole(['admin', 'super_admin']), (req, res) => ctrl.remove(req, res));

export default router;
