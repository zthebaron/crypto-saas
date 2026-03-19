import { useEffect } from 'react';
import { Target, Trophy, TrendingUp } from 'lucide-react';
import { useAccuracyStore } from '../store/accuracyStore';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AGENT_LABELS } from '@crypto-saas/shared';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Accuracy() {
  const { overall, byAgent, leaderboard, loading, fetchAll } = useAccuracyStore();

  useEffect(() => { fetchAll(); }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const chartData = byAgent.map(a => ({
    name: AGENT_LABELS[a.agentRole]?.split(' ')[0] || a.agentRole,
    '24h': a.accuracy24hPct,
    '7d': a.accuracy7dPct,
    '30d': a.accuracy30dPct,
  }));

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs text-gray-500">Total Signals Tracked</p>
          <p className="text-2xl font-bold text-white">{overall?.totalSignals ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">24h Accuracy</p>
          <p className="text-2xl font-bold text-green-400">{overall?.accuracy24hPct ?? 0}%</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">7d Accuracy</p>
          <p className="text-2xl font-bold text-indigo-400">{overall?.accuracy7dPct ?? 0}%</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">30d Accuracy</p>
          <p className="text-2xl font-bold text-yellow-400">{overall?.accuracy30dPct ?? 0}%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accuracy Chart */}
        <Card title="Accuracy by Agent">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="24h" fill="#22c55e" name="24h Accuracy" />
                <Bar dataKey="7d" fill="#6366f1" name="7d Accuracy" />
                <Bar dataKey="30d" fill="#f59e0b" name="30d Accuracy" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-12">No accuracy data yet. Signals need at least 24h before evaluation.</p>
          )}
        </Card>

        {/* Leaderboard */}
        <Card title="Agent Leaderboard">
          {leaderboard && leaderboard.agents.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.agents.map((agent, i) => (
                <div key={agent.agentRole} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-700' : 'text-gray-500'}`}>
                      #{i + 1}
                    </span>
                    {i === 0 && <Trophy size={16} className="text-yellow-400" />}
                    <div>
                      <p className="text-sm font-medium text-white">{AGENT_LABELS[agent.agentRole]}</p>
                      <p className="text-xs text-gray-500">{agent.totalSignals} signals tracked</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-400">{agent.accuracy24hPct}%</p>
                    <p className="text-[10px] text-gray-500">24h accuracy</p>
                  </div>
                </div>
              ))}
              <div className="text-center text-xs text-gray-500 mt-2">
                Average accuracy: {leaderboard.averageAccuracy}%
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Leaderboard will populate as signals are evaluated over time.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Per-Agent Detail */}
      {byAgent.length > 0 && (
        <Card title="Detailed Metrics">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-gray-800">
                  <th className="text-left py-2">Agent</th>
                  <th className="text-right py-2">Signals</th>
                  <th className="text-right py-2">24h Acc.</th>
                  <th className="text-right py-2">7d Acc.</th>
                  <th className="text-right py-2">30d Acc.</th>
                  <th className="text-right py-2">Accurate (24h)</th>
                  <th className="text-right py-2">Accurate (7d)</th>
                </tr>
              </thead>
              <tbody>
                {byAgent.map(a => (
                  <tr key={a.agentRole} className="border-b border-gray-800/50">
                    <td className="py-2 text-white">{AGENT_LABELS[a.agentRole]}</td>
                    <td className="text-right text-gray-300">{a.totalSignals}</td>
                    <td className="text-right text-green-400">{a.accuracy24hPct}%</td>
                    <td className="text-right text-indigo-400">{a.accuracy7dPct}%</td>
                    <td className="text-right text-yellow-400">{a.accuracy30dPct}%</td>
                    <td className="text-right text-gray-300">{a.accurate24h}/{a.totalSignals}</td>
                    <td className="text-right text-gray-300">{a.accurate7d}/{a.totalSignals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
