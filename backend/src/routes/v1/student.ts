import { Router } from 'express';
import { StudentController } from '@controllers/StudentController';
import { authenticateToken, authorizeRole } from '@middlewares/auth';

const router = Router();
const controller = new StudentController();

router.use(authenticateToken, authorizeRole(['student', 'admin', 'super_admin']));
router.get('/me', (req, res) => controller.me(req, res));
router.get('/courses', (req, res) => controller.courses(req, res));

export default router;
