import { useEffect } from 'react';
import { useMarketStore } from '../store/marketStore';
import { useAgentStore } from '../store/agentStore';
import { Card } from '../components/ui/Card';
import { SignalBadge } from '../components/ui/Badge';
import { ConfidenceBar } from '../components/ui/ConfidenceBar';
import { PriceChange } from '../components/ui/PriceChange';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AGENT_LABELS } from '@crypto-saas/shared';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts';

const COLORS = ['#f59e0b', '#6366f1', '#8b5cf6', '#a78bfa'];

function formatUsd(n: number): string {
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  return '$' + n.toFixed(2);
}

export default function Overview() {
  const { globalMetrics, gainers, losers, listings, fetchAll, loading } = useMarketStore();
  const { topSignals, fetchTopSignals, runs, fetchRuns } = useAgentStore();

  useEffect(() => {
    fetchAll();
    fetchTopSignals();
    fetchRuns();
    const interval = setInterval(fetchAll, 120000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !globalMetrics) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  // Dominance chart data
  const dominanceData = globalMetrics
    ? [
        { name: 'BTC', value: globalMetrics.btcDominance },
        { name: 'ETH', value: globalMetrics.ethDominance },
        { name: 'Other', value: 100 - globalMetrics.btcDominance - globalMetrics.ethDominance },
      ]
    : [];

  // Top 10 by market cap for bar chart
  const top10 = listings.slice(0, 10).map((c) => ({
    name: c.symbol,
    marketCap: c.marketCap / 1e9,
  }));

  return (
    <div className="space-y-6">
      {/* Quick Stats Row */}
      {globalMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-xs text-gray-500 uppercase">Total Market Cap</p>
            <p className="text-2xl font-bold text-gray-100 mt-1">{formatUsd(globalMetrics.totalMarketCap)}</p>
            <PriceChange value={globalMetrics.totalMarketCapChange24h} />
          </Card>
          <Card>
            <p className="text-xs text-gray-500 uppercase">24h Volume</p>
            <p className="text-2xl font-bold text-gray-100 mt-1">{formatUsd(globalMetrics.totalVolume24h)}</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500 uppercase">BTC Dominance</p>
            <p className="text-2xl font-bold text-gray-100 mt-1">{globalMetrics.btcDominance.toFixed(1)}%</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500 uppercase">Active Cryptos</p>
            <p className="text-2xl font-bold text-gray-100 mt-1">{globalMetrics.activeCryptocurrencies.toLocaleString()}</p>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Signals */}
        <Card title="Top Signals" className="lg:col-span-2">
          {topSignals.length === 0 ? (
            <p className="text-gray-500 text-sm">No signals yet. Run the agent pipeline to generate signals.</p>
          ) : (
            <div className="space-y-3">
              {topSignals.slice(0, 6).map((signal) => (
                <div key={signal.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <img
                    src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${listings.find(l => l.symbol === signal.coinSymbol)?.id || 1}.png`}
                    alt={signal.coinSymbol}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-200">{signal.coinSymbol}</span>
                      <SignalBadge type={signal.type} />
                    </div>
                    <p className="text-xs text-gray-500 truncate">{signal.reasoning}</p>
                  </div>
                  <div className="w-24">
                    <ConfidenceBar value={signal.confidence} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Market Dominance */}
        <Card title="Market Dominance">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={dominanceData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {dominanceData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#e5e7eb' }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {dominanceData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1 text-xs text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                {d.name} {d.value.toFixed(1)}%
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers / Losers */}
        <Card title="Top Gainers">
          <div className="space-y-2">
            {gainers.slice(0, 5).map((coin) => (
              <div key={coin.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <img
                    src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                    alt={coin.symbol} className="w-6 h-6 rounded-full"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="text-sm font-medium text-gray-200">{coin.symbol}</span>
                  <span className="text-xs text-gray-500">{coin.name}</span>
                </div>
                <PriceChange value={coin.percentChange24h} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Top Losers">
          <div className="space-y-2">
            {losers.slice(0, 5).map((coin) => (
              <div key={coin.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <img
                    src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                    alt={coin.symbol} className="w-6 h-6 rounded-full"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="text-sm font-medium text-gray-200">{coin.symbol}</span>
                  <span className="text-xs text-gray-500">{coin.name}</span>
                </div>
                <PriceChange value={coin.percentChange24h} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top 10 Market Cap Chart */}
      <Card title="Top 10 by Market Cap ($B)">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={top10}>
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
              formatter={(value: number) => [`$${value.toFixed(1)}B`, 'Market Cap']}
            />
            <Bar dataKey="marketCap" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Runs */}
      <Card title="Recent Agent Runs">
        {runs.length === 0 ? (
          <p className="text-gray-500 text-sm">No agent runs yet.</p>
        ) : (
          <div className="space-y-2">
            {runs.slice(0, 5).map((run) => (
              <div key={run.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg text-sm">
                <span className="text-gray-400 font-mono text-xs">{run.id.slice(0, 8)}...</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  run.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  run.status === 'running' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>{run.status}</span>
                <span className="text-gray-500 text-xs">{new Date(run.startedAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
