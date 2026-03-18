import type { WatchlistItem } from '@crypto-saas/shared';
import { getDb } from './database';

export function addToWatchlist(userId: string, coinId: number, coinSymbol: string, coinName: string): void {
  const db = getDb();
  db.prepare(
    'INSERT OR IGNORE INTO watchlist (user_id, coin_id, coin_symbol, coin_name) VALUES (?, ?, ?, ?)'
  ).run(userId, coinId, coinSymbol, coinName);
}

export function removeFromWatchlist(userId: string, coinId: number): void {
  const db = getDb();
  db.prepare('DELETE FROM watchlist WHERE user_id = ? AND coin_id = ?').run(userId, coinId);
}

export function getWatchlist(userId: string): WatchlistItem[] {
  const db = getDb();
  const rows = db.prepare(
    'SELECT * FROM watchlist WHERE user_id = ? ORDER BY added_at DESC'
  ).all(userId) as any[];
  return rows.map(row => ({
    userId: row.user_id,
    coinId: row.coin_id,
    coinSymbol: row.coin_symbol,
    coinName: row.coin_name,
    addedAt: row.added_at,
  }));
}
