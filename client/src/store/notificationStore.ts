import { create } from 'zustand';
import { notifications as notifApi } from '../services/api';
import type { Notification, NotificationPreferences } from '@crypto-saas/shared';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  loading: boolean;
  fetch: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  addNotification: (notif: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  preferences: null,
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const result = await notifApi.list();
      set({ notifications: result.data, unreadCount: result.unreadCount, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  markRead: async (id) => {
    await notifApi.markRead(id);
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await notifApi.markAllRead();
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  fetchPreferences: async () => {
    try {
      const prefs = await notifApi.getPreferences();
      set({ preferences: prefs });
    } catch { /* not logged in */ }
  },

  updatePreferences: async (prefs) => {
    await notifApi.updatePreferences(prefs);
    set(state => ({
      preferences: state.preferences ? { ...state.preferences, ...prefs } : null,
    }));
  },

  addNotification: (notif) => {
    set(state => ({
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
