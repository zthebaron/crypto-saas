import axios from 'axios';
import type {
  CoinData, GlobalMetrics, TrendingCoin, AgentReport,
  Signal, User, WatchlistItem, AgentRun, AgentRole, AgentStatus,
  ChatMessage,
} from '@crypto-saas/shared';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL: API_BASE });

// Attach JWT to every request
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Redirect on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// --- Market ---
export const market = {
  getListings: (limit = 100) =>
    api.get<{ data: CoinData[] }>('/market/listings', { params: { limit } }).then(r => r.data.data),
  getGlobal: () =>
    api.get<{ data: GlobalMetrics }>('/market/global').then(r => r.data.data),
  getTrending: () =>
    api.get<{ data: { gainers: TrendingCoin[]; losers: TrendingCoin[] } }>('/market/trending').then(r => r.data.data),
  getQuotes: (symbols: string[]) =>
    api.get<{ data: CoinData[] }>('/market/quotes', { params: { symbols: symbols.join(',') } }).then(r => r.data.data),
};

// --- Agents ---
export const agents = {
  triggerRun: (watchlist?: string[]) =>
    api.post<{ runId: string }>('/agents/run', { watchlist }).then(r => r.data),
  triggerSingle: (role: AgentRole) =>
    api.post<{ runId: string }>(`/agents/run/${role}`).then(r => r.data),
  getStatus: () =>
    api.get<{ data: Record<AgentRole, AgentStatus> }>('/agents/status').then(r => r.data.data),
  getReports: (limit = 20, role?: AgentRole) =>
    api.get<{ data: AgentReport[] }>('/agents/reports', { params: { limit, role } }).then(r => r.data.data),
  getReportsByRun: (runId: string) =>
    api.get<{ data: AgentReport[] }>(`/agents/reports/run/${runId}`).then(r => r.data.data),
  getReport: (id: string) =>
    api.get<{ data: AgentReport }>(`/agents/reports/${id}`).then(r => r.data.data),
  getRuns: (limit = 20) =>
    api.get<{ data: AgentRun[] }>('/agents/runs', { params: { limit } }).then(r => r.data.data),
};

// --- Signals ---
export const signals = {
  getRecent: (limit = 50, filters?: Record<string, string>) =>
    api.get<{ data: Signal[] }>('/signals', { params: { limit, ...filters } }).then(r => r.data.data),
  getTop: (limit = 10) =>
    api.get<{ data: Signal[] }>('/signals/top', { params: { limit } }).then(r => r.data.data),
  getByRun: (runId: string) =>
    api.get<{ data: Signal[] }>(`/signals/run/${runId}`).then(r => r.data.data),
};

// --- Auth ---
export const auth = {
  register: (email: string, password: string, displayName: string) =>
    api.post<{ user: User; token: string }>('/auth/register', { email, password, displayName }).then(r => r.data),
  login: (email: string, password: string) =>
    api.post<{ user: User; token: string }>('/auth/login', { email, password }).then(r => r.data),
  getProfile: () =>
    api.get<{ data: User }>('/auth/profile').then(r => r.data.data),
};

// --- Watchlist ---
export const watchlist = {
  get: () =>
    api.get<{ data: WatchlistItem[] }>('/watchlist').then(r => r.data.data),
  add: (coinId: number, coinSymbol: string, coinName: string) =>
    api.post('/watchlist', { coinId, coinSymbol, coinName }),
  remove: (coinId: number) =>
    api.delete(`/watchlist/${coinId}`),
};

// --- Chat ---
export const chat = {
  getHistory: (limit = 50) =>
    api.get<{ data: ChatMessage[] }>('/chat/history', { params: { limit } }).then(r => r.data.data),
  clearHistory: () =>
    api.delete('/chat/history'),
  sendMessageStream: async function* (message: string): AsyncGenerator<{ chunk: string; done: boolean }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) throw new Error('Chat request failed');

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            yield data;
          } catch { /* skip malformed */ }
        }
      }
    }
  },
};
