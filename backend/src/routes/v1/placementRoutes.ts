import { Router } from 'express';
import { placementController } from '@controllers/placementController';
import { authenticateToken, authorizePermission } from '@middlewares/auth';

const router = Router();

// Public routes
router.get('/', placementController.getAll);
router.get('/:id', placementController.getById);

// Protected routes (Admin / Super Admin only)
router.use(authenticateToken);
router.post('/', authenticateToken, authorizePermission('placements', 'write'), placementController.create);
router.put('/:id', authenticateToken, authorizePermission('placements', 'write'), placementController.update);
router.delete('/:id', authenticateToken, authorizePermission('placements', 'delete'), placementController.delete);

export default router;
