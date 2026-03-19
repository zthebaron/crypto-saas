import { useEffect, useState } from 'react';
import { useAgentStore } from '../store/agentStore';
import { Card } from '../components/ui/Card';
import { SignalBadge } from '../components/ui/Badge';
import { ConfidenceBar } from '../components/ui/ConfidenceBar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AGENT_LABELS } from '@crypto-saas/shared';
import type { SignalType, AgentRole } from '@crypto-saas/shared';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts';
import { ExportButton } from '../components/ui/ExportButton';
import { exportSignalSummaryPdf } from '../services/pdfExport';

const SIGNAL_COLORS: Record<string, string> = {
  buy: '#22c55e', sell: '#ef4444', hold: '#eab308', watch: '#3b82f6',
};

export default function Signals() {
  const { signals, fetchSignals } = useAgentStore();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [minConfidence, setMinConfidence] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { fetchSignals(100); }, []);

  const filtered = signals.filter((s) => {
    if (typeFilter !== 'all' && s.type !== typeFilter) return false;
    if (agentFilter !== 'all' && s.agentRole !== agentFilter) return false;
    if (s.confidence < minConfidence) return false;
    return true;
  });

  // Distribution chart
  const distData = ['buy', 'sell', 'hold', 'watch'].map((type) => ({
    name: type, value: filtered.filter((s) => s.type === type).length,
  })).filter(d => d.value > 0);

  // Confidence histogram
  const confBuckets = [
    { range: '0-20', min: 0, max: 20 },
    { range: '21-40', min: 21, max: 40 },
    { range: '41-60', min: 41, max: 60 },
    { range: '61-80', min: 61, max: 80 },
    { range: '81-100', min: 81, max: 100 },
  ].map((b) => ({
    range: b.range,
    count: filtered.filter((s) => s.confidence >= b.min && s.confidence <= b.max).length,
  }));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Signal Type</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500">
            <option value="all">All Types</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
            <option value="hold">Hold</option>
            <option value="watch">Watch</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Agent</label>
          <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500">
            <option value="all">All Agents</option>
            {Object.entries(AGENT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Min Confidence: {minConfidence}%</label>
          <input type="range" min={0} max={100} value={minConfidence}
            onChange={(e) => setMinConfidence(Number(e.target.value))}
            className="w-32 accent-indigo-500" />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-gray-400">{filtered.length} signal{filtered.length !== 1 ? 's' : ''}</span>
          {filtered.length > 0 && <ExportButton onClick={() => exportSignalSummaryPdf(filtered)} />}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Signal Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={distData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={(e) => `${e.name}: ${e.value}`}>
                {distData.map((d) => (
                  <Cell key={d.name} fill={SIGNAL_COLORS[d.name] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Confidence Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={confBuckets}>
              <XAxis dataKey="range" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Signals Table */}
      <Card>
        {signals.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No signals yet. Run the agent pipeline to generate signals.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">Coin</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase w-32">Confidence</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">Timeframe</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">Agent</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">Reasoning</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((signal) => (
                  <tr
                    key={signal.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(expandedId === signal.id ? null : signal.id)}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-200">{signal.coinSymbol}</span>
                        <span className="text-xs text-gray-500">{signal.coinName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3"><SignalBadge type={signal.type} /></td>
                    <td className="px-3 py-3"><ConfidenceBar value={signal.confidence} /></td>
                    <td className="px-3 py-3 text-sm text-gray-400">{signal.timeframe}</td>
                    <td className="px-3 py-3 text-sm text-gray-400">{AGENT_LABELS[signal.agentRole]}</td>
                    <td className="px-3 py-3 text-sm text-gray-400 max-w-xs">
                      {expandedId === signal.id ? signal.reasoning : (
                        <span className="truncate block max-w-[200px]">{signal.reasoning}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(signal.createdAt).toLocaleString()}
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
