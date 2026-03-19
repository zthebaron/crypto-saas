import { v4 as uuidv4 } from 'uuid';
import type { PortfolioPosition, PortfolioSnapshot } from '@crypto-saas/shared';
import { getDb } from './database';

export function createPosition(
  userId: string,
  coinSymbol: string,
  coinName: string,
  entryPrice: number,
  quantity: number,
  signalId?: string
): PortfolioPosition {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    'INSERT INTO portfolio_positions (id, user_id, coin_symbol, coin_name, entry_price, quantity, signal_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, userId, coinSymbol, coinName, entryPrice, quantity, signalId || null);
  return {
    id, userId, coinSymbol, coinName, entryPrice, quantity,
    signalId: signalId || null, status: 'open',
    openedAt: new Date().toISOString(), closedAt: null, closePrice: null,
  };
}

export function getPositions(userId: string, status?: 'open' | 'closed'): PortfolioPosition[] {
  const db = getDb();
  let query = 'SELECT * FROM portfolio_positions WHERE user_id = ?';
  const params: any[] = [userId];
  if (status) { query += ' AND status = ?'; params.push(status); }
  query += ' ORDER BY opened_at DESC';
  const rows = db.prepare(query).all(...params) as any[];
  return rows.map(mapPosition);
}

export function closePosition(id: string, userId: string, closePrice: number): void {
  const db = getDb();
  db.prepare(
    "UPDATE portfolio_positions SET status = 'closed', close_price = ?, closed_at = datetime('now') WHERE id = ? AND user_id = ?"
  ).run(closePrice, id, userId);
}

export function deletePosition(id: string, userId: string): void {
  const db = getDb();
  db.prepare('DELETE FROM portfolio_positions WHERE id = ? AND user_id = ?').run(id, userId);
}

export function getPositionById(id: string): PortfolioPosition | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM portfolio_positions WHERE id = ?').get(id) as any;
  return row ? mapPosition(row) : undefined;
}

export function createSnapshot(userId: string, totalValue: number, totalPnl: number, snapshotData: string): PortfolioSnapshot {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    'INSERT INTO portfolio_snapshots (id, user_id, total_value, total_pnl, snapshot_data) VALUES (?, ?, ?, ?, ?)'
  ).run(id, userId, totalValue, totalPnl, snapshotData);
  return { id, userId, totalValue, totalPnl, snapshotData, createdAt: new Date().toISOString() };
}

export function getSnapshots(userId: string, limit = 30): PortfolioSnapshot[] {
  const db = getDb();
  const rows = db.prepare(
    'SELECT * FROM portfolio_snapshots WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
  ).all(userId, limit) as any[];
  return rows.map(r => ({
    id: r.id, userId: r.user_id, totalValue: r.total_value,
    totalPnl: r.total_pnl, snapshotData: r.snapshot_data, createdAt: r.created_at,
  }));
}

export function getAllUsersWithPositions(): string[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT DISTINCT user_id FROM portfolio_positions WHERE status = 'open'"
  ).all() as any[];
  return rows.map(r => r.user_id);
}

function mapPosition(row: any): PortfolioPosition {
  return {
    id: row.id, userId: row.user_id, coinSymbol: row.coin_symbol,
    coinName: row.coin_name, entryPrice: row.entry_price, quantity: row.quantity,
    signalId: row.signal_id, status: row.status, openedAt: row.opened_at,
    closedAt: row.closed_at, closePrice: row.close_price,
  };
}
