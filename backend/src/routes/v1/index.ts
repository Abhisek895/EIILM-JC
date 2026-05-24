import { Router } from 'express';
import authRoutes from './auth';
import courseRoutes from './courses';
import inquiryRoutes from './inquiries';
import dashboardRoutes from './dashboard';
import userRoutes from './users';
import studentRoutes from './student';

const router = Router();

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);
router.use('/student', studentRoutes);
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'College ERP API v1',
    modules: ['auth', 'courses', 'inquiries', 'dashboard', 'users', 'student'],
  });
});

export default router;
