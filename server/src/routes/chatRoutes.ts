import { Router } from 'express';
import { getChatHistory, saveChatMessage, streamChatResponse, getRecentContext } from '../services/chatService';

const router = Router();

// POST /api/chat — send message, stream response via SSE
router.post('/', async (req, res) => {
  const userId = (req as any).user?.userId || null;
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Save user message
  saveChatMessage(userId, 'user', message.trim());

  // Build conversation history for Claude
  const history = getChatHistory(userId, 20);
  const messages = history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  // Get platform context (recent reports, signals)
  const context = await getRecentContext();

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  let fullResponse = '';

  try {
    for await (const chunk of streamChatResponse(messages, context)) {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
    }

    // Save complete assistant response
    saveChatMessage(userId, 'assistant', fullResponse);

    res.write(`data: ${JSON.stringify({ chunk: '', done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error('Chat stream error:', err);
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate response', done: true })}\n\n`);
    res.end();
  }
});

// GET /api/chat/history — get conversation history
router.get('/history', (req, res) => {
  const userId = (req as any).user?.userId || null;
  const limit = parseInt(req.query.limit as string) || 50;
  const messages = getChatHistory(userId, limit);
  res.json({ data: messages });
});

// DELETE /api/chat/history — clear conversation
router.delete('/history', (req, res) => {
  const userId = (req as any).user?.userId || null;
  const { getDb } = require('../models/database');
  const db = getDb();
  const userClause = userId ? 'WHERE user_id = ?' : 'WHERE user_id IS NULL';
  const params = userId ? [userId] : [];
  db.prepare(`DELETE FROM chat_messages ${userClause}`).run(...params);
  res.json({ message: 'Chat history cleared' });
});

export default router;
