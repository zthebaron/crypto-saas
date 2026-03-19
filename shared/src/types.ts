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
  | 'chat_done';

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
