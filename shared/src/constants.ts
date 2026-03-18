import type { AgentRole } from './types';

export const AGENT_ROLES: AgentRole[] = [
  'market_scanner',
  'sentiment_analyst',
  'risk_assessor',
  'opportunity_scout',
  'portfolio_advisor',
];

export const AGENT_LABELS: Record<AgentRole, string> = {
  market_scanner: 'Market Scanner',
  sentiment_analyst: 'Sentiment Analyst',
  risk_assessor: 'Risk Assessor',
  opportunity_scout: 'Opportunity Scout',
  portfolio_advisor: 'Portfolio Advisor',
};

export const SUBSCRIPTION_TIERS = {
  free: { label: 'Free', maxRunsPerDay: 5, reportHistory: 24, maxCoins: 50 },
  pro: { label: 'Pro', maxRunsPerDay: 50, reportHistory: Infinity, maxCoins: 100 },
  premium: { label: 'Premium', maxRunsPerDay: Infinity, reportHistory: Infinity, maxCoins: 500 },
} as const;

export const CMC_API_BASE = 'https://pro-api.coinmarketcap.com';

export const CACHE_TTL = {
  listings: 5 * 60,
  quotes: 2 * 60,
  globalMetrics: 5 * 60,
  trending: 5 * 60,
  metadata: 24 * 60 * 60,
} as const;

export const SIGNAL_COLORS: Record<string, string> = {
  buy: '#22c55e',
  sell: '#ef4444',
  hold: '#eab308',
  watch: '#3b82f6',
};
