import { useEffect, useState } from 'react';
import { useAgentStore } from '../store/agentStore';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AgentStatusDot } from '../components/ui/AgentStatusDot';
import { SignalBadge } from '../components/ui/Badge';
import { ConfidenceBar } from '../components/ui/ConfidenceBar';
import { AGENT_ROLES, AGENT_LABELS } from '@crypto-saas/shared';
import type { AgentRole, AgentReport, Signal } from '@crypto-saas/shared';
import ReactMarkdown from 'react-markdown';
import { ExportButton } from '../components/ui/ExportButton';
import { exportReportPdf } from '../services/pdfExport';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  Bot, ChevronRight, Clock, Hash, FileText,
  Scan, Brain, ShieldCheck, Compass, PieChart as PieChartIcon,
  TrendingUp, TrendingDown, Minus, Eye, ArrowRight, Zap,
  BarChart3, Activity,
} from 'lucide-react';

const AGENT_ICONS: Record<AgentRole, typeof Bot> = {
  market_scanner: Scan,
  sentiment_analyst: Brain,
  risk_assessor: ShieldCheck,
  opportunity_scout: Compass,
  portfolio_advisor: PieChartIcon,
};

const AGENT_COLORS: Record<AgentRole, string> = {
  market_scanner: '#6366f1',
  sentiment_analyst: '#8b5cf6',
  risk_assessor: '#f59e0b',
  opportunity_scout: '#22c55e',
  portfolio_advisor: '#06b6d4',
};

const AGENT_DESCRIPTIONS: Record<AgentRole, string> = {
  market_scanner: 'Scans market data, price action & volume trends across 500+ coins',
  sentiment_analyst: 'Analyzes social sentiment, news coverage & community signals',
  risk_assessor: 'Evaluates risk factors, volatility metrics & correlation analysis',
  opportunity_scout: 'Identifies trading opportunities, entry/exit points & setups',
  portfolio_advisor: 'Provides portfolio allocation, rebalancing & strategy recommendations',
};

const SIGNAL_COLORS: Record<string, string> = {
  buy: '#22c55e',
  sell: '#ef4444',
  hold: '#eab308',
  watch: '#3b82f6',
};

const SIGNAL_ICONS: Record<string, typeof TrendingUp> = {
  buy: TrendingUp,
  sell: TrendingDown,
  hold: Minus,
  watch: Eye,
};

function SignalSummaryCharts({ signals }: { signals: Signal[] }) {
  if (!signals || signals.length === 0) return null;

  const typeDist = ['buy', 'sell', 'hold', 'watch']
    .map(t => ({ name: t.charAt(0).toUpperCase() + t.slice(1), value: signals.filter(s => s.type === t).length, color: SIGNAL_COLORS[t] }))
    .filter(d => d.value > 0);

  const avgConfidence = Math.round(signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length);

  const confBuckets = [
    { range: '0-25', count: signals.filter(s => s.confidence <= 25).length },
    { range: '26-50', count: signals.filter(s => s.confidence > 25 && s.confidence <= 50).length },
    { range: '51-75', count: signals.filter(s => s.confidence > 50 && s.confidence <= 75).length },
    { range: '76-100', count: signals.filter(s => s.confidence > 75).length },
  ];

  const coinGroups = signals.reduce<Record<string, number>>((acc, s) => {
    acc[s.coinSymbol] = (acc[s.coinSymbol] || 0) + 1;
    return acc;
  }, {});
  const topCoins = Object.entries(coinGroups)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Signal Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-indigo-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Total Signals</span>
          </div>
          <p className="text-2xl font-bold text-white">{signals.length}</p>
        </div>
        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-indigo-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Avg Confidence</span>
          </div>
          <p className={`text-2xl font-bold ${avgConfidence >= 70 ? 'text-green-400' : avgConfidence >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{avgConfidence}%</p>
        </div>
        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-green-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Buy Signals</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{signals.filter(s => s.type === 'buy').length}</p>
        </div>
        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={14} className="text-blue-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Coins Covered</span>
          </div>
          <p className="text-2xl font-bold text-white">{Object.keys(coinGroups).length}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Signal Distribution Pie */}
        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Signal Distribution</h4>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={typeDist} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60}
                label={({ name, value }: any) => `${name}: ${value}`} labelLine={false}
                paddingAngle={3} strokeWidth={0}>
                {typeDist.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence Distribution */}
        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Confidence Spread</h4>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={confBuckets}>
              <XAxis dataKey="range" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Coins */}
        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Top Coins Mentioned</h4>
          <div className="space-y-2.5">
            {topCoins.map(([symbol, count], i) => (
              <div key={symbol} className="flex items-center gap-3">
                <span className="text-[10px] text-gray-600 w-4 text-right">#{i + 1}</span>
                <span className="text-sm font-semibold text-white flex-1">{symbol}</span>
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(count / topCoins[0][1]) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
              </div>
            ))}
            {topCoins.length === 0 && <p className="text-xs text-gray-600 text-center py-4">No coin data</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalCard({ signal }: { signal: Signal }) {
  const Icon = SIGNAL_ICONS[signal.type] || Eye;
  return (
    <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30 hover:border-gray-600/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            signal.type === 'buy' ? 'bg-green-500/15' :
            signal.type === 'sell' ? 'bg-red-500/15' :
            signal.type === 'hold' ? 'bg-yellow-500/15' : 'bg-blue-500/15'
          }`}>
            <Icon size={16} className={
              signal.type === 'buy' ? 'text-green-400' :
              signal.type === 'sell' ? 'text-red-400' :
              signal.type === 'hold' ? 'text-yellow-400' : 'text-blue-400'
            } />
          </div>
          <div>
            <span className="text-sm font-bold text-white">{signal.coinSymbol}</span>
            {signal.coinName && <span className="text-[10px] text-gray-500 ml-1.5">{signal.coinName}</span>}
          </div>
        </div>
        <SignalBadge type={signal.type} />
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Confidence</span>
          <span className={`text-xs font-bold ${
            signal.confidence >= 70 ? 'text-green-400' : signal.confidence >= 40 ? 'text-yellow-400' : 'text-red-400'
          }`}>{signal.confidence}%</span>
        </div>
        <ConfidenceBar value={signal.confidence} />
      </div>

      {signal.timeframe && (
        <div className="flex items-center gap-1.5 mb-2.5">
          <Clock size={10} className="text-gray-600" />
          <span className="text-[10px] text-gray-500">Timeframe: {signal.timeframe}</span>
        </div>
      )}

      <p className="text-xs text-gray-400 leading-relaxed">{signal.reasoning}</p>
    </div>
  );
}

export default function AgentReports() {
  const { runs, fetchRuns, agentStatuses, fetchStatus } = useAgentStore();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<AgentRole>('market_scanner');
  const [runReports, setRunReports] = useState<AgentReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRuns();
    fetchStatus();
  }, []);

  useEffect(() => {
    if (runs.length > 0 && !selectedRunId) {
      setSelectedRunId(runs[0].id);
    }
  }, [runs]);

  useEffect(() => {
    if (!selectedRunId) return;
    setLoading(true);
    useAgentStore.getState().fetchReportsByRun(selectedRunId).then((reports) => {
      setRunReports(reports);
      if (reports.length > 0) setSelectedRole(reports[0].agentRole);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedRunId]);

  const activeReport = runReports.find((r) => r.agentRole === selectedRole);
  const selectedRun = runs.find((r) => r.id === selectedRunId);
  const allSignals = runReports.flatMap(r => r.signals || []);

  return (
    <div className="space-y-8">

      {/* ── Header Bar ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
            <FileText size={20} className="text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={selectedRunId || ''}
                onChange={(e) => setSelectedRunId(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {runs.map((run) => (
                  <option key={run.id} value={run.id}>
                    {new Date(run.startedAt).toLocaleString()} — {run.status}
                  </option>
                ))}
                {runs.length === 0 && <option value="">No runs yet</option>}
              </select>
            </div>
            {selectedRun && (
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
                  <Hash size={9} />{selectedRun.id.slice(0, 8)}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  selectedRun.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                  selectedRun.status === 'running' ? 'bg-yellow-500/10 text-yellow-400' :
                  selectedRun.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                  'bg-gray-500/10 text-gray-400'
                }`}>{selectedRun.status}</span>
                <span className="text-[10px] text-gray-600">{runReports.length} reports · {allSignals.length} signals</span>
              </div>
            )}
          </div>
        </div>
        {activeReport && (
          <ExportButton onClick={() => exportReportPdf(activeReport)} label="Export Report PDF" />
        )}
      </div>

      {/* ── Agent Pipeline ── */}
      <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-3">
        <div className="flex items-stretch overflow-x-auto gap-0">
          {AGENT_ROLES.map((role, index) => {
            const Icon = AGENT_ICONS[role];
            const hasReport = runReports.some((r) => r.agentRole === role);
            const isSelected = selectedRole === role;
            const status = agentStatuses[role] || 'idle';
            const reportSignals = runReports.find(r => r.agentRole === role)?.signals?.length || 0;

            return (
              <div key={role} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => setSelectedRole(role)}
                  className={`group relative flex flex-col items-center gap-2 px-5 py-4 rounded-xl transition-all duration-200 min-w-[120px] ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-600/15 to-indigo-600/5 border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                      : hasReport
                      ? 'hover:bg-gray-800/60 border border-transparent'
                      : 'opacity-30 border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-indigo-600/25 ring-2 ring-indigo-500/20'
                      : hasReport ? 'bg-gray-800 group-hover:bg-gray-700' : 'bg-gray-800/50'
                  }`}>
                    <Icon size={20} className={
                      isSelected ? 'text-indigo-400' : hasReport ? 'text-gray-300 group-hover:text-white' : 'text-gray-600'
                    } />
                  </div>
                  <span className={`text-[11px] font-semibold text-center leading-tight ${
                    isSelected ? 'text-indigo-300' : hasReport ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {AGENT_LABELS[role]}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <AgentStatusDot status={status} />
                    <span className="text-[9px] text-gray-500 capitalize">{status}</span>
                  </div>
                  {hasReport && reportSignals > 0 && (
                    <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}>{reportSignals}</span>
                  )}
                </button>
                {index < AGENT_ROLES.length - 1 && (
                  <div className="flex-shrink-0 mx-1">
                    <ArrowRight size={14} className={`${
                      hasReport && runReports.some(r => r.agentRole === AGENT_ROLES[index + 1])
                        ? 'text-indigo-500/60' : 'text-gray-700'
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-500">Loading report...</p>
        </div>
      ) : activeReport ? (
        <div className="space-y-8">

          {/* Agent Header */}
          <div className="flex items-start gap-4">
            {(() => {
              const Icon = AGENT_ICONS[activeReport.agentRole];
              const color = AGENT_COLORS[activeReport.agentRole];
              return (
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: color + '15' }}>
                  <Icon size={28} style={{ color }} />
                </div>
              );
            })()}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white mb-1">
                {AGENT_LABELS[activeReport.agentRole]} Report
              </h2>
              <p className="text-sm text-gray-400 mb-2">{AGENT_DESCRIPTIONS[activeReport.agentRole]}</p>
              <div className="flex items-center gap-4 text-[11px] text-gray-500">
                <span className="flex items-center gap-1"><Clock size={11} />{new Date(activeReport.createdAt).toLocaleString()}</span>
                <span className="flex items-center gap-1 font-mono"><Hash size={11} />{activeReport.runId.slice(0, 8)}</span>
                <span className="flex items-center gap-1"><Zap size={11} />{activeReport.signals?.length || 0} signals</span>
              </div>
            </div>
          </div>

          {/* Signal Analytics */}
          <SignalSummaryCharts signals={activeReport.signals || []} />

          {/* Report Body */}
          <div className="bg-gray-900/40 border border-gray-800/60 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800/60 flex items-center gap-2">
              <FileText size={16} className="text-indigo-400" />
              <h3 className="text-sm font-semibold text-gray-200">Analysis Report</h3>
            </div>
            <div className="px-6 py-6 md:px-8 md:py-8">
              <div className="prose prose-invert prose-sm md:prose-base max-w-none
                prose-headings:text-gray-100 prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-xl prose-h1:mb-4 prose-h1:mt-8 prose-h1:pb-3 prose-h1:border-b prose-h1:border-gray-800
                prose-h2:text-lg prose-h2:mb-3 prose-h2:mt-6
                prose-h3:text-base prose-h3:mb-2 prose-h3:mt-5 prose-h3:text-indigo-300
                prose-p:text-gray-300 prose-p:leading-7 prose-p:mb-4
                prose-strong:text-indigo-300 prose-strong:font-semibold
                prose-em:text-gray-200
                prose-ul:text-gray-300 prose-ul:space-y-1 prose-ul:mb-4
                prose-ol:text-gray-300 prose-ol:space-y-1 prose-ol:mb-4
                prose-li:text-gray-300 prose-li:leading-relaxed
                prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-indigo-300 prose-code:text-sm prose-code:font-normal
                prose-pre:bg-gray-800/60 prose-pre:border prose-pre:border-gray-700/50 prose-pre:rounded-xl
                prose-blockquote:border-indigo-500/40 prose-blockquote:bg-indigo-500/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:text-gray-300
                prose-hr:border-gray-800
                prose-table:text-sm
                prose-th:text-gray-300 prose-th:font-semibold prose-th:pb-2 prose-th:border-gray-700
                prose-td:text-gray-400 prose-td:py-2 prose-td:border-gray-800
                prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:text-indigo-300">
                <ReactMarkdown>{activeReport.content}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Signals Grid */}
          {activeReport.signals && activeReport.signals.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap size={18} className="text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Generated Signals</h3>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full ml-1">{activeReport.signals.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeReport.signals.map((signal: Signal, i: number) => (
                  <SignalCard key={signal.id || i} signal={signal} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (

        /* ── Empty State ── */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-gray-800/60 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-gray-700/50">
            <Bot size={40} className="text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-200 mb-2">
            {runs.length === 0 ? 'No Agent Runs Yet' : 'No Report Available'}
          </h3>
          <p className="text-sm text-gray-500 max-w-lg mx-auto text-center mb-8 leading-relaxed">
            {runs.length === 0
              ? 'Start the AI agent pipeline to generate comprehensive market analysis. Each run processes data through 5 specialized agents in sequence, producing detailed reports and trading signals.'
              : 'This agent hasn\'t generated a report for the selected run. Try selecting a different agent or pipeline run above.'}
          </p>

          {runs.length === 0 && (
            <div className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-6 max-w-2xl w-full">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-5">Pipeline Flow</h4>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {AGENT_ROLES.map((role, i) => {
                  const Icon = AGENT_ICONS[role];
                  return (
                    <div key={role} className="flex items-center gap-2">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
                          <Icon size={18} className="text-gray-500" />
                        </div>
                        <span className="text-[10px] text-gray-500 text-center leading-tight max-w-[80px]">{AGENT_LABELS[role]}</span>
                      </div>
                      {i < AGENT_ROLES.length - 1 && <ArrowRight size={14} className="text-gray-700 mt-[-16px]" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
