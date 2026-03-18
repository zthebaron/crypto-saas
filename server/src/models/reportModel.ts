import { v4 as uuidv4 } from 'uuid';
import type { AgentReport, AgentRole } from '@crypto-saas/shared';
import { getDb } from './database';

export function createReport(
  report: Omit<AgentReport, 'id' | 'createdAt' | 'signals'>
): AgentReport {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    'INSERT INTO agent_reports (id, agent_role, content, metadata, run_id) VALUES (?, ?, ?, ?, ?)'
  ).run(id, report.agentRole, report.content, JSON.stringify(report.metadata), report.runId);

  return {
    id,
    agentRole: report.agentRole,
    content: report.content,
    signals: [],
    metadata: report.metadata,
    runId: report.runId,
    createdAt: new Date().toISOString(),
  };
}

export function getReportsByRunId(runId: string): AgentReport[] {
  const db = getDb();
  const rows = db.prepare(
    'SELECT * FROM agent_reports WHERE run_id = ? ORDER BY created_at ASC'
  ).all(runId) as any[];
  return rows.map(mapRow);
}

export function getRecentReports(limit = 20, agentRole?: AgentRole): AgentReport[] {
  const db = getDb();
  let query = 'SELECT * FROM agent_reports';
  const params: any[] = [];
  if (agentRole) {
    query += ' WHERE agent_role = ?';
    params.push(agentRole);
  }
  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);
  const rows = db.prepare(query).all(...params) as any[];
  return rows.map(mapRow);
}

export function getReportById(id: string): AgentReport | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM agent_reports WHERE id = ?').get(id) as any;
  if (!row) return undefined;
  return mapRow(row);
}

function mapRow(row: any): AgentReport {
  return {
    id: row.id,
    agentRole: row.agent_role,
    content: row.content,
    signals: [],
    metadata: JSON.parse(row.metadata || '{}'),
    runId: row.run_id,
    createdAt: row.created_at,
  };
}
