export interface CoinData {
  id: number;
  symbol: string;
  name: string;
  slug: string;
  price: number;
  percentChange1h: number;
  percentChange24h: number;
  percentChange7d: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  maxSupply: number | null;
  cmcRank: number;
  lastUpdated: string;
}

export interface GlobalMetrics {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  activeCryptocurrencies: number;
  totalMarketCapChange24h: number;
}

export interface TrendingCoin {
  id: number;
  symbol: string;
  name: string;
  price: number;
  percentChange24h: number;
  volume24h: number;
  marketCap: number;
}

export type AgentRole =
  | 'market_scanner'
  | 'sentiment_analyst'
  | 'risk_assessor'
  | 'opportunity_scout'
  | 'portfolio_advisor';

export type SignalType = 'buy' | 'sell' | 'hold' | 'watch';
export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

export interface AgentReport {
  id: string;
  agentRole: AgentRole;
  content: string;
  signals: Signal[];
  metadata: Record<string, unknown>;
  createdAt: string;
  runId: string;
}

export interface Signal {
  id: string;
  coinSymbol: string;
  coinName: string;
  type: SignalType;
  confidence: number;
  reasoning: string;
  agentRole: AgentRole;
  timeframe: string;
  createdAt: string;
  runId: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role?: 'user' | 'admin';
  tier: 'free' | 'pro' | 'premium';
  createdAt: string;
}

export interface WatchlistItem {
  userId: string;
  coinId: number;
  coinSymbol: string;
  coinName: string;
  addedAt: string;
}

export type WsEventType =
  | 'agent_status'
  | 'new_signal'
  | 'report_complete'
  | 'market_update'
  | 'pipeline_complete'
  | 'chat_stream'
  | 'chat_done'
  | 'notification';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatStreamPayload {
  messageId: string;
  chunk: string;
  done: boolean;
}

export interface WsEvent {
  type: WsEventType;
  payload: unknown;
  timestamp: string;
}

export interface AgentRun {
  id: string;
  userId: string | null;
  status: 'running' | 'completed' | 'error';
  startedAt: string;
  completedAt: string | null;
}

export interface AgentContext {
  marketData: CoinData[];
  globalMetrics: GlobalMetrics;
  trendingGainers: TrendingCoin[];
  trendingLosers: TrendingCoin[];
  previousReports: AgentReport[];
  userWatchlist?: string[];
  runId: string;
}

export interface AgentOutput {
  report: Omit<AgentReport, 'id' | 'createdAt'>;
  signals: Omit<Signal, 'id' | 'createdAt'>[];
}

// --- Notifications ---
export interface NotificationPreferences {
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  signalConfidenceThreshold: number;
  priceChangeThreshold: number;
  digestFrequency: 'daily' | 'weekly' | 'none';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'signal' | 'price_alert' | 'pipeline_complete' | 'digest';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

// --- Portfolio ---
export interface PortfolioPosition {
  id: string;
  userId: string;
  coinSymbol: string;
  coinName: string;
  entryPrice: number;
  quantity: number;
  signalId: string | null;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt: string | null;
  closePrice: number | null;
}

export interface PortfolioSummary {
  positions: (PortfolioPosition & { currentPrice: number; pnl: number; pnlPercent: number })[];
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  allocation: { symbol: string; percentage: number; value: number }[];
}

export interface PortfolioSnapshot {
  id: string;
  userId: string;
  totalValue: number;
  totalPnl: number;
  snapshotData: string;
  createdAt: string;
}

// --- Documents / Knowledge Base ---
export interface Document {
  id: string;
  userId: string;
  title: string;
  filename: string;
  mimeType: string;
  content: string;
  tags: string[];
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

// --- Alert Rules ---
export type RuleConditionType = 'price_above' | 'price_below' | 'price_change_pct' | 'volume_spike' | 'signal_confidence' | 'new_signal_type';
export type RuleActionType = 'browser_push' | 'in_app';

export interface AlertRule {
  id: string;
  userId: string;
  name: string;
  conditionType: RuleConditionType;
  conditionConfig: {
    coinSymbol?: string;
    threshold?: number;
    signalType?: SignalType;
    timeframe?: string;
  };
  actionType: RuleActionType;
  actionConfig: {
    message?: string;
  };
  enabled: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
}

// --- Signal Accuracy ---
export interface SignalOutcome {
  id: string;
  signalId: string;
  coinSymbol: string;
  signalType: SignalType;
  agentRole: AgentRole;
  entryPrice: number;
  price24h: number | null;
  price7d: number | null;
  price30d: number | null;
  pnl24h: number | null;
  pnl7d: number | null;
  pnl30d: number | null;
  accurate24h: boolean | null;
  accurate7d: boolean | null;
  accurate30d: boolean | null;
  evaluatedAt: string | null;
  createdAt: string;
}

export interface AccuracyMetrics {
  agentRole: AgentRole;
  totalSignals: number;
  accurate24h: number;
  accurate7d: number;
  accurate30d: number;
  accuracy24hPct: number;
  accuracy7dPct: number;
  accuracy30dPct: number;
}

export interface AgentLeaderboard {
  agents: AccuracyMetrics[];
  topPerformer: AgentRole;
  averageAccuracy: number;
}

// --- Comparison ---
export interface CoinComparison {
  coins: CoinData[];
  signals: Record<string, Signal[]>;
}

// --- Admin ---
export interface AdminUser extends User {
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  lastLoginAt: string | null;
  totalRuns: number;
  subscriptionId: string | null;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalRuns: number;
  freeUsers: number;
  platinumUsers: number;
  enterpriseUsers: number;
  recentSignups: number;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'platinum' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  paymentMethod: 'stripe' | 'paypal' | 'crypto' | 'none';
  stripeSubscriptionId: string | null;
  paypalSubscriptionId: string | null;
  cryptoWalletAddress: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'stripe' | 'paypal' | 'crypto';
  transactionId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// --- Integrations ---
export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  key: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}
