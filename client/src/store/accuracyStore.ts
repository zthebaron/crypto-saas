import { create } from 'zustand';
import { accuracy as accApi } from '../services/api';
import type { AccuracyMetrics, AgentLeaderboard } from '@crypto-saas/shared';

interface AccuracyState {
  overall: { totalSignals: number; accuracy24hPct: number; accuracy7dPct: number; accuracy30dPct: number } | null;
  byAgent: AccuracyMetrics[];
  leaderboard: AgentLeaderboard | null;
  loading: boolean;
  fetchAll: () => Promise<void>;
}

export const useAccuracyStore = create<AccuracyState>((set) => ({
  overall: null,
  byAgent: [],
  leaderboard: null,
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [overall, byAgent, leaderboard] = await Promise.all([
        accApi.getOverall(),
        accApi.getByAgent(),
        accApi.getLeaderboard(),
      ]);
      set({ overall, byAgent, leaderboard, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
