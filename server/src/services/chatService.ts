import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'crypto';
import { config } from '../config';
import { getDb } from '../models/database';
import type { ChatMessage } from '@crypto-saas/shared';

const client = new Anthropic({ apiKey: config.anthropicApiKey });

const SYSTEM_PROMPT = `You are BlockView AI, a crypto market research assistant built into the BlockView platform. You help users understand cryptocurrency markets, analyze trends, and interpret signals from BlockView's AI agent pipeline.

You have access to context about recent market data, agent reports, and trading signals that may be provided in the conversation. Use this to give informed, specific answers.

Guidelines:
- Be concise and actionable in your responses
- When discussing specific coins, mention relevant data points (price, % change, volume)
- Always clarify that you provide research and analysis, NOT financial advice
- If asked about features of BlockView, explain the agent pipeline: Market Scanner → Sentiment Analyst → Risk Assessor → Opportunity Scout → Portfolio Advisor
- Use markdown formatting for clarity (bold, lists, tables when appropriate)
- Keep responses focused and under 500 words unless the user asks for detailed analysis`;

export async function getRecentContext(): Promise<string> {
  const db = getDb();
  const parts: string[] = [];

  // Get latest agent reports
  const reports = db.prepare(
    'SELECT agent_role, content, created_at FROM agent_reports ORDER BY created_at DESC LIMIT 5'
  ).all();

  if (reports.length > 0) {
    parts.push('## Recent Agent Reports');
    for (const r of reports) {
      parts.push(`### ${(r.agent_role as string).replace('_', ' ').toUpperCase()} (${r.created_at})`);
      // Truncate long reports
      const content = (r.content as string).slice(0, 800);
      parts.push(content);
    }
  }

  // Get latest signals
  const signals = db.prepare(
    'SELECT coin_symbol, type, confidence, reasoning, agent_role FROM signals ORDER BY created_at DESC LIMIT 10'
  ).all();

  if (signals.length > 0) {
    parts.push('\n## Recent Signals');
    for (const s of signals) {
      parts.push(`- **${s.coin_symbol}**: ${(s.type as string).toUpperCase()} (${s.confidence}% confidence) — ${(s.reasoning as string).slice(0, 100)}`);
    }
  }

  return parts.join('\n');
}

export function getChatHistory(userId: string | null, limit = 20): ChatMessage[] {
  const db = getDb();
  const userClause = userId ? 'WHERE user_id = ?' : 'WHERE user_id IS NULL';
  const params = userId ? [userId] : [];
  const rows = db.prepare(
    `SELECT id, role, content, created_at FROM chat_messages ${userClause} ORDER BY created_at DESC LIMIT ?`
  ).all(...params, limit);

  return rows.reverse().map((r: any) => ({
    id: r.id,
    role: r.role,
    content: r.content,
    createdAt: r.created_at,
  }));
}

export function saveChatMessage(userId: string | null, role: 'user' | 'assistant', content: string): string {
  const db = getDb();
  const id = randomUUID();
  db.prepare(
    'INSERT INTO chat_messages (id, user_id, role, content) VALUES (?, ?, ?, ?)'
  ).run(id, userId, role, content);
  return id;
}

export async function* streamChatResponse(
  messages: { role: 'user' | 'assistant'; content: string }[],
  context: string
): AsyncGenerator<string, void, unknown> {
  const systemWithContext = context
    ? `${SYSTEM_PROMPT}\n\n---\n\n## Current Platform Context\n${context}`
    : SYSTEM_PROMPT;

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemWithContext,
    messages,
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text;
    }
  }
}
