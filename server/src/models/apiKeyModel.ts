import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { getDb } from './database';
import type { ApiKey } from '@crypto-saas/shared';

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function generateApiKey(userId: string, name: string): ApiKey & { fullKey: string } {
  const db = getDb();
  const id = uuidv4();
  const rawKey = `bv_${crypto.randomBytes(32).toString('hex')}`;
  const prefix = rawKey.slice(0, 10);
  const keyHash = hashKey(rawKey);

  db.prepare(
    'INSERT INTO api_keys (id, user_id, name, key_hash, key_prefix) VALUES (?, ?, ?, ?, ?)'
  ).run(id, userId, name, keyHash, prefix);

  return {
    id,
    userId,
    name,
    key: prefix + '...',
    lastUsedAt: null,
    expiresAt: null,
    createdAt: new Date().toISOString(),
    fullKey: rawKey,
  };
}

export function getApiKeys(userId: string): ApiKey[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM api_keys WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
  return (rows || []).map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    name: r.name,
    key: r.key_prefix + '...',
    lastUsedAt: r.last_used_at,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
  }));
}

export function deleteApiKey(userId: string, keyId: string): void {
  const db = getDb();
  db.prepare('DELETE FROM api_keys WHERE id = ? AND user_id = ?').run(keyId, userId);
}

export function validateApiKey(rawKey: string): string | null {
  const db = getDb();
  const keyHash = hashKey(rawKey);
  const row = db.prepare('SELECT user_id FROM api_keys WHERE key_hash = ?').get(keyHash) as any;
  if (!row) return null;
  db.prepare("UPDATE api_keys SET last_used_at = datetime('now') WHERE key_hash = ?").run(keyHash);
  return row.user_id;
}
