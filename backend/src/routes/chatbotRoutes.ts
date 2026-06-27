import { Router } from 'express';
import { ChatbotController } from '../controllers/ChatbotController';
import multer from 'multer';
import os from 'os';
import path from 'path';

const router = Router();

// Setup multer for temporary document uploads
const upload = multer({ dest: os.tmpdir() });

// Public API
router.post('/chat', ChatbotController.chat);

// Admin APIs (In a real scenario, these should be protected by an auth middleware checking for admin roles)
router.get('/knowledge', ChatbotController.getAllKnowledge);
router.post('/knowledge', ChatbotController.createKnowledge);
router.put('/knowledge/:id', ChatbotController.updateKnowledge);
router.delete('/knowledge/:id', ChatbotController.deleteKnowledge);

router.post('/upload', upload.single('file'), ChatbotController.uploadDocument);
router.get('/analytics', ChatbotController.getAnalytics);

export default router;
