import { v4 as uuidv4 } from 'uuid';
import type { SignalOutcome, AccuracyMetrics, AgentRole } from '@crypto-saas/shared';
import { getDb } from './database';

export function createOutcome(signalId: string, coinSymbol: string, signalType: string, agentRole: string, entryPrice: number): void {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    'INSERT OR IGNORE INTO signal_outcomes (id, signal_id, coin_symbol, signal_type, agent_role, entry_price) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, signalId, coinSymbol, signalType, agentRole, entryPrice);
}

export function getUnevaluated24h(): SignalOutcome[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM signal_outcomes WHERE accurate_24h IS NULL AND created_at <= datetime('now', '-24 hours')"
  ).all() as any[];
  return rows.map(mapOutcome);
}

export function getUnevaluated7d(): SignalOutcome[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM signal_outcomes WHERE accurate_7d IS NULL AND created_at <= datetime('now', '-7 days')"
  ).all() as any[];
  return rows.map(mapOutcome);
}

export function getUnevaluated30d(): SignalOutcome[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM signal_outcomes WHERE accurate_30d IS NULL AND created_at <= datetime('now', '-30 days')"
  ).all() as any[];
  return rows.map(mapOutcome);
}

export function updateOutcome24h(signalId: string, price: number, pnl: number, accurate: boolean): void {
  const db = getDb();
  db.prepare(
    "UPDATE signal_outcomes SET price_24h = ?, pnl_24h = ?, accurate_24h = ?, evaluated_at = datetime('now') WHERE signal_id = ?"
  ).run(price, pnl, accurate ? 1 : 0, signalId);
}

export function updateOutcome7d(signalId: string, price: number, pnl: number, accurate: boolean): void {
  const db = getDb();
  db.prepare(
    "UPDATE signal_outcomes SET price_7d = ?, pnl_7d = ?, accurate_7d = ?, evaluated_at = datetime('now') WHERE signal_id = ?"
  ).run(price, pnl, accurate ? 1 : 0, signalId);
}

export function updateOutcome30d(signalId: string, price: number, pnl: number, accurate: boolean): void {
  const db = getDb();
  db.prepare(
    "UPDATE signal_outcomes SET price_30d = ?, pnl_30d = ?, accurate_30d = ?, evaluated_at = datetime('now') WHERE signal_id = ?"
  ).run(price, pnl, accurate ? 1 : 0, signalId);
}

export function getAccuracyByAgent(): AccuracyMetrics[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT agent_role,
      COUNT(*) as total,
      SUM(CASE WHEN accurate_24h = 1 THEN 1 ELSE 0 END) as acc_24h,
      SUM(CASE WHEN accurate_7d = 1 THEN 1 ELSE 0 END) as acc_7d,
      SUM(CASE WHEN accurate_30d = 1 THEN 1 ELSE 0 END) as acc_30d,
      SUM(CASE WHEN accurate_24h IS NOT NULL THEN 1 ELSE 0 END) as eval_24h,
      SUM(CASE WHEN accurate_7d IS NOT NULL THEN 1 ELSE 0 END) as eval_7d,
      SUM(CASE WHEN accurate_30d IS NOT NULL THEN 1 ELSE 0 END) as eval_30d
    FROM signal_outcomes GROUP BY agent_role
  `).all() as any[];

  return rows.map(r => ({
    agentRole: r.agent_role as AgentRole,
    totalSignals: r.total,
    accurate24h: r.acc_24h,
    accurate7d: r.acc_7d,
    accurate30d: r.acc_30d,
    accuracy24hPct: r.eval_24h > 0 ? Math.round((r.acc_24h / r.eval_24h) * 100) : 0,
    accuracy7dPct: r.eval_7d > 0 ? Math.round((r.acc_7d / r.eval_7d) * 100) : 0,
    accuracy30dPct: r.eval_30d > 0 ? Math.round((r.acc_30d / r.eval_30d) * 100) : 0,
  }));
}

export function getOverallAccuracy(): { total: number; acc24h: number; acc7d: number; acc30d: number } {
  const db = getDb();
  const row = db.prepare(`
    SELECT COUNT(*) as total,
      SUM(CASE WHEN accurate_24h = 1 THEN 1 ELSE 0 END) as acc_24h,
      SUM(CASE WHEN accurate_7d = 1 THEN 1 ELSE 0 END) as acc_7d,
      SUM(CASE WHEN accurate_30d = 1 THEN 1 ELSE 0 END) as acc_30d
    FROM signal_outcomes WHERE accurate_24h IS NOT NULL
  `).get() as any;
  return { total: row?.total ?? 0, acc24h: row?.acc_24h ?? 0, acc7d: row?.acc_7d ?? 0, acc30d: row?.acc_30d ?? 0 };
}

export function getOutcomeBySignalId(signalId: string): SignalOutcome | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM signal_outcomes WHERE signal_id = ?').get(signalId) as any;
  return row ? mapOutcome(row) : undefined;
}

function mapOutcome(row: any): SignalOutcome {
  return {
    id: row.id, signalId: row.signal_id, coinSymbol: row.coin_symbol,
    signalType: row.signal_type, agentRole: row.agent_role as AgentRole,
    entryPrice: row.entry_price, price24h: row.price_24h, price7d: row.price_7d,
    price30d: row.price_30d, pnl24h: row.pnl_24h, pnl7d: row.pnl_7d,
    pnl30d: row.pnl_30d, accurate24h: row.accurate_24h === null ? null : !!row.accurate_24h,
    accurate7d: row.accurate_7d === null ? null : !!row.accurate_7d,
    accurate30d: row.accurate_30d === null ? null : !!row.accurate_30d,
    evaluatedAt: row.evaluated_at, createdAt: row.created_at,
  };
}
