import { Router } from 'express';

// ── Legacy routes (Phase 1 compatible) ────────────────────────────────────────
import authRoutes from './auth';
import courseRoutes from './courses';
import inquiryRoutes from './inquiries';
import dashboardRoutes from './dashboard';
import userRoutes from './users';
import studentRoutes from './student';

// ── New enterprise module routes ───────────────────────────────────────────────
import departmentRoutes from '@modules/departments/routes/index';
import facultyRoutes from '@modules/faculty/routes/index';
import noticeRoutes from '@modules/notices/routes/index';
import eventRoutes from '@modules/events/routes/index';
import siteSettingRoutes from '@modules/site-settings/routes/index';
import pageSectionRoutes from '@modules/cms-page-builder/routes/index';

const router = Router();

// ── Auth & Users ──────────────────────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// ── Academic ──────────────────────────────────────────────────────────────────
router.use('/courses', courseRoutes);
router.use('/departments', departmentRoutes);
router.use('/faculty', facultyRoutes);
router.use('/student', studentRoutes);

// ── CRM ───────────────────────────────────────────────────────────────────────
router.use('/inquiries', inquiryRoutes);

// ── CMS ───────────────────────────────────────────────────────────────────────
router.use('/notices', noticeRoutes);
router.use('/events', eventRoutes);
router.use('/site-settings', siteSettingRoutes);
router.use('/cms/page-sections', pageSectionRoutes);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.use('/dashboard', dashboardRoutes);

// ── API info ──────────────────────────────────────────────────────────────────
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'EIILM College ERP API v1',
    modules: [
      'auth', 'users', 'courses', 'departments', 'faculty', 'student',
      'inquiries', 'notices', 'events', 'site-settings',
      'cms/page-sections', 'dashboard',
    ],
    version: '1.0.0',
  });
});

export default router;
