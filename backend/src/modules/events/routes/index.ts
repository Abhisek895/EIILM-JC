import { Router } from 'express';
import { EventController } from '../controller/EventController';
import { authenticateToken, authenticateTokenOptional, authorizePermission } from '@middlewares/auth';

const router = Router();
const ctrl = new EventController();

router.get('/', authenticateTokenOptional, (req, res) => ctrl.list(req, res));
router.get('/:id', (req, res) => ctrl.getById(req, res));
router.post('/', authenticateToken, authorizePermission('events', 'write'), (req, res) => ctrl.create(req, res));
router.put('/:id', authenticateToken, authorizePermission('events', 'write'), (req, res) => ctrl.update(req, res));
router.delete('/:id', authenticateToken, authorizePermission('events', 'delete'), (req, res) => ctrl.remove(req, res));

export default router;
