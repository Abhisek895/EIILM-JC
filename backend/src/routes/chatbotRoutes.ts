import { Router } from 'express';
import { ChatbotController } from '../controllers/ChatbotController';
import { authenticateToken, authorizeRole } from '@middlewares/auth';
import multer from 'multer';
import os from 'os';
import path from 'path';

const router = Router();

// Setup secure multer for temporary document uploads
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.pdf', '.docx', '.txt'];
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  },
});

// ─── Public Endpoint ─────────────────────────────────────────────────────────
router.post('/chat', ChatbotController.chat);

// ─── Protected Admin Endpoints ───────────────────────────────────────────────
// Requires valid authentication and admin / super_admin role
router.get(
  '/knowledge',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  ChatbotController.getAllKnowledge
);

router.post(
  '/knowledge',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  ChatbotController.createKnowledge
);

router.put(
  '/knowledge/:id',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  ChatbotController.updateKnowledge
);

router.delete(
  '/knowledge/:id',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  ChatbotController.deleteKnowledge
);

router.post(
  '/upload',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  upload.single('file'),
  ChatbotController.uploadDocument
);

router.get(
  '/analytics',
  authenticateToken,
  authorizeRole(['admin', 'super_admin']),
  ChatbotController.getAnalytics
);

export default router;
