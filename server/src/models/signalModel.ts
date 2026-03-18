import { v4 as uuidv4 } from 'uuid';
import type { Signal, SignalType, AgentRole } from '@crypto-saas/shared';
import { getDb } from './database';

export function createSignal(signal: Omit<Signal, 'id' | 'createdAt'>): Signal {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    `INSERT INTO signals (id, coin_symbol, coin_name, type, confidence, reasoning, agent_role, timeframe, run_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, signal.coinSymbol, signal.coinName, signal.type,
    signal.confidence, signal.reasoning, signal.agentRole,
    signal.timeframe, signal.runId
  );

  return { ...signal, id, createdAt: new Date().toISOString() };
}

export interface SignalFilters {
  type?: SignalType;
  coinSymbol?: string;
  agentRole?: AgentRole;
  minConfidence?: number;
}

export function getRecentSignals(limit = 50, filters?: SignalFilters): Signal[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters?.type) { conditions.push('type = ?'); params.push(filters.type); }
  if (filters?.coinSymbol) { conditions.push('coin_symbol = ?'); params.push(filters.coinSymbol); }
  if (filters?.agentRole) { conditions.push('agent_role = ?'); params.push(filters.agentRole); }
  if (filters?.minConfidence) { conditions.push('confidence >= ?'); params.push(filters.minConfidence); }

  let query = 'SELECT * FROM signals';
  if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);

  const rows = db.prepare(query).all(...params) as any[];
  return rows.map(mapRow);
}

export function getSignalsByRunId(runId: string): Signal[] {
  const db = getDb();
  const rows = db.prepare(
    'SELECT * FROM signals WHERE run_id = ? ORDER BY confidence DESC'
  ).all(runId) as any[];
  return rows.map(mapRow);
}

export function getTopSignals(limit = 10): Signal[] {
  const db = getDb();
  const rows = db.prepare(
    `SELECT * FROM signals
     WHERE created_at > datetime('now', '-24 hours')
     ORDER BY confidence DESC LIMIT ?`
  ).all(limit) as any[];
  return rows.map(mapRow);
}

function mapRow(row: any): Signal {
  return {
    id: row.id,
    coinSymbol: row.coin_symbol,
    coinName: row.coin_name,
    type: row.type,
    confidence: row.confidence,
    reasoning: row.reasoning,
    agentRole: row.agent_role,
    timeframe: row.timeframe,
    runId: row.run_id,
    createdAt: row.created_at,
  };
}
