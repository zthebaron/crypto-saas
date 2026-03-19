import { useState, useEffect } from 'react';
import { GitCompareArrows, Search, X } from 'lucide-react';
import { compare as compareApi, market } from '../services/api';
import { useMarketStore } from '../store/marketStore';
import { Card } from '../components/ui/Card';
import { SignalBadge } from '../components/ui/Badge';
import { PriceChange } from '../components/ui/PriceChange';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { CoinData, Signal } from '@crypto-saas/shared';

export default function Compare() {
  const listings = useMarketStore(s => s.listings);
  const [selected, setSelected] = useState<string[]>(['BTC', 'ETH']);
  const [search, setSearch] = useState('');
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [signals, setSignals] = useState<Record<string, Signal[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selected.length >= 2) {
      setLoading(true);
      compareApi.getComparison(selected)
        .then(data => { setCoins(data.coins); setSignals(data.signals); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [selected]);

  const addCoin = (symbol: string) => {
    if (selected.length < 4 && !selected.includes(symbol)) {
      setSelected([...selected, symbol]);
    }
    setSearch('');
  };

  const removeCoin = (symbol: string) => {
    if (selected.length > 2) setSelected(selected.filter(s => s !== symbol));
  };

  const filtered = listings.filter(c =>
    !selected.includes(c.symbol) &&
    (c.symbol.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 8);

  const chartData = coins.map(c => ({
    name: c.symbol,
    '1h': c.percentChange1h,
    '24h': c.percentChange24h,
    '7d': c.percentChange7d,
  }));

  const mcapData = coins.map(c => ({
    name: c.symbol,
    marketCap: c.marketCap / 1e9,
    volume: c.volume24h / 1e9,
  }));

  return (
    <div className="space-y-6">
      {/* Coin Selector */}
      <Card>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-400">Comparing:</span>
          {selected.map(sym => (
            <span key={sym} className="flex items-center gap-1 bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-lg text-sm font-medium">
              {sym}
              {selected.length > 2 && (
                <button onClick={() => removeCoin(sym)} className="hover:text-white"><X size={12} /></button>
              )}
            </span>
          ))}
          {selected.length < 4 && (
            <div className="relative">
              <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg px-2">
                <Search size={14} className="text-gray-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Add coin..."
                  className="bg-transparent border-none text-sm text-white px-2 py-1.5 w-32 focus:outline-none"
                />
              </div>
              {search && (
                <div className="absolute top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                  {filtered.map(c => (
                    <button key={c.symbol} onClick={() => addCoin(c.symbol)} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                      {c.symbol} <span className="text-gray-500">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* Comparison Table */}
          <Card title="Side-by-Side">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-gray-800">
                    <th className="text-left py-2">Metric</th>
                    {coins.map(c => <th key={c.symbol} className="text-right py-2">{c.symbol}</th>)}
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-800/50">
                    <td className="py-2 text-gray-500">Price</td>
                    {coins.map(c => <td key={c.symbol} className="text-right">${c.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>)}
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-2 text-gray-500">24h Change</td>
                    {coins.map(c => <td key={c.symbol} className="text-right"><PriceChange value={c.percentChange24h} /></td>)}
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-2 text-gray-500">7d Change</td>
                    {coins.map(c => <td key={c.symbol} className="text-right"><PriceChange value={c.percentChange7d} /></td>)}
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-2 text-gray-500">Market Cap</td>
                    {coins.map(c => <td key={c.symbol} className="text-right">${(c.marketCap / 1e9).toFixed(1)}B</td>)}
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-2 text-gray-500">Volume 24h</td>
                    {coins.map(c => <td key={c.symbol} className="text-right">${(c.volume24h / 1e9).toFixed(2)}B</td>)}
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">Rank</td>
                    {coins.map(c => <td key={c.symbol} className="text-right">#{c.cmcRank}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="% Change Comparison">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="1h" fill="#6366f1" />
                  <Bar dataKey="24h" fill="#22c55e" />
                  <Bar dataKey="7d" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Market Cap & Volume (Billions)">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mcapData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="marketCap" fill="#6366f1" name="Market Cap" />
                  <Bar dataKey="volume" fill="#8b5cf6" name="Volume" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Signals per coin */}
          <Card title="Related Signals">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selected.map(sym => (
                <div key={sym} className="bg-gray-800/50 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-white mb-2">{sym}</h4>
                  {(signals[sym] || []).length === 0 ? (
                    <p className="text-xs text-gray-500">No recent signals</p>
                  ) : (
                    <div className="space-y-1.5">
                      {(signals[sym] || []).map(s => (
                        <div key={s.id} className="flex items-center justify-between text-xs">
                          <SignalBadge type={s.type} />
                          <span className="text-gray-400">{s.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
