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

// ── Secure Password Change with OTP ──────────────────────────────────────────
router.post('/change-password/request-otp', authenticateToken, (req, res) => authController.requestChangePasswordOtp(req, res));
router.post('/change-password/verify-otp', authenticateToken, (req, res) => authController.verifyChangePasswordOtp(req, res));

export default router;
