import { Router } from 'express';
import * as outcomeModel from '../models/outcomeModel';
import type { AgentLeaderboard } from '@crypto-saas/shared';

const router = Router();

// Overall accuracy
router.get('/', (_req, res) => {
  const overall = outcomeModel.getOverallAccuracy();
  res.json({
    data: {
      totalSignals: overall.total,
      accuracy24hPct: overall.total > 0 ? Math.round((overall.acc24h / overall.total) * 100) : 0,
      accuracy7dPct: overall.total > 0 ? Math.round((overall.acc7d / overall.total) * 100) : 0,
      accuracy30dPct: overall.total > 0 ? Math.round((overall.acc30d / overall.total) * 100) : 0,
    },
  });
});

// Per-agent accuracy
router.get('/agents', (_req, res) => {
  const metrics = outcomeModel.getAccuracyByAgent();
  res.json({ data: metrics });
});

// Leaderboard
router.get('/leaderboard', (_req, res) => {
  const metrics = outcomeModel.getAccuracyByAgent();
  if (metrics.length === 0) {
    return res.json({ data: { agents: [], topPerformer: null, averageAccuracy: 0 } });
  }
  const sorted = [...metrics].sort((a, b) => b.accuracy24hPct - a.accuracy24hPct);
  const avg = sorted.reduce((sum, m) => sum + m.accuracy24hPct, 0) / sorted.length;
  const leaderboard: AgentLeaderboard = {
    agents: sorted,
    topPerformer: sorted[0].agentRole,
    averageAccuracy: Math.round(avg),
  };
  res.json({ data: leaderboard });
});

// Outcome for a specific signal
router.get('/signals/:signalId', (req, res) => {
  const outcome = outcomeModel.getOutcomeBySignalId(req.params.signalId);
  if (!outcome) return res.status(404).json({ error: 'No outcome found' });
  res.json({ data: outcome });
});

export default router;
