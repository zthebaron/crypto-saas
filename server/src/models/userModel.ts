import { v4 as uuidv4 } from 'uuid';
import type { User } from '@crypto-saas/shared';
import { getDb } from './database';

export function createUser(email: string, passwordHash: string, displayName: string): User {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    'INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)'
  ).run(id, email, passwordHash, displayName);

  return { id, email, displayName, role: 'user', tier: 'free', createdAt: new Date().toISOString() };
}

export function findUserByEmail(email: string): (User & { passwordHash: string }) | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!row) return undefined;
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role || 'user',
    tier: row.tier,
    createdAt: row.created_at,
    passwordHash: row.password_hash,
  };
}

export function findUserById(id: string): User | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!row) return undefined;
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role || 'user',
    tier: row.tier,
    createdAt: row.created_at,
  };
}

export function updateUserTier(id: string, tier: User['tier']): void {
  const db = getDb();
  db.prepare('UPDATE users SET tier = ?, updated_at = datetime(\'now\') WHERE id = ?').run(tier, id);
}

export function updateUserPassword(id: string, passwordHash: string): void {
  const db = getDb();
  db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(passwordHash, id);
}
