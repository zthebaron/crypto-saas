import { useEffect, useState } from 'react';
import { Briefcase, Plus, X, TrendingUp, TrendingDown } from 'lucide-react';
import { usePortfolioStore } from '../store/portfolioStore';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ExportButton } from '../components/ui/ExportButton';
import { exportPortfolioPdf } from '../services/pdfExport';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

export default function Portfolio() {
  const { summary, snapshots, loading, fetchSummary, fetchHistory, openPosition, closePosition, deletePosition } = usePortfolioStore();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ coinSymbol: '', coinName: '', entryPrice: '', quantity: '' });

  useEffect(() => {
    if (isAuthenticated) { fetchSummary(); fetchHistory(); }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div className="text-center text-gray-500 mt-20">Please sign in to track your portfolio.</div>;
  }

  const handleAdd = () => {
    if (!form.coinSymbol || !form.entryPrice || !form.quantity) return;
    openPosition(form.coinSymbol.toUpperCase(), form.coinName || form.coinSymbol.toUpperCase(), parseFloat(form.entryPrice), parseFloat(form.quantity));
    setForm({ coinSymbol: '', coinName: '', entryPrice: '', quantity: '' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      {/* Export */}
      {summary && summary.positions.length > 0 && (
        <div className="flex justify-end">
          <ExportButton onClick={() => exportPortfolioPdf(summary)} label="Export Portfolio PDF" />
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs text-gray-500">Total Value</p>
          <p className="text-2xl font-bold text-white">${(summary?.totalValue ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Total P&L</p>
          <p className={`text-2xl font-bold ${(summary?.totalPnl ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(summary?.totalPnl ?? 0) >= 0 ? '+' : ''}${(summary?.totalPnl ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">P&L %</p>
          <p className={`text-2xl font-bold ${(summary?.totalPnlPercent ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(summary?.totalPnlPercent ?? 0).toFixed(2)}%
          </p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Positions</p>
          <p className="text-2xl font-bold text-white">{summary?.positions.length ?? 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Chart */}
        <Card title="Allocation">
          {summary && summary.allocation.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={summary.allocation} dataKey="percentage" nameKey="symbol" cx="50%" cy="50%" outerRadius={80} label={({ symbol, percentage }) => `${symbol} ${percentage.toFixed(0)}%`}>
                  {summary.allocation.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val: number) => val.toFixed(1) + '%'} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No positions yet</p>
          )}
        </Card>

        {/* Performance Chart */}
        <Card title="Performance History" className="lg:col-span-2">
          {snapshots.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={[...snapshots].reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="createdAt" tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={d => new Date(d).toLocaleDateString()} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Tooltip />
                <Line type="monotone" dataKey="totalValue" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">Performance data will appear after daily snapshots</p>
          )}
        </Card>
      </div>

      {/* Positions Table */}
      <Card title="Positions" action={
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-xs flex items-center gap-1">
          {showAdd ? <X size={14} /> : <Plus size={14} />} {showAdd ? 'Cancel' : 'Add Position'}
        </button>
      }>
        {showAdd && (
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
                <tr className="text-gray-500 text-xs border-b border-gray-800">
                  <th className="text-left py-2">Coin</th>
                  <th className="text-right py-2">Entry</th>
                  <th className="text-right py-2">Current</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">P&L</th>
                  <th className="text-right py-2">P&L %</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {summary?.positions.map(p => (
                  <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2.5 text-white font-medium">{p.coinSymbol} <span className="text-gray-500 text-xs">{p.coinName}</span></td>
                    <td className="text-right text-gray-300">${p.entryPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="text-right text-gray-300">${p.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="text-right text-gray-300">{p.quantity}</td>
                    <td className={`text-right font-medium ${p.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <span className="inline-flex items-center gap-1">
                        {p.pnl >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        ${Math.abs(p.pnl).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className={`text-right ${p.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>{p.pnlPercent.toFixed(2)}%</td>
                    <td className="text-right">
                      <button onClick={() => closePosition(p.id, p.currentPrice)} className="text-xs text-yellow-400 hover:text-yellow-300 mr-2">Close</button>
                      <button onClick={() => deletePosition(p.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                    </td>
                  </tr>
                ))}
                {(!summary || summary.positions.length === 0) && (
                  <tr><td colSpan={7} className="text-center text-gray-500 py-8">No open positions. Add one above or create from a signal.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
