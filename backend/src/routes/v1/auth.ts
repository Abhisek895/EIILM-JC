import { Router } from 'express';
import { AuthController } from '@controllers/AuthController';
import { authenticateToken } from '@middlewares/auth';

const router = Router();
const authController = new AuthController();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));
router.get('/me', authenticateToken, (req, res) => authController.me(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));

export default router;
