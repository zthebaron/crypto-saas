import { create } from 'zustand';
import { portfolio as portfolioApi } from '../services/api';
import type { PortfolioSummary, PortfolioSnapshot } from '@crypto-saas/shared';

interface PortfolioState {
  summary: PortfolioSummary | null;
  snapshots: PortfolioSnapshot[];
  loading: boolean;
  error: string | null;
  fetchSummary: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  openPosition: (coinSymbol: string, coinName: string, entryPrice: number, quantity: number, signalId?: string) => Promise<void>;
  closePosition: (id: string, closePrice: number) => Promise<void>;
  deletePosition: (id: string) => Promise<void>;
  fromSignal: (signalId: string, quantity: number) => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  summary: null,
  snapshots: [],
  loading: false,
  error: null,

  fetchSummary: async () => {
    set({ loading: true, error: null });
    try {
      const summary = await portfolioApi.getSummary();
      set({ summary, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  fetchHistory: async () => {
    try {
      const snapshots = await portfolioApi.getHistory();
      set({ snapshots });
    } catch { /* ignore */ }
  },

  openPosition: async (coinSymbol, coinName, entryPrice, quantity, signalId) => {
    await portfolioApi.openPosition(coinSymbol, coinName, entryPrice, quantity, signalId);
    get().fetchSummary();
  },

  closePosition: async (id, closePrice) => {
    await portfolioApi.closePosition(id, closePrice);
    get().fetchSummary();
  },

  deletePosition: async (id) => {
    await portfolioApi.deletePosition(id);
    get().fetchSummary();
  },

  fromSignal: async (signalId, quantity) => {
    await portfolioApi.fromSignal(signalId, quantity);
    get().fetchSummary();
  },
}));
