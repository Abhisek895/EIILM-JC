import { Router } from 'express';
import { StudentController } from '@controllers/StudentController';
import { authenticateToken, authorizeRole } from '@middlewares/auth';

const router = Router();
const controller = new StudentController();

router.use(authenticateToken, authorizeRole(['student', 'admin', 'super_admin', 'faculty']));
router.get('/me', (req, res) => controller.me(req, res));
router.get('/courses', (req, res) => controller.courses(req, res));
router.get('/grades', (req, res) => controller.grades(req, res));
router.get('/fees', (req, res) => controller.fees(req, res));
router.post('/fees/pay', (req, res) => controller.payFee(req, res));

export default router;
