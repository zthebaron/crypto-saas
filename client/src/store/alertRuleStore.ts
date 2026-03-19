import { create } from 'zustand';
import { rules as rulesApi } from '../services/api';
import type { AlertRule } from '@crypto-saas/shared';

interface AlertRuleState {
  rules: AlertRule[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (rule: Omit<AlertRule, 'id' | 'userId' | 'enabled' | 'lastTriggeredAt' | 'createdAt'>) => Promise<void>;
  update: (id: string, updates: Partial<AlertRule>) => Promise<void>;
  toggle: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useAlertRuleStore = create<AlertRuleState>((set, get) => ({
  rules: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true });
    try {
      const rules = await rulesApi.list();
      set({ rules, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  create: async (rule) => {
    await rulesApi.create(rule);
    get().fetch();
  },

  update: async (id, updates) => {
    await rulesApi.update(id, updates);
    get().fetch();
  },

  toggle: async (id) => {
    await rulesApi.toggle(id);
    set(state => ({
      rules: state.rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r),
    }));
  },

  remove: async (id) => {
    await rulesApi.delete(id);
    set(state => ({ rules: state.rules.filter(r => r.id !== id) }));
  },
}));
