import { useEffect, useState, useMemo } from 'react';
import { useAgentStore } from '../store/agentStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AgentStatusDot } from '../components/ui/AgentStatusDot';
import { SignalBadge } from '../components/ui/Badge';
import { ConfidenceBar } from '../components/ui/ConfidenceBar';
import { AGENT_ROLES, AGENT_LABELS } from '@crypto-saas/shared';
import type { AgentRole, AgentReport, Signal } from '@crypto-saas/shared';
import { ExportButton } from '../components/ui/ExportButton';
import { exportReportPdf } from '../services/pdfExport';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts';
import {
  Bot, Clock, Hash, FileText, Search,
  Scan, Brain, ShieldCheck, Compass, PieChart as PieChartIcon,
  TrendingUp, TrendingDown, Minus, Eye, ArrowRight, Zap,
  BarChart3, Activity, Layers, X, ChevronDown, ChevronUp,
} from 'lucide-react';

/* ─── Constants ─── */

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

/* ─── Sub-components ─── */

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
  const topCoins = Object.entries(coinGroups).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Zap, color: 'text-indigo-400', label: 'Total Signals', value: signals.length, valueClass: 'text-white' },
          { icon: Activity, color: 'text-indigo-400', label: 'Avg Confidence', value: `${avgConfidence}%`, valueClass: avgConfidence >= 70 ? 'text-green-400' : avgConfidence >= 40 ? 'text-yellow-400' : 'text-red-400' },
          { icon: TrendingUp, color: 'text-green-400', label: 'Buy Signals', value: signals.filter(s => s.type === 'buy').length, valueClass: 'text-green-400' },
          { icon: BarChart3, color: 'text-blue-400', label: 'Coins Covered', value: Object.keys(coinGroups).length, valueClass: 'text-white' },
        ].map(({ icon: Icon, color, label, value, valueClass }) => (
          <div key={label} className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className={color} />
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{label}</span>
            </div>
            <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Signal Distribution</h4>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={typeDist} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60}
                label={({ name, value }: any) => `${name}: ${value}`} labelLine={false} paddingAngle={3} strokeWidth={0}>
                {typeDist.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

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
          <span className={`text-xs font-bold ${signal.confidence >= 70 ? 'text-green-400' : signal.confidence >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
            {signal.confidence}%
          </span>
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

/** Lightweight markdown renderer — no external dependency needed */
function ReportContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let listItems: string[] = [];
  let listOrdered = false;

  const flushList = () => {
    if (listItems.length === 0) return;
    const Tag = listOrdered ? 'ol' : 'ul';
    elements.push(
      <Tag key={`list-${elements.length}`} className={`${listOrdered ? 'list-decimal' : 'list-disc'} pl-5 space-y-1.5 mb-4 text-sm text-gray-300`}>
        {listItems.map((item, i) => <li key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />)}
      </Tag>
    );
    listItems = [];
  };

  const inlineFormat = (text: string): string => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-indigo-300 font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="text-gray-200">$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-800 px-1.5 py-0.5 rounded text-indigo-300 text-xs">$1</code>');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) { flushList(); continue; }

    const h4 = trimmed.match(/^####\s+(.+)/);
    const h3 = trimmed.match(/^###\s+(.+)/);
    const h2 = trimmed.match(/^##\s+(.+)/);
    const h1 = trimmed.match(/^#\s+(.+)/);

    if (h4) { flushList(); elements.push(<h4 key={`h4-${i}`} className="text-sm font-semibold text-indigo-300 mt-4 mb-2" dangerouslySetInnerHTML={{ __html: inlineFormat(h4[1]) }} />); continue; }
    if (h3) { flushList(); elements.push(<h3 key={`h3-${i}`} className="text-base font-bold text-indigo-300 mt-5 mb-2" dangerouslySetInnerHTML={{ __html: inlineFormat(h3[1]) }} />); continue; }
    if (h2) { flushList(); elements.push(<h2 key={`h2-${i}`} className="text-lg font-bold text-gray-100 mt-6 mb-3" dangerouslySetInnerHTML={{ __html: inlineFormat(h2[1]) }} />); continue; }
    if (h1) { flushList(); elements.push(<h1 key={`h1-${i}`} className="text-xl font-bold text-gray-100 mt-8 mb-4 pb-3 border-b border-gray-800" dangerouslySetInnerHTML={{ __html: inlineFormat(h1[1]) }} />); continue; }

    if (/^[-*_]{3,}$/.test(trimmed)) { flushList(); elements.push(<hr key={`hr-${i}`} className="border-gray-800 my-6" />); continue; }

    if (trimmed.startsWith('>')) {
      flushList();
      const text = trimmed.replace(/^>\s*/, '');
      elements.push(<blockquote key={`bq-${i}`} className="border-l-2 border-indigo-500/40 bg-indigo-500/5 rounded-r-lg pl-4 py-2 pr-3 my-3 text-sm text-gray-300" dangerouslySetInnerHTML={{ __html: inlineFormat(text) }} />);
      continue;
    }

    const ulMatch = trimmed.match(/^[-*+]\s+(.+)/);
    if (ulMatch) { if (listItems.length > 0 && listOrdered) flushList(); listOrdered = false; listItems.push(ulMatch[1]); continue; }

    const olMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (olMatch) { if (listItems.length > 0 && !listOrdered) flushList(); listOrdered = true; listItems.push(olMatch[1]); continue; }

    flushList();
    elements.push(<p key={`p-${i}`} className="text-sm text-gray-300 leading-7 mb-4" dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }} />);
  }

  flushList();
  return <div>{elements}</div>;
}

/* ─── Pipeline Summary View ─── */

function PipelineSummary({ reports, searchQuery }: { reports: AgentReport[]; searchQuery: string }) {
  const allSignals = reports.flatMap(r => r.signals || []);
  const [expandedAgents, setExpandedAgents] = useState<Set<AgentRole>>(new Set(AGENT_ROLES));

  const toggleAgent = (role: AgentRole) => {
    setExpandedAgents(prev => {
      const next = new Set(prev);
      next.has(role) ? next.delete(role) : next.add(role);
      return next;
    });
  };

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase();
    return reports.filter(r =>
      r.content.toLowerCase().includes(q) ||
      r.agentRole.toLowerCase().includes(q) ||
      AGENT_LABELS[r.agentRole].toLowerCase().includes(q) ||
      (r.signals || []).some(s =>
        s.coinSymbol.toLowerCase().includes(q) ||
        s.coinName.toLowerCase().includes(q) ||
        s.reasoning.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q)
      )
    );
  }, [reports, searchQuery]);

  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const highlightText = (text: string, maxLen?: number) => {
    let t = maxLen ? text.slice(0, maxLen) : text;
    if (maxLen && text.length > maxLen) t += '...';
    if (!searchQuery.trim()) return t;
    const regex = new RegExp(`(${escapeRegex(searchQuery.trim())})`, 'gi');
    return t.replace(regex, '<mark class="bg-yellow-500/30 text-yellow-200 rounded px-0.5">$1</mark>');
  };

  return (
    <div className="space-y-6">
      {/* Overall Analytics */}
      <SignalSummaryCharts signals={allSignals} />

      {/* Per-Agent Summaries */}
      <div className="space-y-4">
        {filteredReports.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Search size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No results found for &ldquo;<span className="text-white">{searchQuery}</span>&rdquo;</p>
            <p className="text-gray-600 text-xs mt-1">Try a different keyword or clear the search</p>
          </div>
        )}

        {filteredReports.map((report) => {
          const Icon = AGENT_ICONS[report.agentRole];
          const color = AGENT_COLORS[report.agentRole];
          const isExpanded = expandedAgents.has(report.agentRole);
          const signals = report.signals || [];

          // Find matching content snippet if searching
          let contentSnippet = '';
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const idx = report.content.toLowerCase().indexOf(q);
            if (idx !== -1) {
              const start = Math.max(0, idx - 80);
              const end = Math.min(report.content.length, idx + q.length + 80);
              contentSnippet = (start > 0 ? '...' : '') + report.content.slice(start, end) + (end < report.content.length ? '...' : '');
            }
          }

          return (
            <div key={report.id || report.agentRole} className="bg-gray-900/50 border border-gray-800/60 rounded-2xl overflow-hidden">
              {/* Agent Header Bar */}
              <button
                onClick={() => toggleAgent(report.agentRole)}
                className="w-full flex items-center gap-4 p-5 hover:bg-gray-800/30 transition-colors text-left"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: color + '18' }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white">{AGENT_LABELS[report.agentRole]}</h3>
                    {signals.length > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '20', color }}>
                        {signals.length} signal{signals.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{AGENT_DESCRIPTIONS[report.agentRole]}</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Signal type breakdown */}
                  {signals.length > 0 && (
                    <div className="hidden md:flex items-center gap-1.5">
                      {['buy', 'sell', 'hold', 'watch'].map(type => {
                        const count = signals.filter(s => s.type === type).length;
                        if (count === 0) return null;
                        return (
                          <span key={type} className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: SIGNAL_COLORS[type] + '20', color: SIGNAL_COLORS[type] }}>
                            {count} {type}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                </div>
              </button>

              {/* Search match snippet */}
              {contentSnippet && !isExpanded && (
                <div className="px-5 pb-3 -mt-2">
                  <p className="text-xs text-gray-400 bg-gray-800/40 rounded-lg p-2.5 border border-gray-700/30"
                    dangerouslySetInnerHTML={{ __html: highlightText(contentSnippet) }} />
                </div>
              )}

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-800/40">
                  {/* Report Content */}
                  <div className="p-5 md:p-6 border-b border-gray-800/30">
                    <div className="max-h-[400px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
                      {searchQuery.trim() ? (
                        <div className="text-sm text-gray-300 leading-7 whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: highlightText(report.content) }} />
                      ) : (
                        <ReportContent content={report.content} />
                      )}
                    </div>
                  </div>

                  {/* Signals for this agent */}
                  {signals.length > 0 && (
                    <div className="p-5 md:p-6">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Signals from {AGENT_LABELS[report.agentRole]}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {signals.map((signal, i) => (
                          <SignalCard key={signal.id || i} signal={signal} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

type ViewMode = 'pipeline' | 'agent';

export default function AgentReports() {
  const { runs, fetchRuns, agentStatuses, fetchStatus } = useAgentStore();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<AgentRole>('market_scanner');
  const [runReports, setRunReports] = useState<AgentReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');

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
    setError(null);
    useAgentStore.getState().fetchReportsByRun(selectedRunId)
      .then((reports) => {
        setRunReports(reports || []);
        if (reports && reports.length > 0) setSelectedRole(reports[0].agentRole);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch reports:', err);
        setRunReports([]);
        setError('Failed to load reports. The server may be unavailable.');
        setLoading(false);
      });
  }, [selectedRunId]);

  const activeReport = runReports.find((r) => r.agentRole === selectedRole);
  const selectedRun = runs.find((r) => r.id === selectedRunId);
  const allSignals = runReports.flatMap(r => r.signals || []);

  return (
    <div className="space-y-6">

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

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-800/60 rounded-lg border border-gray-700/40 p-0.5">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'pipeline' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Layers size={12} />
              Summary
            </button>
            <button
              onClick={() => setViewMode('agent')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'agent' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Bot size={12} />
              By Agent
            </button>
          </div>

          {activeReport && viewMode === 'agent' && (
            <ExportButton onClick={() => exportReportPdf(activeReport)} label="Export PDF" />
          )}
        </div>
      </div>

      {/* ── Search Bar (Pipeline Summary mode) ── */}
      {viewMode === 'pipeline' && runReports.length > 0 && (
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all reports, signals, coins, reasoning..."
            className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-10 pr-10 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* ── Agent Pipeline Selector (Agent mode only) ── */}
      {viewMode === 'agent' && (
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
      )}

      {/* ── Error State ── */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <X size={16} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm text-red-300 font-medium">Error Loading Reports</p>
            <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
          </div>
          <button onClick={() => { setError(null); if (selectedRunId) { setLoading(true); useAgentStore.getState().fetchReportsByRun(selectedRunId).then(r => { setRunReports(r || []); setLoading(false); }).catch(() => { setError('Retry failed'); setLoading(false); }); } }}
            className="ml-auto text-xs text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1 rounded-lg">
            Retry
          </button>
        </div>
      )}

      {/* ── Main Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-500">Loading reports...</p>
        </div>
      ) : runReports.length > 0 ? (

        viewMode === 'pipeline' ? (
          <PipelineSummary reports={runReports} searchQuery={searchQuery} />
        ) :

        activeReport ? (
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

            <SignalSummaryCharts signals={activeReport.signals || []} />

            {/* Report Body */}
            <div className="bg-gray-900/40 border border-gray-800/60 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800/60 flex items-center gap-2">
                <FileText size={16} className="text-indigo-400" />
                <h3 className="text-sm font-semibold text-gray-200">Analysis Report</h3>
              </div>
              <div className="px-6 py-6 md:px-8 md:py-8">
                <ReportContent content={activeReport.content} />
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
          <div className="text-center py-16">
            <Bot size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">This agent hasn&apos;t generated a report for the selected run.</p>
            <p className="text-gray-600 text-xs mt-1">Try selecting a different agent above.</p>
          </div>
        )

      ) : (

        /* ── Empty State ── */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-gray-800/60 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-gray-700/50">
            <Bot size={40} className="text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-200 mb-2">No Agent Runs Yet</h3>
          <p className="text-sm text-gray-500 max-w-lg mx-auto text-center mb-8 leading-relaxed">
            Start the AI agent pipeline to generate comprehensive market analysis. Each run processes data
            through 5 specialized agents in sequence, producing detailed reports and trading signals.
          </p>
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
        </div>
      )}
    </div>
  );
}
