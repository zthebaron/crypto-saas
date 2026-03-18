import { Router } from 'express';
import { getRecentSignals, getSignalsByRunId, getTopSignals } from '../models/signalModel';
import type { SignalType, AgentRole } from '@crypto-saas/shared';

const router = Router();

router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const filters: any = {};
    if (req.query.type) filters.type = req.query.type as SignalType;
    if (req.query.coin) filters.coinSymbol = (req.query.coin as string).toUpperCase();
    if (req.query.agent) filters.agentRole = req.query.agent as AgentRole;
    if (req.query.minConfidence) filters.minConfidence = parseInt(req.query.minConfidence as string);
    const data = getRecentSignals(limit, filters);
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch signals' });
  }
});

router.get('/top', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const data = getTopSignals(limit);
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch top signals' });
  }
});

router.get('/run/:runId', (req, res) => {
  try {
    const data = getSignalsByRunId(req.params.runId);
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch signals' });
  }
});

export default router;
