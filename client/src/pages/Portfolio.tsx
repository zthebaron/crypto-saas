import { useEffect, useState, useMemo } from 'react';
import { Briefcase, Plus, X, TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart as PieChartIcon, Wallet } from 'lucide-react';
import { usePortfolioStore } from '../store/portfolioStore';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { ExportButton } from '../components/ui/ExportButton';
import { exportPortfolioPdf } from '../services/pdfExport';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#a855f7', '#0ea5e9'];

/* ─── Sample Portfolio (~$5M) ─── */
const SAMPLE_POSITIONS = [
  { id: 's1', coinSymbol: 'BTC', coinName: 'Bitcoin', entryPrice: 58200, currentPrice: 67450, quantity: 28.5, pnl: 263625, pnlPercent: 15.88 },
  { id: 's2', coinSymbol: 'ETH', coinName: 'Ethereum', entryPrice: 2890, currentPrice: 3520, quantity: 285, pnl: 179550, pnlPercent: 21.80 },
  { id: 's3', coinSymbol: 'SOL', coinName: 'Solana', entryPrice: 98.50, currentPrice: 142.30, quantity: 3200, pnl: 140160, pnlPercent: 44.47 },
  { id: 's4', coinSymbol: 'BNB', coinName: 'BNB', entryPrice: 520, currentPrice: 598, quantity: 420, pnl: 32760, pnlPercent: 15.00 },
  { id: 's5', coinSymbol: 'XRP', coinName: 'Ripple', entryPrice: 0.52, currentPrice: 0.61, quantity: 485000, pnl: 43650, pnlPercent: 17.31 },
  { id: 's6', coinSymbol: 'ADA', coinName: 'Cardano', entryPrice: 0.38, currentPrice: 0.45, quantity: 620000, pnl: 43400, pnlPercent: 18.42 },
  { id: 's7', coinSymbol: 'AVAX', coinName: 'Avalanche', entryPrice: 28.40, currentPrice: 35.80, quantity: 4500, pnl: 33300, pnlPercent: 26.06 },
  { id: 's8', coinSymbol: 'DOT', coinName: 'Polkadot', entryPrice: 6.20, currentPrice: 7.15, quantity: 28000, pnl: 26600, pnlPercent: 15.32 },
  { id: 's9', coinSymbol: 'LINK', coinName: 'Chainlink', entryPrice: 12.80, currentPrice: 15.40, quantity: 8500, pnl: 22100, pnlPercent: 20.31 },
  { id: 's10', coinSymbol: 'MATIC', coinName: 'Polygon', entryPrice: 0.68, currentPrice: 0.82, quantity: 185000, pnl: 25900, pnlPercent: 20.59 },
  { id: 's11', coinSymbol: 'UNI', coinName: 'Uniswap', entryPrice: 8.90, currentPrice: 10.65, quantity: 12000, pnl: 21000, pnlPercent: 19.66 },
  { id: 's12', coinSymbol: 'NEAR', coinName: 'NEAR Protocol', entryPrice: 4.20, currentPrice: 5.35, quantity: 22000, pnl: 25300, pnlPercent: 27.38 },
];

function buildSampleSummary() {
  const positions = SAMPLE_POSITIONS;
  const totalValue = positions.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0);
  const totalCost = positions.reduce((sum, p) => sum + p.entryPrice * p.quantity, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = ((totalPnl / totalCost) * 100);

  const allocation = positions.map(p => ({
    symbol: p.coinSymbol,
    percentage: (p.currentPrice * p.quantity / totalValue) * 100,
    value: p.currentPrice * p.quantity,
  }));

  return { totalValue, totalCost, totalPnl, totalPnlPercent, positions, allocation };
}

function buildSampleSnapshots() {
  const base = 4200000;
  const days = 30;
  const snapshots = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const noise = Math.sin(i * 0.3) * 120000 + Math.cos(i * 0.7) * 80000;
    const trend = (days - i) * 26000;
    snapshots.push({
      createdAt: date.toISOString(),
      totalValue: Math.round(base + trend + noise),
      totalPnl: Math.round(trend + noise - 50000),
    });
  }
  return snapshots;
}

export default function Portfolio() {
  const { summary, snapshots, loading, fetchSummary, fetchHistory, openPosition, closePosition, deletePosition } = usePortfolioStore();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ coinSymbol: '', coinName: '', entryPrice: '', quantity: '' });

  useEffect(() => {
    if (isAuthenticated) { fetchSummary(); fetchHistory(); }
  }, [isAuthenticated]);

  const handleAdd = () => {
    if (!form.coinSymbol || !form.entryPrice || !form.quantity) return;
    openPosition(form.coinSymbol.toUpperCase(), form.coinName || form.coinSymbol.toUpperCase(), parseFloat(form.entryPrice), parseFloat(form.quantity));
    setForm({ coinSymbol: '', coinName: '', entryPrice: '', quantity: '' });
    setShowAdd(false);
  };

  // Use sample data when not authenticated or no positions
  const isDemo = !isAuthenticated || (!loading && (!summary || summary.positions.length === 0));
  const displaySummary = isDemo ? buildSampleSummary() : summary;
  const displaySnapshots = isDemo ? buildSampleSnapshots() : snapshots;

  const pnlByAsset = useMemo(() => {
    if (!displaySummary) return [];
    return displaySummary.positions
      .map(p => ({ name: p.coinSymbol, pnl: p.pnl, pnlPercent: p.pnlPercent }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [displaySummary]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
            <Wallet size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Portfolio Tracker
              {isDemo && <span className="text-[10px] bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded-full font-medium">SAMPLE</span>}
            </h1>
            <p className="text-xs text-gray-500">
              {isDemo ? 'Sample portfolio showcasing a diversified $5M crypto allocation' : 'Track your positions and performance in real time'}
            </p>
          </div>
        </div>
        {displaySummary && displaySummary.positions.length > 0 && !isDemo && (
          <ExportButton onClick={() => exportPortfolioPdf(displaySummary as any)} label="Export PDF" />
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-indigo-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Total Value</span>
          </div>
          <p className="text-2xl font-bold text-white">${(displaySummary?.totalValue ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            {(displaySummary?.totalPnl ?? 0) >= 0 ? <TrendingUp size={14} className="text-green-400" /> : <TrendingDown size={14} className="text-red-400" />}
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Total P&L</span>
          </div>
          <p className={`text-2xl font-bold ${(displaySummary?.totalPnl ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(displaySummary?.totalPnl ?? 0) >= 0 ? '+' : ''}${(displaySummary?.totalPnl ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={14} className="text-indigo-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Return</span>
          </div>
          <p className={`text-2xl font-bold ${(displaySummary?.totalPnlPercent ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(displaySummary?.totalPnlPercent ?? 0) >= 0 ? '+' : ''}{(displaySummary?.totalPnlPercent ?? 0).toFixed(2)}%
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <PieChartIcon size={14} className="text-indigo-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Positions</span>
          </div>
          <p className="text-2xl font-bold text-white">{displaySummary?.positions.length ?? 0}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Pie */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">Asset Allocation</h3>
          {displaySummary && displaySummary.allocation.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={displaySummary.allocation} dataKey="percentage" nameKey="symbol" cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                  label={({ symbol, percentage }: any) => `${symbol} ${percentage.toFixed(0)}%`} labelLine={false} paddingAngle={2} strokeWidth={0}>
                  {displaySummary.allocation.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val: number) => `${val.toFixed(1)}%`}
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No positions</p>
          )}
        </div>

        {/* Performance Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">Portfolio Value (30 Days)</h3>
          {displaySnapshots.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={displaySnapshots}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="createdAt" tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={d => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} domain={['dataMin - 100000', 'dataMax + 100000']} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} labelFormatter={d => new Date(d).toLocaleDateString()}
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="totalValue" stroke="#6366f1" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">Performance data will appear after daily snapshots</p>
          )}
        </div>
      </div>

      {/* P&L by Asset */}
      {pnlByAsset.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">Profit & Loss by Asset</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pnlByAsset} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} width={50} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`}
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                {pnlByAsset.map((entry, i) => (
                  <Cell key={i} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Positions Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-gray-200">
            {isDemo ? 'Sample Positions' : 'Open Positions'}
          </h3>
          {!isDemo && (
            <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-xs flex items-center gap-1">
              {showAdd ? <X size={14} /> : <Plus size={14} />} {showAdd ? 'Cancel' : 'Add Position'}
            </button>
          )}
        </div>
        <div className="p-5">
          {showAdd && !isDemo && (
            <div className="flex gap-2 mb-4 flex-wrap">
              <input placeholder="Symbol (BTC)" value={form.coinSymbol} onChange={e => setForm(f => ({ ...f, coinSymbol: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-28" />
              <input placeholder="Name" value={form.coinName} onChange={e => setForm(f => ({ ...f, coinName: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-32" />
              <input placeholder="Entry Price" type="number" value={form.entryPrice} onChange={e => setForm(f => ({ ...f, entryPrice: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-32" />
              <input placeholder="Quantity" type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-28" />
              <button onClick={handleAdd} className="btn-primary text-xs">Add</button>
            </div>
          )}

          {loading ? <LoadingSpinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-800">
                    <th className="text-left py-3 px-2">Coin</th>
                    <th className="text-right py-3 px-2">Entry Price</th>
                    <th className="text-right py-3 px-2">Current Price</th>
                    <th className="text-right py-3 px-2">Quantity</th>
                    <th className="text-right py-3 px-2">Value</th>
                    <th className="text-right py-3 px-2">P&L</th>
                    <th className="text-right py-3 px-2">P&L %</th>
                    {!isDemo && <th className="text-right py-3 px-2">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {displaySummary?.positions.map((p, i) => (
                    <tr key={p.id} className="hover:bg-gray-800/30">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: COLORS[i % COLORS.length] + '20', color: COLORS[i % COLORS.length] }}>
                            {p.coinSymbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{p.coinSymbol}</p>
                            <p className="text-gray-500 text-[10px]">{p.coinName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-right text-gray-300 px-2">${p.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-right text-gray-200 font-medium px-2">${p.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-right text-gray-300 px-2">{p.quantity.toLocaleString()}</td>
                      <td className="text-right text-gray-200 font-medium px-2">${(p.currentPrice * p.quantity).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className={`text-right font-semibold px-2 ${p.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <span className="inline-flex items-center gap-1">
                          {p.pnl >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          ${Math.abs(p.pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </td>
                      <td className={`text-right font-medium px-2 ${p.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {p.pnlPercent >= 0 ? '+' : ''}{p.pnlPercent.toFixed(2)}%
                      </td>
                      {!isDemo && (
                        <td className="text-right px-2">
                          <button onClick={() => closePosition(p.id, p.currentPrice)} className="text-xs text-yellow-400 hover:text-yellow-300 mr-2">Close</button>
                          <button onClick={() => deletePosition(p.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sign in prompt for demo mode */}
      {isDemo && (
        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-5 text-center">
          <p className="text-sm text-indigo-300 font-medium mb-1">This is a sample portfolio for demonstration</p>
          <p className="text-xs text-gray-400">Sign in to create and track your own portfolio with real-time P&L calculations</p>
        </div>
      )}
    </div>
  );
}
