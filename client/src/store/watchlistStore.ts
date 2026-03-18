import { create } from 'zustand';
import type { WatchlistItem } from '@crypto-saas/shared';
import { watchlist as watchlistApi } from '../services/api';

interface WatchlistState {
  items: WatchlistItem[];
  loading: boolean;
  fetch: () => Promise<void>;
  add: (coinId: number, coinSymbol: string, coinName: string) => Promise<void>;
  remove: (coinId: number) => Promise<void>;
  isWatched: (coinId: number) => boolean;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  items: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const items = await watchlistApi.get();
      set({ items, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  add: async (coinId, coinSymbol, coinName) => {
    await watchlistApi.add(coinId, coinSymbol, coinName);
    set((s) => ({
      items: [...s.items, { userId: '', coinId, coinSymbol, coinName, addedAt: new Date().toISOString() }],
    }));
  },

  remove: async (coinId) => {
    await watchlistApi.remove(coinId);
    set((s) => ({ items: s.items.filter((i) => i.coinId !== coinId) }));
  },

  isWatched: (coinId) => get().items.some((i) => i.coinId === coinId),
}));
