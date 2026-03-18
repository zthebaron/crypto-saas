import { create } from 'zustand';
import type { CoinData, GlobalMetrics, TrendingCoin } from '@crypto-saas/shared';
import { market } from '../services/api';

interface MarketState {
  listings: CoinData[];
  globalMetrics: GlobalMetrics | null;
  gainers: TrendingCoin[];
  losers: TrendingCoin[];
  loading: boolean;
  error: string | null;
  fetchListings: () => Promise<void>;
  fetchGlobal: () => Promise<void>;
  fetchTrending: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useMarketStore = create<MarketState>((set) => ({
  listings: [],
  globalMetrics: null,
  gainers: [],
  losers: [],
  loading: false,
  error: null,

  fetchListings: async () => {
    try {
      const listings = await market.getListings(100);
      set({ listings });
    } catch (err: any) {
      set({ error: 'Failed to fetch listings' });
    }
  },

  fetchGlobal: async () => {
    try {
      const globalMetrics = await market.getGlobal();
      set({ globalMetrics });
    } catch (err: any) {
      set({ error: 'Failed to fetch global metrics' });
    }
  },

  fetchTrending: async () => {
    try {
      const { gainers, losers } = await market.getTrending();
      set({ gainers, losers });
    } catch (err: any) {
      set({ error: 'Failed to fetch trending' });
    }
  },

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const [listings, globalMetrics, trending] = await Promise.all([
        market.getListings(100),
        market.getGlobal(),
        market.getTrending(),
      ]);
      set({
        listings,
        globalMetrics,
        gainers: trending.gainers,
        losers: trending.losers,
        loading: false,
      });
    } catch (err: any) {
      set({ error: 'Failed to fetch market data', loading: false });
    }
  },
}));
