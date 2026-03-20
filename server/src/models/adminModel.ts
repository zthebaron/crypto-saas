import { v4 as uuidv4 } from 'uuid';
import { getDb } from './database';
import type { AdminUser, AdminStats, Subscription, Payment } from '@crypto-saas/shared';

export function getAllUsers(page = 1, limit = 20, search = '', filter = 'all'): { users: AdminUser[]; total: number } {
  const db = getDb();
  let where = '1=1';
  const params: any[] = [];

  if (search) {
    where += ' AND (email LIKE ? OR display_name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (filter !== 'all') {
    where += ' AND tier = ?';
    params.push(filter);
  }

  const countRow = db.prepare(`SELECT COUNT(*) as count FROM users WHERE ${where}`).get(...params) as any;
  const total = countRow?.count || 0;

  const offset = (page - 1) * limit;
  const rows = db.prepare(
    `SELECT u.*,
      (SELECT COUNT(*) FROM agent_runs WHERE user_id = u.id) as total_runs,
      (SELECT id FROM subscriptions WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as subscription_id
    FROM users u WHERE ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, limit, offset) as any[];

  const users: AdminUser[] = (rows || []).map((r: any) => ({
    id: r.id,
    email: r.email,
    displayName: r.display_name,
    tier: r.tier,
    role: r.role || 'user',
    status: r.status || 'active',
    createdAt: r.created_at,
    lastLoginAt: r.last_login_at,
    totalRuns: r.total_runs || 0,
    subscriptionId: r.subscription_id,
  }));

  return { users, total };
}

export function getAdminStats(): AdminStats {
  const db = getDb();
  const total = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any)?.c || 0;
  const active = (db.prepare("SELECT COUNT(*) as c FROM users WHERE status = 'active'").get() as any)?.c || 0;
  const freeUsers = (db.prepare("SELECT COUNT(*) as c FROM users WHERE tier = 'free'").get() as any)?.c || 0;
  const platinumUsers = (db.prepare("SELECT COUNT(*) as c FROM users WHERE tier = 'pro'").get() as any)?.c || 0;
  const enterpriseUsers = (db.prepare("SELECT COUNT(*) as c FROM users WHERE tier = 'premium'").get() as any)?.c || 0;
  const totalRuns = (db.prepare('SELECT COUNT(*) as c FROM agent_runs').get() as any)?.c || 0;
  const totalRevenue = (db.prepare("SELECT COALESCE(SUM(amount), 0) as s FROM payments WHERE status = 'completed'").get() as any)?.s || 0;
  const monthlyRevenue = (db.prepare("SELECT COALESCE(SUM(amount), 0) as s FROM payments WHERE status = 'completed' AND created_at >= datetime('now', '-30 days')").get() as any)?.s || 0;
  const recentSignups = (db.prepare("SELECT COUNT(*) as c FROM users WHERE created_at >= datetime('now', '-7 days')").get() as any)?.c || 0;

  return { totalUsers: total, activeUsers: active, totalRevenue, monthlyRevenue, totalRuns, freeUsers, platinumUsers, enterpriseUsers, recentSignups };
}

export function updateUserRole(userId: string, role: 'user' | 'admin'): void {
  const db = getDb();
  db.prepare("UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?").run(role, userId);
}

export function updateUserStatus(userId: string, status: 'active' | 'suspended' | 'banned'): void {
  const db = getDb();
  db.prepare("UPDATE users SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, userId);
}

export function deleteUser(userId: string): void {
  const db = getDb();
  db.prepare('DELETE FROM notifications WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM portfolio_positions WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM documents WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM alert_rules WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM watchlist WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM chat_messages WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM notification_preferences WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM payments WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM subscriptions WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM api_keys WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
}

export function getSubscriptions(page = 1, limit = 20): { subscriptions: (Subscription & { email: string })[]; total: number } {
  const db = getDb();
  const total = (db.prepare('SELECT COUNT(*) as c FROM subscriptions').get() as any)?.c || 0;
  const offset = (page - 1) * limit;
  const rows = db.prepare(
    `SELECT s.*, u.email FROM subscriptions s JOIN users u ON s.user_id = u.id ORDER BY s.created_at DESC LIMIT ? OFFSET ?`
  ).all(limit, offset) as any[];

  const subscriptions = (rows || []).map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    email: r.email,
    plan: r.plan,
    status: r.status,
    paymentMethod: r.payment_method,
    stripeSubscriptionId: r.stripe_subscription_id,
    paypalSubscriptionId: r.paypal_subscription_id,
    cryptoWalletAddress: r.crypto_wallet_address,
    currentPeriodStart: r.current_period_start,
    currentPeriodEnd: r.current_period_end,
    cancelAtPeriodEnd: !!r.cancel_at_period_end,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  return { subscriptions, total };
}

export function getPayments(page = 1, limit = 20): { payments: (Payment & { email: string })[]; total: number } {
  const db = getDb();
  const total = (db.prepare('SELECT COUNT(*) as c FROM payments').get() as any)?.c || 0;
  const offset = (page - 1) * limit;
  const rows = db.prepare(
    `SELECT p.*, u.email FROM payments p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
  ).all(limit, offset) as any[];

  const payments = (rows || []).map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    email: r.email,
    subscriptionId: r.subscription_id,
    amount: r.amount,
    currency: r.currency,
    status: r.status,
    paymentMethod: r.payment_method,
    transactionId: r.transaction_id,
    metadata: JSON.parse(r.metadata || '{}'),
    createdAt: r.created_at,
  }));

  return { payments, total };
}

export function createPayment(userId: string, amount: number, method: string, txId: string | null, subId: string | null): Payment {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    'INSERT INTO payments (id, user_id, subscription_id, amount, currency, status, payment_method, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, userId, subId, amount, 'USD', 'completed', method, txId);

  return { id, userId, subscriptionId: subId, amount, currency: 'USD', status: 'completed', paymentMethod: method as any, transactionId: txId, metadata: {}, createdAt: new Date().toISOString() };
}

export function createSubscription(userId: string, plan: string, method: string): Subscription {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(
    'INSERT INTO subscriptions (id, user_id, plan, status, payment_method, current_period_start, current_period_end) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, userId, plan, 'active', method, now, end);

  // Update user tier
  const tierMap: Record<string, string> = { platinum: 'pro', enterprise: 'premium', free: 'free' };
  db.prepare("UPDATE users SET tier = ?, updated_at = datetime('now') WHERE id = ?").run(tierMap[plan] || 'free', userId);

  return { id, userId, plan: plan as any, status: 'active', paymentMethod: method as any, stripeSubscriptionId: null, paypalSubscriptionId: null, cryptoWalletAddress: null, currentPeriodStart: now, currentPeriodEnd: end, cancelAtPeriodEnd: false, createdAt: now, updatedAt: now };
}
