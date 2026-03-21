import { useState, useEffect, useCallback, useRef } from 'react';
import { dex } from '../services/api';
import {
  Search, TrendingUp, TrendingDown, Flame, Sparkles,
  ExternalLink, Clock, Loader2, RefreshCw, Zap,
  ArrowUpDown, Droplets, BarChart3, X,
} from 'lucide-react';

type Tab = 'trending' | 'search' | 'boosted' | 'new';

const CHAIN_COLORS: Record<string, string> = {
  solana: '#9945ff',
  ethereum: '#627eea',
  bsc: '#f0b90b',
  arbitrum: '#28a0f0',
  base: '#0052ff',
  polygon: '#8247e5',
  avalanche: '#e84142',
  optimism: '#ff0420',
  fantom: '#1969ff',
  cronos: '#002D74',
  near: '#00c08b',
  sui: '#6fbcf0',
  aptos: '#2dd8a3',
  ton: '#0098EA',
};

// --------------- Utility Functions ---------------

function formatUsd(n: number | string | undefined): string {
  if (n === undefined || n === null) return '--';
  const num = typeof n === 'string' ? parseFloat(n) : n;
  if (isNaN(num)) return '--';
  if (num < 0.0001) return `$${num.toExponential(2)}`;
  if (num < 1) return `$${num.toFixed(6)}`;
  if (num < 1000) return `$${num.toFixed(2)}`;
  return `$${formatLargeNumber(num)}`;
}

function formatLargeNumber(n: number | undefined): string {
  if (n === undefined || n === null) return '--';
  if (isNaN(n)) return '--';
  const abs = Math.abs(n);
  if (abs >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (abs >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toFixed(2);
}

function formatAge(timestamp: number | undefined): string {
  if (!timestamp) return '--';
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// --------------- Small Components ---------------

function PriceChange({ value }: { value: number | undefined }) {
  if (value === undefined || value === null) return <span className="text-gray-500">--</span>;
  const isPositive = value >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isPositive ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

function ChainBadge({ chainId }: { chainId: string }) {
  const color = CHAIN_COLORS[chainId?.toLowerCase()] || '#6b7280';
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
      style={{ backgroundColor: color + '22', color, border: `1px solid ${color}44` }}
    >
      {chainId}
    </span>
  );
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-800/60 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-500" />
      </div>
      <p className="text-gray-400 font-medium text-lg">{title}</p>
      <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );
}

// --------------- Pair Table (Search Results / Trending) ---------------

function PairTable({ pairs, loading }: { pairs: any[]; loading: boolean }) {
  if (loading) return <LoadingSpinner />;
  if (!pairs.length) return <EmptyState icon={Search} title="No pairs found" subtitle="Try a different search query" />;

  return (
    <div className="bg-gray-900/50 border border-gray-800/60 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800/60 text-gray-400 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">Token Pair</th>
              <th className="text-left px-3 py-3 font-medium">Chain</th>
              <th className="text-right px-3 py-3 font-medium">Price</th>
              <th className="text-right px-3 py-3 font-medium">5m</th>
              <th className="text-right px-3 py-3 font-medium">1h</th>
              <th className="text-right px-3 py-3 font-medium">6h</th>
              <th className="text-right px-3 py-3 font-medium">24h</th>
              <th className="text-right px-3 py-3 font-medium">
                <span className="inline-flex items-center gap-1"><BarChart3 className="w-3 h-3" />Vol 24h</span>
              </th>
              <th className="text-right px-3 py-3 font-medium">
                <span className="inline-flex items-center gap-1"><Droplets className="w-3 h-3" />Liq</span>
              </th>
              <th className="text-right px-3 py-3 font-medium">FDV</th>
              <th className="text-center px-3 py-3 font-medium">
                <span className="inline-flex items-center gap-1"><ArrowUpDown className="w-3 h-3" />Txns</span>
              </th>
              <th className="text-left px-3 py-3 font-medium">DEX</th>
              <th className="text-right px-3 py-3 font-medium">
                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />Age</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/40">
            {pairs.map((pair: any, i: number) => {
              const base = pair.baseToken || {};
              const quote = pair.quoteToken || {};
              const pc = pair.priceChange || {};
              const txns = pair.txns?.h24 || {};
              return (
                <tr key={pair.pairAddress || i} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {pair.info?.imageUrl && (
                        <img src={pair.info.imageUrl} alt="" className="w-6 h-6 rounded-full" />
                      )}
                      <div>
                        <div className="font-semibold text-white">
                          {base.symbol || '??'}
                          <span className="text-gray-500 font-normal"> / {quote.symbol || '??'}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 truncate max-w-[140px]">{base.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><ChainBadge chainId={pair.chainId} /></td>
                  <td className="px-3 py-3 text-right font-mono text-white">{formatUsd(pair.priceUsd)}</td>
                  <td className="px-3 py-3 text-right"><PriceChange value={pc.m5} /></td>
                  <td className="px-3 py-3 text-right"><PriceChange value={pc.h1} /></td>
                  <td className="px-3 py-3 text-right"><PriceChange value={pc.h6} /></td>
                  <td className="px-3 py-3 text-right"><PriceChange value={pc.h24} /></td>
                  <td className="px-3 py-3 text-right font-mono text-gray-300">${formatLargeNumber(pair.volume?.h24)}</td>
                  <td className="px-3 py-3 text-right font-mono text-gray-300">${formatLargeNumber(pair.liquidity?.usd)}</td>
                  <td className="px-3 py-3 text-right font-mono text-gray-300">${formatLargeNumber(pair.fdv)}</td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <span className="text-emerald-400">{txns.buys ?? '--'}</span>
                      <span className="text-gray-600">/</span>
                      <span className="text-red-400">{txns.sells ?? '--'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-left">
                    <span className="text-gray-400 text-xs capitalize">{pair.dexId}</span>
                  </td>
                  <td className="px-3 py-3 text-right text-gray-400 text-xs whitespace-nowrap">{formatAge(pair.pairCreatedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --------------- Boosted Token Cards ---------------

function BoostedTokenCards({ tokens, loading }: { tokens: any[]; loading: boolean }) {
  if (loading) return <LoadingSpinner />;
  if (!tokens.length) return <EmptyState icon={Zap} title="No boosted tokens" subtitle="Check back later for boosted tokens" />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tokens.map((token: any, i: number) => (
        <div key={token.tokenAddress || i} className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30 hover:border-indigo-500/30 transition-all hover:bg-gray-800/60 group">
          <div className="flex items-start gap-3 mb-3">
            {token.icon ? (
              <img src={token.icon} alt="" className="w-10 h-10 rounded-full ring-2 ring-gray-700/50" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white truncate">{token.name || token.tokenAddress?.slice(0, 8) + '...'}</div>
              <div className="text-xs text-gray-400 truncate">{token.symbol}</div>
            </div>
            {token.totalAmount !== undefined && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Flame className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400 text-xs font-bold">{token.totalAmount}</span>
              </div>
            )}
          </div>

          <ChainBadge chainId={token.chainId} />

          {token.description && (
            <p className="text-gray-400 text-xs mt-3 line-clamp-2 leading-relaxed">{token.description}</p>
          )}

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700/30">
            {token.url && (
              <a href={token.url} target="_blank" rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 transition-colors text-xs flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> View
              </a>
            )}
            {token.links && token.links.length > 0 && token.links.slice(0, 3).map((link: any, li: number) => (
              <a key={li} href={link.url} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-300 transition-colors text-xs flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> {link.label || link.type || 'Link'}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// --------------- Token Profile Cards ---------------

function TokenProfileCards({ profiles, loading }: { profiles: any[]; loading: boolean }) {
  if (loading) return <LoadingSpinner />;
  if (!profiles.length) return <EmptyState icon={Sparkles} title="No token profiles" subtitle="New token profiles will appear here" />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {profiles.map((profile: any, i: number) => (
        <div key={profile.tokenAddress || i} className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30 hover:border-indigo-500/30 transition-all hover:bg-gray-800/60">
          <div className="flex items-start gap-3 mb-3">
            {profile.icon ? (
              <img src={profile.icon} alt="" className="w-10 h-10 rounded-full ring-2 ring-gray-700/50" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white truncate">{profile.name || profile.tokenAddress?.slice(0, 8) + '...'}</div>
              <div className="text-xs text-gray-400 truncate">{profile.symbol}</div>
            </div>
          </div>

          <ChainBadge chainId={profile.chainId} />

          {profile.description && (
            <p className="text-gray-400 text-xs mt-3 line-clamp-3 leading-relaxed">{profile.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-700/30">
            {profile.url && (
              <a href={profile.url} target="_blank" rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 transition-colors text-xs flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Website
              </a>
            )}
            {profile.links && profile.links.length > 0 && profile.links.slice(0, 4).map((link: any, li: number) => (
              <a key={li} href={link.url} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-300 transition-colors text-xs flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                {link.label || link.type || 'Link'}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// --------------- Main Page Component ---------------

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'trending', label: 'Trending', icon: TrendingUp },
  { key: 'search', label: 'Search Results', icon: Search },
  { key: 'boosted', label: 'Top Boosted', icon: Zap },
  { key: 'new', label: 'New Tokens', icon: Sparkles },
];

export default function DexScreener() {
  const [tab, setTab] = useState<Tab>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [topBoosted, setTopBoosted] = useState<any[]>([]);
  const [latestBoosted, setLatestBoosted] = useState<any[]>([]);
  const [tokenProfiles, setTokenProfiles] = useState<any[]>([]);
  const [trendingPairs, setTrendingPairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Fetch trending data (top boosted as trending pairs)
  const fetchTrending = useCallback(async () => {
    setLoading(true);
    try {
      const [boosted, profiles] = await Promise.all([
        dex.topBoosted().catch(() => []),
        dex.tokenProfiles().catch(() => []),
      ]);
      setTopBoosted(boosted || []);
      setTrendingPairs(boosted || []);
      setTokenProfiles(profiles || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch boosted tokens
  const fetchBoosted = useCallback(async () => {
    setLoading(true);
    try {
      const [top, latest] = await Promise.all([
        dex.topBoosted().catch(() => []),
        dex.latestBoosted().catch(() => []),
      ]);
      setTopBoosted(top || []);
      setLatestBoosted(latest || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch new token profiles
  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const profiles = await dex.tokenProfiles().catch(() => []);
      setTokenProfiles(profiles || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setTab('search');
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await dex.search(query);
        setSearchResults(results || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500);
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  // Fetch data when tab changes
  useEffect(() => {
    if (tab === 'trending') fetchTrending();
    else if (tab === 'boosted') fetchBoosted();
    else if (tab === 'new') fetchProfiles();
  }, [tab, fetchTrending, fetchBoosted, fetchProfiles]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleRefresh = () => {
    if (tab === 'trending') fetchTrending();
    else if (tab === 'search' && searchQuery.trim()) {
      setSearchLoading(true);
      dex.search(searchQuery).then(r => setSearchResults(r || [])).catch(() => setSearchResults([])).finally(() => setSearchLoading(false));
    }
    else if (tab === 'boosted') fetchBoosted();
    else if (tab === 'new') fetchProfiles();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Flame className="w-7 h-7 text-amber-400" />
            DEX Screener
          </h1>
          <p className="text-gray-400 text-sm mt-1">Search and discover tokens across all major DEXes</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search tokens, pairs, or addresses..."
              className="w-full sm:w-80 pl-10 pr-10 py-2.5 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults([]); setTab('trending'); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading || searchLoading}
            className="p-2.5 bg-gray-800/60 border border-gray-700/50 rounded-xl text-gray-400 hover:text-white hover:border-indigo-500/40 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${(loading || searchLoading) ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 p-1 bg-gray-900/50 rounded-xl border border-gray-800/60 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/40 border border-transparent'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'trending' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-amber-400" />
              Trending Boosted Tokens
            </h2>
            <BoostedTokenCards tokens={trendingPairs} loading={loading} />
          </div>

          {tokenProfiles.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Latest Token Profiles
              </h2>
              <TokenProfileCards profiles={tokenProfiles.slice(0, 8)} loading={false} />
            </div>
          )}
        </div>
      )}

      {tab === 'search' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              Search Results
              {searchResults.length > 0 && (
                <span className="text-sm text-gray-500 font-normal">({searchResults.length} pairs)</span>
              )}
            </h2>
          </div>
          {!searchQuery.trim() ? (
            <EmptyState icon={Search} title="Enter a search query" subtitle="Search for tokens, pairs, or contract addresses" />
          ) : (
            <PairTable pairs={searchResults} loading={searchLoading} />
          )}
        </div>
      )}

      {tab === 'boosted' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-400" />
              Top Boosted
            </h2>
            <BoostedTokenCards tokens={topBoosted} loading={loading} />
          </div>

          {latestBoosted.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-gray-400" />
                Recently Boosted
              </h2>
              <BoostedTokenCards tokens={latestBoosted} loading={false} />
            </div>
          )}
        </div>
      )}

      {tab === 'new' && (
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            New Token Profiles
          </h2>
          <TokenProfileCards profiles={tokenProfiles} loading={loading} />
        </div>
      )}
    </div>
  );
}
