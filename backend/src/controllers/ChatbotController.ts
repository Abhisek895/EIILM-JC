import { Request, Response } from 'express';
import { ChatbotService } from '../services/ChatbotService';
import { ChatKnowledgeBase, ChatSession, ChatMessage } from '../models';

export class ChatbotController {
  /**
   * Public Endpoint: Send a message to the AI
   */
  static async chat(req: Request, res: Response) {
    try {
      const { message, sessionId } = req.body;
      if (!message || !sessionId) {
        return res.status(400).json({ success: false, error: 'message and sessionId are required' });
      }

      const userIp = req.ip || req.connection.remoteAddress || 'unknown';
      const answer = await ChatbotService.handleChat(sessionId, userIp, message);

      return res.status(200).json({ success: true, answer });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Admin: Get all knowledge records
   */
  static async getAllKnowledge(req: Request, res: Response) {
    try {
      const records = await ChatKnowledgeBase.findAll({ order: [['createdAt', 'DESC']] });
      return res.status(200).json({ success: true, data: records });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Admin: Create a new manual knowledge record
   */
  static async createKnowledge(req: Request, res: Response) {
    try {
      const { category, question, answer, keywords, status } = req.body;
      const record = await ChatKnowledgeBase.create({
        category,
        question,
        answer,
        keywords,
        status: status || 'active',
        source: 'manual',
      });
      return res.status(201).json({ success: true, data: record });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Admin: Update knowledge
   */
  static async updateKnowledge(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { category, question, answer, keywords, status } = req.body;
      const record = await ChatKnowledgeBase.findByPk(id);
      if (!record) return res.status(404).json({ success: false, error: 'Not found' });

      await record.update({ category, question, answer, keywords, status });
      return res.status(200).json({ success: true, data: record });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Admin: Delete knowledge
   */
  static async deleteKnowledge(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const record = await ChatKnowledgeBase.findByPk(id);
      if (!record) return res.status(404).json({ success: false, error: 'Not found' });

      await record.destroy();
      return res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Admin: Upload PDF/DOCX for extraction
   */
  static async uploadDocument(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const filePath = req.file.path;
      const originalName = req.file.originalname;
      const mimeType = req.file.mimetype;

      const chunkCount = await ChatbotService.processDocumentUpload(filePath, originalName, mimeType);

      return res.status(200).json({ 
        success: true, 
        message: `Successfully extracted ${chunkCount} knowledge chunks from ${originalName}.` 
      });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Admin: Chat Analytics
   */
  static async getAnalytics(req: Request, res: Response) {
    try {
      const totalSessions = await ChatSession.count();
      const totalMessages = await ChatMessage.count();
      
      return res.status(200).json({
        success: true,
        data: {
          totalSessions,
          totalMessages,
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
