import OpenAI from 'openai';
import { ChatKnowledgeBase, ChatMessage, ChatSession } from '../models';
import { Database } from '../config/database';
import { QueryTypes } from 'sequelize';
import fs from 'fs';

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key_if_not_provided',
});

const SYSTEM_PROMPT = `You are "EIILM Assistant", the official AI assistant of the college. Under no circumstances should you refer to yourself as "ALEX" or any other name.

Always answer using the college knowledge base first.
If information is unavailable, politely say:
"I could not find official information for that query. Please contact the admission office."

Never invent fees, placement statistics, scholarship amounts, deadlines, or eligibility requirements.
Be professional, concise, and student-friendly.`;

export class ChatbotService {
  /**
   * Public Chat Interaction (RAG)
   */
  static async handleChat(sessionId: string, userIp: string, message: string) {
    // 1. Ensure Session exists
    let session = await ChatSession.findOne({ where: { session_id: sessionId } });
    if (!session) {
      session = await ChatSession.create({ session_id: sessionId, user_ip: userIp });
    }

    // 2. Save User Message
    await ChatMessage.create({ session_id: sessionId, role: 'user', message });

    // 3. Retrieve Context via MySQL Fulltext Search
    const sequelize = Database.getInstance();
    const query = `
      SELECT id, question, answer, keywords,
      MATCH(question, answer, keywords) AGAINST (:msg IN NATURAL LANGUAGE MODE) as score
      FROM chat_knowledge_base
      WHERE status = 'active' AND MATCH(question, answer, keywords) AGAINST (:msg IN NATURAL LANGUAGE MODE)
      ORDER BY score DESC
      LIMIT 3
    `;

    const records: any[] = await sequelize.query(query, {
      replacements: { msg: message },
      type: QueryTypes.SELECT,
    });

    let contextText = '';
    if (records.length > 0) {
      contextText = '--- OFFICIAL COLLEGE KNOWLEDGE BASE ---\n';
      records.forEach(r => {
        contextText += `[${r.question}]\n${r.answer}\n\n`;
      });
      contextText += '---------------------------------------';
    } else {
      // Fallback: Just grab a few top records using basic LIKE if fulltext fails to find a match
      // For short phrases fulltext sometimes fails in MySQL if below min word length.
      const likeRecords: any[] = await sequelize.query(`
        SELECT question, answer FROM chat_knowledge_base
        WHERE status = 'active' AND (question LIKE :msg OR keywords LIKE :msg)
        LIMIT 3
      `, {
        replacements: { msg: `%${message}%` },
        type: QueryTypes.SELECT,
      });
      if (likeRecords.length > 0) {
        contextText = '--- OFFICIAL COLLEGE KNOWLEDGE BASE ---\n';
        likeRecords.forEach(r => {
          contextText += `[${r.question}]\n${r.answer}\n\n`;
        });
        contextText += '---------------------------------------';
      }
    }

    // 4. Fetch Chat History
    const history = await ChatMessage.findAll({
      where: { session_id: sessionId },
      order: [['createdAt', 'ASC']],
      limit: 10,
    });

    const messages: any[] = [
      { role: 'system', content: `${SYSTEM_PROMPT}\n\n${contextText}` },
    ];

    history.forEach(h => {
      messages.push({ role: h.role, content: h.message });
    });

    // 5. Call OpenAI
    try {
      if (!process.env.OPENAI_API_KEY) {
        // Fallback for demonstration if no API key is provided
        const answer = contextText ? "Based on our records: " + records[0]?.answer : "I could not find official information for that query. Please contact the admission office.";
        await ChatMessage.create({ session_id: sessionId, role: 'assistant', message: answer });
        return answer;
      }

      const response = await openai.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.3,
      });

      const answer = response.choices[0]?.message?.content || 'Sorry, I am unable to process that request right now.';
      
      // 6. Save AI Response
      await ChatMessage.create({ session_id: sessionId, role: 'assistant', message: answer });

      return answer;
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Document Processing
   */
  static async processDocumentUpload(filePath: string, originalName: string, mimeType: string) {
    let extractedText = '';

    if (mimeType === 'application/pdf' || originalName.endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      originalName.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else if (mimeType === 'text/plain' || originalName.endsWith('.txt')) {
      extractedText = fs.readFileSync(filePath, 'utf8');
    } else {
      throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT.');
    }

    // Simple chunking (split by double newlines)
    const chunks = extractedText.split(/\n\s*\n/).filter(chunk => chunk.trim().length > 30);

    const records = [];
    for (const chunk of chunks) {
      // Limit chunk size if it's too large
      const safeChunk = chunk.substring(0, 1500).trim();
      const record = await ChatKnowledgeBase.create({
        category: 'Document Import',
        question: `Extracted from: ${originalName}`,
        answer: safeChunk,
        keywords: originalName,
        source: originalName,
      });
      records.push(record);
    }

    // Clean up uploaded temp file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return records.length;
  }
}
