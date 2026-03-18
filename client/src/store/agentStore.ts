import { create } from 'zustand';
import type { AgentReport, Signal, AgentRole, AgentStatus, AgentRun } from '@crypto-saas/shared';
import { agents as agentsApi, signals as signalsApi } from '../services/api';

interface AgentState {
  reports: AgentReport[];
  signals: Signal[];
  topSignals: Signal[];
  agentStatuses: Record<AgentRole, AgentStatus>;
  runs: AgentRun[];
  pipelineRunning: boolean;
  loading: boolean;
  error: string | null;
  triggerRun: (watchlist?: string[]) => Promise<void>;
  fetchReports: (limit?: number) => Promise<void>;
  fetchReportsByRun: (runId: string) => Promise<AgentReport[]>;
  fetchSignals: (limit?: number) => Promise<void>;
  fetchTopSignals: () => Promise<void>;
  fetchStatus: () => Promise<void>;
  fetchRuns: () => Promise<void>;
  updateAgentStatus: (role: AgentRole, status: AgentStatus) => void;
  setPipelineRunning: (running: boolean) => void;
}

const defaultStatuses: Record<AgentRole, AgentStatus> = {
  market_scanner: 'idle',
  sentiment_analyst: 'idle',
  risk_assessor: 'idle',
  opportunity_scout: 'idle',
  portfolio_advisor: 'idle',
};

export const useAgentStore = create<AgentState>((set, get) => ({
  reports: [],
  signals: [],
  topSignals: [],
  agentStatuses: { ...defaultStatuses },
  runs: [],
  pipelineRunning: false,
  loading: false,
  error: null,

  triggerRun: async (watchlist) => {
    set({ pipelineRunning: true, error: null });
    try {
      await agentsApi.triggerRun(watchlist);
    } catch (err: any) {
      set({ error: 'Failed to trigger pipeline', pipelineRunning: false });
    }
  },

  fetchReports: async (limit = 20) => {
    try {
      const reports = await agentsApi.getReports(limit);
      set({ reports });
    } catch { set({ error: 'Failed to fetch reports' }); }
  },

  fetchReportsByRun: async (runId) => {
    const reports = await agentsApi.getReportsByRun(runId);
    return reports;
  },

  fetchSignals: async (limit = 50) => {
    try {
      const signals = await signalsApi.getRecent(limit);
      set({ signals });
    } catch { set({ error: 'Failed to fetch signals' }); }
  },

  fetchTopSignals: async () => {
    try {
      const topSignals = await signalsApi.getTop(10);
      set({ topSignals });
    } catch { set({ error: 'Failed to fetch top signals' }); }
  },

  fetchStatus: async () => {
    try {
      const statuses = await agentsApi.getStatus();
      set({ agentStatuses: statuses as any });
    } catch {}
  },

  fetchRuns: async () => {
    try {
      const runs = await agentsApi.getRuns();
      set({ runs });
    } catch {}
  },

  updateAgentStatus: (role, status) => {
    set((state) => ({
      agentStatuses: { ...state.agentStatuses, [role]: status },
    }));
  },

  setPipelineRunning: (running) => set({ pipelineRunning: running }),
}));
