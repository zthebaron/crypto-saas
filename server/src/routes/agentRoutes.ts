import { Router } from 'express';
import { runFullPipeline, runSingleAgent, getAgentStatuses } from '../agents/coordinator';
import { getRecentReports, getReportsByRunId, getReportById } from '../models/reportModel';
import { getRecentRuns } from '../models/runModel';
import type { AgentRole } from '@crypto-saas/shared';
import { AGENT_ROLES } from '@crypto-saas/shared';

const router = Router();

// Trigger full pipeline
router.post('/run', async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const watchlist = req.body.watchlist as string[] | undefined;
    // Run async - don't block the response
    const runId = await runFullPipeline(userId, watchlist);
    res.json({ runId, message: 'Pipeline started' });
  } catch (error: any) {
    console.error('Agent run error:', error.message);
    res.status(500).json({ error: 'Failed to start agent pipeline' });
  }
});

// Trigger single agent
router.post('/run/:role', async (req, res) => {
  const role = req.params.role as AgentRole;
  if (!AGENT_ROLES.includes(role)) {
    res.status(400).json({ error: `Invalid agent role: ${role}` });
    return;
  }
  try {
    const userId = (req as any).user?.userId;
    const runId = await runSingleAgent(role, userId);
    res.json({ runId, message: `${role} agent started` });
  } catch (error: any) {
    console.error('Single agent error:', error.message);
    res.status(500).json({ error: 'Failed to start agent' });
  }
});

// Get agent statuses
router.get('/status', (_req, res) => {
  res.json({ data: getAgentStatuses() });
});

// Get recent reports
router.get('/reports', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as AgentRole | undefined;
    const data = getRecentReports(limit, role);
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get reports by run
router.get('/reports/run/:runId', (req, res) => {
  try {
    const data = getReportsByRunId(req.params.runId);
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get single report
router.get('/reports/:id', (req, res) => {
  try {
    const data = getReportById(req.params.id);
    if (!data) { res.status(404).json({ error: 'Report not found' }); return; }
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Get recent runs
router.get('/runs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const data = getRecentRuns(limit);
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch runs' });
  }
});

export default router;
