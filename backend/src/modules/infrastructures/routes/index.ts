import { Router } from 'express';
import { InfrastructureController } from '../controller/InfrastructureController';
import { authenticateToken, authorizePermission } from '@middlewares/auth';

const router = Router();
const controller = new InfrastructureController();

// Public routes
router.get('/', controller.list);
router.get('/:id', controller.getById);

// Protected routes (admin/super_admin)
router.use(authenticateToken);
router.post('/', authorizePermission('media', 'write'), controller.create);
router.put('/:id', authorizePermission('media', 'write'), controller.update);
router.delete('/:id', authorizePermission('media', 'delete'), controller.delete);

export default router;
