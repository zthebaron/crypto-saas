import { v4 as uuidv4 } from 'uuid';
import type { AlertRule } from '@crypto-saas/shared';
import { getDb } from './database';

export function createRule(userId: string, rule: Omit<AlertRule, 'id' | 'userId' | 'enabled' | 'lastTriggeredAt' | 'createdAt'>): AlertRule {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    'INSERT INTO alert_rules (id, user_id, name, condition_type, condition_config, action_type, action_config) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, userId, rule.name, rule.conditionType, JSON.stringify(rule.conditionConfig), rule.actionType, JSON.stringify(rule.actionConfig));
  return { id, userId, ...rule, enabled: true, lastTriggeredAt: null, createdAt: new Date().toISOString() };
}

export function getRules(userId: string): AlertRule[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM alert_rules WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
  return rows.map(mapRule);
}

export function getEnabledRules(): AlertRule[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM alert_rules WHERE enabled = 1').all() as any[];
  return rows.map(mapRule);
}

export function updateRule(id: string, userId: string, updates: Partial<Pick<AlertRule, 'name' | 'conditionType' | 'conditionConfig' | 'actionType' | 'actionConfig'>>): void {
  const db = getDb();
  const sets: string[] = [];
  const params: any[] = [];
  if (updates.name) { sets.push('name = ?'); params.push(updates.name); }
  if (updates.conditionType) { sets.push('condition_type = ?'); params.push(updates.conditionType); }
  if (updates.conditionConfig) { sets.push('condition_config = ?'); params.push(JSON.stringify(updates.conditionConfig)); }
  if (updates.actionType) { sets.push('action_type = ?'); params.push(updates.actionType); }
  if (updates.actionConfig) { sets.push('action_config = ?'); params.push(JSON.stringify(updates.actionConfig)); }
  if (sets.length === 0) return;
  params.push(id, userId);
  db.prepare(`UPDATE alert_rules SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`).run(...params);
}

export function toggleRule(id: string, userId: string): void {
  const db = getDb();
  db.prepare('UPDATE alert_rules SET enabled = CASE WHEN enabled = 1 THEN 0 ELSE 1 END WHERE id = ? AND user_id = ?').run(id, userId);
}

export function deleteRule(id: string, userId: string): void {
  const db = getDb();
  db.prepare('DELETE FROM alert_rules WHERE id = ? AND user_id = ?').run(id, userId);
}

export function setLastTriggered(id: string): void {
  const db = getDb();
  db.prepare("UPDATE alert_rules SET last_triggered_at = datetime('now') WHERE id = ?").run(id);
}

function mapRule(row: any): AlertRule {
  return {
    id: row.id, userId: row.user_id, name: row.name,
    conditionType: row.condition_type, conditionConfig: JSON.parse(row.condition_config),
    actionType: row.action_type, actionConfig: JSON.parse(row.action_config || '{}'),
    enabled: !!row.enabled, lastTriggeredAt: row.last_triggered_at, createdAt: row.created_at,
  };
}
