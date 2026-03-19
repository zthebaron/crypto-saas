import { v4 as uuidv4 } from 'uuid';
import type { Notification, NotificationPreferences } from '@crypto-saas/shared';
import { getDb } from './database';

export function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  body: string
): Notification {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    'INSERT INTO notifications (id, user_id, type, title, body) VALUES (?, ?, ?, ?, ?)'
  ).run(id, userId, type, title, body);
  return { id, userId, type, title, body, read: false, createdAt: new Date().toISOString() };
}

export function getNotifications(userId: string, limit = 50): Notification[] {
  const db = getDb();
  const rows = db.prepare(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
  ).all(userId, limit) as any[];
  return rows.map(mapNotification);
}

export function getUnreadCount(userId: string): number {
  const db = getDb();
  const row = db.prepare(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0'
  ).get(userId) as any;
  return row?.count ?? 0;
}

export function markRead(id: string, userId: string): void {
  const db = getDb();
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(id, userId);
}

export function markAllRead(userId: string): void {
  const db = getDb();
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0').run(userId);
}

export function getPreferences(userId: string): NotificationPreferences {
  const db = getDb();
  const row = db.prepare('SELECT * FROM notification_preferences WHERE user_id = ?').get(userId) as any;
  if (!row) {
    return {
      userId,
      pushEnabled: false,
      emailEnabled: false,
      signalConfidenceThreshold: 80,
      priceChangeThreshold: 10,
      digestFrequency: 'daily',
    };
  }
  return {
    userId: row.user_id,
    pushEnabled: !!row.push_enabled,
    emailEnabled: !!row.email_enabled,
    signalConfidenceThreshold: row.signal_confidence_threshold,
    priceChangeThreshold: row.price_change_threshold,
    digestFrequency: row.digest_frequency,
  };
}

export function upsertPreferences(userId: string, prefs: Partial<NotificationPreferences>): void {
  const db = getDb();
  const existing = db.prepare('SELECT user_id FROM notification_preferences WHERE user_id = ?').get(userId);
  if (existing) {
    const sets: string[] = [];
    const params: any[] = [];
    if (prefs.pushEnabled !== undefined) { sets.push('push_enabled = ?'); params.push(prefs.pushEnabled ? 1 : 0); }
    if (prefs.emailEnabled !== undefined) { sets.push('email_enabled = ?'); params.push(prefs.emailEnabled ? 1 : 0); }
    if (prefs.signalConfidenceThreshold !== undefined) { sets.push('signal_confidence_threshold = ?'); params.push(prefs.signalConfidenceThreshold); }
    if (prefs.priceChangeThreshold !== undefined) { sets.push('price_change_threshold = ?'); params.push(prefs.priceChangeThreshold); }
    if (prefs.digestFrequency !== undefined) { sets.push('digest_frequency = ?'); params.push(prefs.digestFrequency); }
    if (sets.length > 0) {
      params.push(userId);
      db.prepare(`UPDATE notification_preferences SET ${sets.join(', ')} WHERE user_id = ?`).run(...params);
    }
  } else {
    db.prepare(
      'INSERT INTO notification_preferences (user_id, push_enabled, email_enabled, signal_confidence_threshold, price_change_threshold, digest_frequency) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      userId,
      prefs.pushEnabled ? 1 : 0,
      prefs.emailEnabled ? 1 : 0,
      prefs.signalConfidenceThreshold ?? 80,
      prefs.priceChangeThreshold ?? 10,
      prefs.digestFrequency ?? 'daily'
    );
  }
}

export function savePushSubscription(userId: string, subscription: string): void {
  const db = getDb();
  const existing = db.prepare('SELECT user_id FROM notification_preferences WHERE user_id = ?').get(userId);
  if (existing) {
    db.prepare('UPDATE notification_preferences SET push_subscription = ?, push_enabled = 1 WHERE user_id = ?').run(subscription, userId);
  } else {
    db.prepare(
      'INSERT INTO notification_preferences (user_id, push_enabled, push_subscription) VALUES (?, 1, ?)'
    ).run(userId, subscription);
  }
}

export function getPushSubscriptions(): { userId: string; subscription: string }[] {
  const db = getDb();
  const rows = db.prepare(
    'SELECT user_id, push_subscription FROM notification_preferences WHERE push_enabled = 1 AND push_subscription IS NOT NULL'
  ).all() as any[];
  return rows.map(r => ({ userId: r.user_id, subscription: r.push_subscription }));
}

function mapNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    read: !!row.read,
    createdAt: row.created_at,
  };
}
