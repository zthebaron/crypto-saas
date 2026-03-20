import { useEffect, useState, useRef } from 'react';
import { useWatchlistStore } from '../store/watchlistStore';
import { useMarketStore } from '../store/marketStore';
import { useAgentStore } from '../store/agentStore';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { PriceChange } from '../components/ui/PriceChange';
import { SignalBadge } from '../components/ui/Badge';
import { ConfidenceBar } from '../components/ui/ConfidenceBar';
import { Star, Trash2, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_COINS = [
  { coinId: 1, coinSymbol: 'BTC', coinName: 'Bitcoin' },
  { coinId: 1027, coinSymbol: 'ETH', coinName: 'Ethereum' },
  { coinId: 5426, coinSymbol: 'SOL', coinName: 'Solana' },
  { coinId: 1839, coinSymbol: 'BNB', coinName: 'BNB' },
  { coinId: 52, coinSymbol: 'XRP', coinName: 'XRP' },
  { coinId: 2010, coinSymbol: 'ADA', coinName: 'Cardano' },
  { coinId: 5805, coinSymbol: 'AVAX', coinName: 'Avalanche' },
  { coinId: 6636, coinSymbol: 'DOT', coinName: 'Polkadot' },
  { coinId: 1975, coinSymbol: 'LINK', coinName: 'Chainlink' },
  { coinId: 3890, coinSymbol: 'MATIC', coinName: 'Polygon' },
  { coinId: 7083, coinSymbol: 'UNI', coinName: 'Uniswap' },
  { coinId: 6535, coinSymbol: 'NEAR', coinName: 'NEAR Protocol' },
  { coinId: 3794, coinSymbol: 'ATOM', coinName: 'Cosmos' },
  { coinId: 3513, coinSymbol: 'FTM', coinName: 'Fantom' },
  { coinId: 11840, coinSymbol: 'OP', coinName: 'Optimism' },
];

export default function Watchlist() {
  const { items, fetch: fetchWatchlist, add, remove, reorder } = useWatchlistStore();
  const { listings, fetchListings } = useMarketStore();
  const { topSignals, fetchTopSignals } = useAgentStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loading = useWatchlistStore((s) => s.loading);
  const navigate = useNavigate();

  const [autoPopulated, setAutoPopulated] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchWatchlist();
    fetchListings();
    fetchTopSignals();
  }, [isAuthenticated]);

  // Auto-populate with default coins when watchlist is empty
  useEffect(() => {
    if (loading || autoPopulated) return;
    if (items.length === 0) {
      setAutoPopulated(true);
      (async () => {
        for (const coin of DEFAULT_COINS) {
          try {
            await add(coin.coinId, coin.coinSymbol, coin.coinName);
          } catch {
            // Ignore errors for individual coins (e.g., duplicates)
          }
        }
      })();
    }
  }, [items, loading, autoPopulated]);

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

  // --- Drag-and-drop handlers ---
  function handleDragStart(e: React.DragEvent<HTMLTableRowElement>, index: number) {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Make the drag image slightly transparent
    if (e.currentTarget) {
      e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLTableRowElement>, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }

  function handleDragLeave() {
    setDragOverIndex(null);
  }

  function handleDrop(e: React.DragEvent<HTMLTableRowElement>, index: number) {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      reorder(dragIndex, index);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div className="space-y-6">
      <Card
        title="Your Watchlist"
        action={
          <span className="text-sm text-gray-500">{items.length} coin{items.length !== 1 ? 's' : ''}</span>
        }
      >
        {items.length === 0 && !loading ? (
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
                  <th className="px-1 py-3 w-8"></th>
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
                {watchedCoins.map(({ coinId, coinSymbol, coinName, coin, signals }, index) => (
                  <tr
                    key={coinId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`border-b border-gray-800/50 transition-colors cursor-grab active:cursor-grabbing ${
                      dragIndex === index ? 'opacity-40' : ''
                    } ${
                      dragOverIndex === index && dragIndex !== index
                        ? 'border-t-2 border-t-blue-500'
                        : ''
                    } hover:bg-gray-800/30`}
                  >
                    <td className="px-1 py-3 text-center">
                      <GripVertical size={14} className="text-gray-600 inline-block" />
                    </td>
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
                        title="Remove from watchlist"
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
