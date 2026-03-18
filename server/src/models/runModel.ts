import { v4 as uuidv4 } from 'uuid';
import type { AgentRun } from '@crypto-saas/shared';
import { getDb } from './database';

export function createAgentRun(userId?: string): AgentRun {
  const db = getDb();
  const id = uuidv4();
  db.prepare('INSERT INTO agent_runs (id, user_id) VALUES (?, ?)').run(id, userId || null);
  return {
    id,
    userId: userId || null,
    status: 'running',
    startedAt: new Date().toISOString(),
    completedAt: null,
  };
}

export function completeAgentRun(runId: string, status: 'completed' | 'error' = 'completed'): void {
  const db = getDb();
  db.prepare(
    "UPDATE agent_runs SET status = ?, completed_at = datetime('now') WHERE id = ?"
  ).run(status, runId);
}

export function getRecentRuns(limit = 20): AgentRun[] {
  const db = getDb();
  const rows = db.prepare(
    'SELECT * FROM agent_runs ORDER BY started_at DESC LIMIT ?'
  ).all(limit) as any[];
  return rows.map(mapRow);
}

export function getTodayRunCount(userId: string): number {
  const db = getDb();
  const row = db.prepare(
    "SELECT COUNT(*) as count FROM agent_runs WHERE user_id = ? AND started_at > datetime('now', '-1 day')"
  ).get(userId) as any;
  return row.count;
}

function mapRow(row: any): AgentRun {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}
