import { useEffect, useState } from 'react';
import { useMarketStore } from '../store/marketStore';
import { useWatchlistStore } from '../store/watchlistStore';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { PriceChange } from '../components/ui/PriceChange';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Star, Search } from 'lucide-react';

type SortKey = 'cmcRank' | 'price' | 'percentChange1h' | 'percentChange24h' | 'percentChange7d' | 'marketCap' | 'volume24h';

export default function MarketData() {
  const { listings, globalMetrics, fetchAll, loading } = useMarketStore();
  const { items: watchlistItems, add, remove, isWatched } = useWatchlistStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('cmcRank');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const filtered = listings
    .filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const mul = sortAsc ? 1 : -1;
      return ((a[sortKey] as number) - (b[sortKey] as number)) * mul;
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === 'cmcRank'); }
  };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 select-none"
      onClick={() => handleSort(field)}
    >
      {label} {sortKey === field ? (sortAsc ? '\u2191' : '\u2193') : ''}
    </th>
  );

  function formatUsd(n: number): string {
    if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
    return '$' + n.toFixed(2);
  }

  function formatPrice(p: number): string {
    if (p >= 1) return '$' + p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 0.01) return '$' + p.toFixed(4);
    return '$' + p.toFixed(8);
  }

  return (
    <div className="space-y-6">
      {/* Global Metrics Bar */}
      {globalMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Market Cap', value: formatUsd(globalMetrics.totalMarketCap) },
            { label: '24h Volume', value: formatUsd(globalMetrics.totalVolume24h) },
            { label: 'BTC Dominance', value: globalMetrics.btcDominance.toFixed(1) + '%' },
            { label: 'ETH Dominance', value: globalMetrics.ethDominance.toFixed(1) + '%' },
            { label: 'Active Cryptos', value: globalMetrics.activeCryptocurrencies.toLocaleString() },
          ].map((m) => (
            <div key={m.label} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500">{m.label}</p>
              <p className="text-lg font-semibold text-gray-100">{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input
          type="text"
          placeholder="Search by name or symbol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Coin Table */}
      <Card>
        {loading && listings.length === 0 ? (
          <div className="flex justify-center py-10"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <SortHeader label="#" field="cmcRank" />
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                  <SortHeader label="Price" field="price" />
                  <SortHeader label="1h %" field="percentChange1h" />
                  <SortHeader label="24h %" field="percentChange24h" />
                  <SortHeader label="7d %" field="percentChange7d" />
                  <SortHeader label="Market Cap" field="marketCap" />
                  <SortHeader label="Volume 24h" field="volume24h" />
                  {isAuthenticated && <th className="px-3 py-3 w-10"></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((coin) => (
                  <tr key={coin.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-3 py-3 text-sm text-gray-400">{coin.cmcRank}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                          alt={coin.symbol}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <span className="font-medium text-gray-200">{coin.name}</span>
                        <span className="text-xs text-gray-500">{coin.symbol}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-200 font-mono">{formatPrice(coin.price)}</td>
                    <td className="px-3 py-3"><PriceChange value={coin.percentChange1h} /></td>
                    <td className="px-3 py-3"><PriceChange value={coin.percentChange24h} /></td>
                    <td className="px-3 py-3"><PriceChange value={coin.percentChange7d} /></td>
                    <td className="px-3 py-3 text-sm text-gray-300">{formatUsd(coin.marketCap)}</td>
                    <td className="px-3 py-3 text-sm text-gray-300">{formatUsd(coin.volume24h)}</td>
                    {isAuthenticated && (
                      <td className="px-3 py-3">
                        <button
                          onClick={() => isWatched(coin.id) ? remove(coin.id) : add(coin.id, coin.symbol, coin.name)}
                          className="text-gray-500 hover:text-yellow-400 transition-colors"
                        >
                          <Star size={16} fill={isWatched(coin.id) ? 'currentColor' : 'none'} className={isWatched(coin.id) ? 'text-yellow-400' : ''} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
