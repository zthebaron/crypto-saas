import { useEffect, useState } from 'react';
import { useWatchlistStore } from '../store/watchlistStore';
import { useMarketStore } from '../store/marketStore';
import { useAgentStore } from '../store/agentStore';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { PriceChange } from '../components/ui/PriceChange';
import { SignalBadge } from '../components/ui/Badge';
import { ConfidenceBar } from '../components/ui/ConfidenceBar';
import { Star, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Watchlist() {
  const { items, fetch: fetchWatchlist, remove } = useWatchlistStore();
  const { listings, fetchListings } = useMarketStore();
  const { topSignals, fetchTopSignals } = useAgentStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchWatchlist();
    fetchListings();
    fetchTopSignals();
  }, [isAuthenticated]);

  // Match watchlist with live market data
  const watchedCoins = items.map((item) => {
    const coin = listings.find((c) => c.id === item.coinId || c.symbol === item.coinSymbol);
    const matchingSignals = topSignals.filter((s) => s.coinSymbol === item.coinSymbol);
    return { ...item, coin, signals: matchingSignals };
  });

  function formatPrice(p: number): string {
    if (p >= 1) return '$' + p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 0.01) return '$' + p.toFixed(4);
    return '$' + p.toFixed(8);
  }

  function formatUsd(n: number): string {
    if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
    return '$' + n.toFixed(2);
  }

  return (
    <div className="space-y-6">
      <Card
        title="Your Watchlist"
        action={
          <span className="text-sm text-gray-500">{items.length} coin{items.length !== 1 ? 's' : ''}</span>
        }
      >
        {items.length === 0 ? (
          <div className="text-center py-10">
            <Star size={48} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500">Your watchlist is empty.</p>
            <p className="text-gray-600 text-sm mt-1">Go to Market Data and star coins to add them here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">Coin</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">Price</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">24h</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">7d</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">Market Cap</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">Signals</th>
                  <th className="px-3 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {watchedCoins.map(({ coinId, coinSymbol, coinName, coin, signals }) => (
                  <tr key={coinId} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coinId}.png`}
                          alt={coinSymbol}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <span className="font-medium text-gray-200">{coinName || coinSymbol}</span>
                        <span className="text-xs text-gray-500">{coinSymbol}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-200 font-mono">
                      {coin ? formatPrice(coin.price) : '-'}
                    </td>
                    <td className="px-3 py-3">
                      {coin ? <PriceChange value={coin.percentChange24h} /> : '-'}
                    </td>
                    <td className="px-3 py-3">
                      {coin ? <PriceChange value={coin.percentChange7d} /> : '-'}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-300">
                      {coin ? formatUsd(coin.marketCap) : '-'}
                    </td>
                    <td className="px-3 py-3">
                      {signals.length > 0 ? (
                        <div className="flex items-center gap-2">
                          {signals.slice(0, 2).map((s) => (
                            <div key={s.id} className="flex items-center gap-1">
                              <SignalBadge type={s.type} />
                              <span className="text-xs text-gray-500">{s.confidence}%</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-600">No signals</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => remove(coinId)}
                        className="text-gray-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
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
