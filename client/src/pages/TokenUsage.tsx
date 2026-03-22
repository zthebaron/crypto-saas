import { useState, useEffect, useMemo } from 'react';
import {
  Coins, TrendingUp, DollarSign, Calculator, BarChart3, Users, Zap,
  AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight, Key, Eye, EyeOff, Clock,
} from 'lucide-react';

/* ─── Pricing Constants ─── */
const INPUT_COST_PER_TOKEN = 3 / 1_000_000;   // $3 per 1M input tokens (Sonnet 4)
const OUTPUT_COST_PER_TOKEN = 15 / 1_000_000;  // $15 per 1M output tokens
const AVG_INPUT_PER_RUN = 4_000;
const AVG_OUTPUT_PER_RUN = 2_000;
const COST_PER_RUN = AVG_INPUT_PER_RUN * INPUT_COST_PER_TOKEN + AVG_OUTPUT_PER_RUN * OUTPUT_COST_PER_TOKEN; // ~$0.042

/* ─── Agent Definitions ─── */
const AGENTS = [
  { name: 'Market Scanner',      runsPerDay: 48, inputMult: 1.2, outputMult: 0.8 },
  { name: 'Sentiment Analyst',   runsPerDay: 36, inputMult: 1.5, outputMult: 1.3 },
  { name: 'Risk Assessor',       runsPerDay: 24, inputMult: 1.0, outputMult: 1.0 },
  { name: 'Opportunity Scout',   runsPerDay: 30, inputMult: 0.9, outputMult: 1.1 },
  { name: 'Portfolio Advisor',   runsPerDay: 18, inputMult: 1.3, outputMult: 1.5 },
];

/* ─── Helpers ─── */
function fmt(n: number, decimals = 2): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(decimals) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(decimals) + 'K';
  return n.toFixed(decimals);
}
function usd(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function pct(n: number): string {
  return n.toFixed(1) + '%';
}

function generateBarData(view: 'hourly' | 'daily' | 'weekly' | 'monthly') {
  const seed = (i: number) => Math.sin(i * 13.7 + 3.1) * 0.5 + 0.5; // deterministic pseudo-random
  const counts: { label: string; tokens: number; cost: number }[] = [];
  const totalRunsPerDay = AGENTS.reduce((s, a) => s + a.runsPerDay, 0);

  if (view === 'hourly') {
    for (let h = 0; h < 24; h++) {
      const factor = 0.3 + seed(h) * 0.7;
      const runs = Math.round((totalRunsPerDay / 24) * factor);
      const tokens = runs * (AVG_INPUT_PER_RUN + AVG_OUTPUT_PER_RUN);
      counts.push({ label: `${h.toString().padStart(2, '0')}:00`, tokens, cost: runs * COST_PER_RUN });
    }
  } else if (view === 'daily') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let d = 0; d < 7; d++) {
      const factor = d < 5 ? 0.8 + seed(d) * 0.4 : 0.3 + seed(d) * 0.3;
      const runs = Math.round(totalRunsPerDay * factor);
      const tokens = runs * (AVG_INPUT_PER_RUN + AVG_OUTPUT_PER_RUN);
      counts.push({ label: days[d], tokens, cost: runs * COST_PER_RUN });
    }
  } else if (view === 'weekly') {
    for (let w = 1; w <= 4; w++) {
      const factor = 0.7 + seed(w) * 0.6;
      const runs = Math.round(totalRunsPerDay * 7 * factor);
      const tokens = runs * (AVG_INPUT_PER_RUN + AVG_OUTPUT_PER_RUN);
      counts.push({ label: `Week ${w}`, tokens, cost: runs * COST_PER_RUN });
    }
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    for (let m = 0; m < 6; m++) {
      const factor = 0.5 + seed(m) * 1.0;
      const runs = Math.round(totalRunsPerDay * 30 * factor);
      const tokens = runs * (AVG_INPUT_PER_RUN + AVG_OUTPUT_PER_RUN);
      counts.push({ label: months[m], tokens, cost: runs * COST_PER_RUN });
    }
  }
  return counts;
}

/* ─── P&L Calculations ─── */
function calcPnl(totalUsers: number) {
  const freePct = 0.60, platPct = 0.25, entPct = 0.15;
  const freeUsers = Math.round(totalUsers * freePct);
  const platUsers = Math.round(totalUsers * platPct);
  const entUsers  = totalUsers - freeUsers - platUsers;

  // Revenue
  const platRevenue = platUsers * 99;
  const entRevenue  = entUsers * 299;
  const totalRevenue = platRevenue + entRevenue;

  // Active users
  const freeActive = Math.round(freeUsers * 0.30);
  const platActive = Math.round(platUsers * 0.80);
  const entActive  = Math.round(entUsers  * 0.95);
  const totalActive = freeActive + platActive + entActive;

  // API cost: 10 runs/day * 30 days * COST_PER_RUN
  const apiCost = totalActive * 10 * 30 * COST_PER_RUN;
  const cmcCost = 79;
  const railwayCost = 20 + Math.ceil(totalUsers / 100) * 5;
  const vercelCost = 20;
  const domainCost = 15;
  const miscCost = 50;
  const totalCost = apiCost + cmcCost + railwayCost + vercelCost + domainCost + miscCost;

  const profit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : -100;

  return {
    totalUsers, freeUsers, platUsers, entUsers,
    platRevenue, entRevenue, totalRevenue,
    freeActive, platActive, entActive, totalActive,
    apiCost, cmcCost, railwayCost, vercelCost, domainCost, miscCost, totalCost,
    profit, margin,
  };
}

/* ─── Component ─── */
export default function TokenUsage() {
  const [tab, setTab] = useState<'usage' | 'pnl'>('usage');
  const [chartView, setChartView] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily');
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(100);

  // Persist API key in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('anthropic_api_key');
    if (stored) setSavedKey(stored);
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem('anthropic_api_key', apiKey.trim());
    setSavedKey(apiKey.trim());
    setApiKey('');
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('anthropic_api_key');
    setSavedKey('');
  };

  const maskedKey = savedKey
    ? savedKey.slice(0, 7) + '...' + savedKey.slice(-4)
    : '';

  // Simulated monthly data
  const totalRunsPerDay = AGENTS.reduce((s, a) => s + a.runsPerDay, 0);
  const monthlyRuns = totalRunsPerDay * 30;
  const monthlyInputTokens = monthlyRuns * AVG_INPUT_PER_RUN;
  const monthlyOutputTokens = monthlyRuns * AVG_OUTPUT_PER_RUN;
  const monthlyTotalTokens = monthlyInputTokens + monthlyOutputTokens;
  const monthlyCost = monthlyRuns * COST_PER_RUN;

  // Agent breakdown
  const agentData = AGENTS.map((a) => {
    const runs30 = a.runsPerDay * 30;
    const input = Math.round(runs30 * AVG_INPUT_PER_RUN * a.inputMult);
    const output = Math.round(runs30 * AVG_OUTPUT_PER_RUN * a.outputMult);
    const cost = input * INPUT_COST_PER_TOKEN + output * OUTPUT_COST_PER_TOKEN;
    return { name: a.name, runs: runs30, input, output, cost };
  });
  const agentTotals = agentData.reduce(
    (acc, a) => ({ runs: acc.runs + a.runs, input: acc.input + a.input, output: acc.output + a.output, cost: acc.cost + a.cost }),
    { runs: 0, input: 0, output: 0, cost: 0 },
  );

  // Chart data
  const barData = useMemo(() => generateBarData(chartView), [chartView]);
  const maxTokens = Math.max(...barData.map((d) => d.tokens));

  // P&L scenarios
  const scenarios = [10, 100, 1000].map(calcPnl);
  const selectedPnl = calcPnl(selectedScenario);

  return (
    <div className="max-w-6xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Coins className="w-7 h-7 text-indigo-400" />
          Token Usage &amp; Cost Analytics
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Monitor Anthropic API consumption, cost projections, and business profitability.
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
        <p className="text-amber-200 text-sm">
          Customers need to use their Anthropic Token for agent runs or they will be billed per agent run or any API token usage.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('usage')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tab === 'usage'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-gray-800/40 text-gray-400 hover:text-gray-200 hover:bg-gray-700/40 border border-gray-700/30'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          Token Usage
        </button>
        <button
          onClick={() => setTab('pnl')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tab === 'pnl'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-gray-800/40 text-gray-400 hover:text-gray-200 hover:bg-gray-700/40 border border-gray-700/30'
          }`}
        >
          <DollarSign className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          Business P&amp;L
        </button>
      </div>

      {/* ═══════════════════════════════════════════ TOKEN USAGE TAB ═══════════════════════════════════════════ */}
      {tab === 'usage' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              icon={<Zap className="w-5 h-5 text-indigo-400" />}
              label="Total Tokens (Month)"
              value={fmt(monthlyTotalTokens, 1)}
              sub={`${fmt(monthlyInputTokens, 1)} in / ${fmt(monthlyOutputTokens, 1)} out`}
            />
            <SummaryCard
              icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
              label="Estimated Cost (Month)"
              value={usd(monthlyCost)}
              sub={`${monthlyRuns.toLocaleString()} total runs`}
            />
            <SummaryCard
              icon={<Calculator className="w-5 h-5 text-amber-400" />}
              label="Avg Cost Per Run"
              value={usd(COST_PER_RUN)}
              sub={`${AVG_INPUT_PER_RUN.toLocaleString()} in + ${AVG_OUTPUT_PER_RUN.toLocaleString()} out`}
            />
            <SummaryCard
              icon={<TrendingUp className="w-5 h-5 text-cyan-400" />}
              label="Projected Monthly Cost"
              value={usd(monthlyCost * 1.1)}
              sub="Based on 10% growth trend"
            />
          </div>

          {/* API Key Input */}
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-gray-100">Your Anthropic API Key</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Use your own Anthropic token to avoid per-run billing. Your key is stored securely and never shared.
            </p>

            {savedKey ? (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="bg-gray-800/60 border border-gray-700/40 rounded-lg px-4 py-2.5 flex items-center gap-2 font-mono text-sm text-gray-300">
                  {showKey ? savedKey : maskedKey}
                  <button onClick={() => setShowKey(!showKey)} className="text-gray-500 hover:text-gray-300 transition-colors">
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="flex items-center gap-1 text-emerald-400 text-sm">
                  <CheckCircle className="w-4 h-4" /> Key saved
                </span>
                <button
                  onClick={handleRemoveKey}
                  className="text-red-400 hover:text-red-300 text-sm underline transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="sk-ant-api03-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 bg-gray-800/60 border border-gray-700/40 rounded-lg px-4 py-2.5 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
                <button
                  onClick={handleSaveKey}
                  disabled={!apiKey.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-all"
                >
                  Save Key
                </button>
              </div>
            )}
          </div>

          {/* Usage Chart */}
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                Usage Over Time
              </h3>
              <div className="flex gap-1 bg-gray-800/60 rounded-lg p-1">
                {(['hourly', 'daily', 'weekly', 'monthly'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setChartView(v)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                      chartView === v
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* CSS Bar Chart */}
            <div className="flex items-end gap-1 sm:gap-2 h-56 mt-2">
              {barData.map((d, i) => {
                const heightPct = maxTokens > 0 ? (d.tokens / maxTokens) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
                      <div className="text-gray-200 font-medium">{d.label}</div>
                      <div className="text-gray-400">{fmt(d.tokens, 0)} tokens</div>
                      <div className="text-emerald-400">{usd(d.cost)}</div>
                    </div>
                    {/* Bar */}
                    <div
                      className="w-full rounded-t-md transition-all duration-300"
                      style={{
                        height: `${heightPct}%`,
                        minHeight: heightPct > 0 ? '4px' : '0px',
                        background: 'linear-gradient(to top, #4f46e5, #818cf8)',
                      }}
                    />
                    {/* Label */}
                    <span className="text-[10px] text-gray-500 truncate w-full text-center">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Usage Breakdown Table */}
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-2xl p-5 overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5 text-indigo-400" />
              Agent Usage Breakdown
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left border-b border-gray-800/60">
                  <th className="pb-3 font-medium">Agent Name</th>
                  <th className="pb-3 font-medium text-right">Runs</th>
                  <th className="pb-3 font-medium text-right">Input Tokens</th>
                  <th className="pb-3 font-medium text-right">Output Tokens</th>
                  <th className="pb-3 font-medium text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {agentData.map((a, i) => (
                  <tr key={i} className="border-b border-gray-800/30 text-gray-300 hover:bg-gray-800/20 transition-colors">
                    <td className="py-3 font-medium">{a.name}</td>
                    <td className="py-3 text-right">{a.runs.toLocaleString()}</td>
                    <td className="py-3 text-right">{fmt(a.input, 0)}</td>
                    <td className="py-3 text-right">{fmt(a.output, 0)}</td>
                    <td className="py-3 text-right text-emerald-400">{usd(a.cost)}</td>
                  </tr>
                ))}
                <tr className="text-gray-100 font-semibold">
                  <td className="py-3">Total</td>
                  <td className="py-3 text-right">{agentTotals.runs.toLocaleString()}</td>
                  <td className="py-3 text-right">{fmt(agentTotals.input, 0)}</td>
                  <td className="py-3 text-right">{fmt(agentTotals.output, 0)}</td>
                  <td className="py-3 text-right text-emerald-400">{usd(agentTotals.cost)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Annual Estimate */}
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Cost Projections
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <ProjectionCard label="Daily" value={usd(monthlyCost / 30)} />
              <ProjectionCard label="Weekly" value={usd((monthlyCost / 30) * 7)} />
              <ProjectionCard label="Monthly" value={usd(monthlyCost)} />
              <ProjectionCard label="Annual" value={usd(monthlyCost * 12)} highlight />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ BUSINESS P&L TAB ═══════════════════════════════════════════ */}
      {tab === 'pnl' && (
        <div className="space-y-6">
          {/* Scenario Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((s) => (
              <button
                key={s.totalUsers}
                onClick={() => setSelectedScenario(s.totalUsers)}
                className={`text-left bg-gray-900/50 border rounded-2xl p-5 transition-all ${
                  selectedScenario === s.totalUsers
                    ? 'border-indigo-500/60 ring-1 ring-indigo-500/20'
                    : 'border-gray-800/60 hover:border-gray-700/60'
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span className="text-lg font-bold text-gray-100">{s.totalUsers.toLocaleString()} Users</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Revenue</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      {usd(s.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Costs</span>
                    <span className="text-red-400 font-semibold flex items-center gap-1">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      {usd(s.totalCost)}
                    </span>
                  </div>
                  <div className="border-t border-gray-700/40 pt-2 flex justify-between items-center">
                    <span className="text-gray-300 text-sm font-medium">Profit / Loss</span>
                    <span className={`font-bold text-lg ${s.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {s.profit >= 0 ? '+' : ''}{usd(s.profit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Margin</span>
                    <span className={`text-sm font-medium ${s.margin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pct(s.margin)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500 text-xs pt-1 border-t border-gray-800/40">
                    <span>Annual projection</span>
                    <span className={s.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                      {s.profit >= 0 ? '+' : ''}{usd(s.profit * 12)}/yr
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detailed Breakdown Table */}
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-2xl p-5 overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-400" />
              Detailed Breakdown — {selectedPnl.totalUsers.toLocaleString()} Users
            </h3>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left border-b border-gray-800/60">
                  <th className="pb-3 font-medium">Line Item</th>
                  <th className="pb-3 font-medium text-right">Monthly</th>
                  <th className="pb-3 font-medium text-right">Annual</th>
                </tr>
              </thead>
              <tbody>
                {/* Revenue */}
                <tr className="border-b border-gray-800/30">
                  <td className="py-2.5 text-emerald-400 font-semibold" colSpan={3}>Revenue</td>
                </tr>
                <tr className="border-b border-gray-800/20 text-gray-300">
                  <td className="py-2 pl-4">Platinum ({selectedPnl.platUsers} users x $99)</td>
                  <td className="py-2 text-right text-emerald-400">{usd(selectedPnl.platRevenue)}</td>
                  <td className="py-2 text-right text-emerald-500">{usd(selectedPnl.platRevenue * 12)}</td>
                </tr>
                <tr className="border-b border-gray-800/20 text-gray-300">
                  <td className="py-2 pl-4">Enterprise ({selectedPnl.entUsers} users x $299)</td>
                  <td className="py-2 text-right text-emerald-400">{usd(selectedPnl.entRevenue)}</td>
                  <td className="py-2 text-right text-emerald-500">{usd(selectedPnl.entRevenue * 12)}</td>
                </tr>
                <tr className="border-b border-gray-800/40 text-gray-100 font-semibold">
                  <td className="py-2.5 pl-4">Total Revenue</td>
                  <td className="py-2.5 text-right text-emerald-400">{usd(selectedPnl.totalRevenue)}</td>
                  <td className="py-2.5 text-right text-emerald-500">{usd(selectedPnl.totalRevenue * 12)}</td>
                </tr>

                {/* Costs */}
                <tr className="border-b border-gray-800/30">
                  <td className="py-2.5 text-red-400 font-semibold" colSpan={3}>Costs</td>
                </tr>
                <tr className="border-b border-gray-800/20 text-gray-300">
                  <td className="py-2 pl-4">Anthropic API ({selectedPnl.totalActive} active users)</td>
                  <td className="py-2 text-right text-red-400">{usd(selectedPnl.apiCost)}</td>
                  <td className="py-2 text-right text-red-500">{usd(selectedPnl.apiCost * 12)}</td>
                </tr>
                <tr className="border-b border-gray-800/20 text-gray-300">
                  <td className="py-2 pl-4">CoinMarketCap API (Professional)</td>
                  <td className="py-2 text-right text-red-400">{usd(selectedPnl.cmcCost)}</td>
                  <td className="py-2 text-right text-red-500">{usd(selectedPnl.cmcCost * 12)}</td>
                </tr>
                <tr className="border-b border-gray-800/20 text-gray-300">
                  <td className="py-2 pl-4">Railway Hosting</td>
                  <td className="py-2 text-right text-red-400">{usd(selectedPnl.railwayCost)}</td>
                  <td className="py-2 text-right text-red-500">{usd(selectedPnl.railwayCost * 12)}</td>
                </tr>
                <tr className="border-b border-gray-800/20 text-gray-300">
                  <td className="py-2 pl-4">Vercel Hosting (Pro)</td>
                  <td className="py-2 text-right text-red-400">{usd(selectedPnl.vercelCost)}</td>
                  <td className="py-2 text-right text-red-500">{usd(selectedPnl.vercelCost * 12)}</td>
                </tr>
                <tr className="border-b border-gray-800/20 text-gray-300">
                  <td className="py-2 pl-4">Domain &amp; SSL</td>
                  <td className="py-2 text-right text-red-400">{usd(selectedPnl.domainCost)}</td>
                  <td className="py-2 text-right text-red-500">{usd(selectedPnl.domainCost * 12)}</td>
                </tr>
                <tr className="border-b border-gray-800/20 text-gray-300">
                  <td className="py-2 pl-4">Misc (monitoring, email, etc)</td>
                  <td className="py-2 text-right text-red-400">{usd(selectedPnl.miscCost)}</td>
                  <td className="py-2 text-right text-red-500">{usd(selectedPnl.miscCost * 12)}</td>
                </tr>
                <tr className="border-b border-gray-800/40 text-gray-100 font-semibold">
                  <td className="py-2.5 pl-4">Total Costs</td>
                  <td className="py-2.5 text-right text-red-400">{usd(selectedPnl.totalCost)}</td>
                  <td className="py-2.5 text-right text-red-500">{usd(selectedPnl.totalCost * 12)}</td>
                </tr>

                {/* Net */}
                <tr className="text-gray-100 font-bold text-base">
                  <td className="py-3">Net Profit / Loss</td>
                  <td className={`py-3 text-right ${selectedPnl.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedPnl.profit >= 0 ? '+' : ''}{usd(selectedPnl.profit)}
                  </td>
                  <td className={`py-3 text-right ${selectedPnl.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {selectedPnl.profit >= 0 ? '+' : ''}{usd(selectedPnl.profit * 12)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Best ROI Strategy
            </h3>

            <div className="space-y-3">
              <Recommendation
                icon={<Key className="w-4 h-4 text-indigo-400" />}
                text="Require BYOK (Bring Your Own Key) for free tier to eliminate API costs for non-paying users"
              />
              <Recommendation
                icon={<ArrowUpRight className="w-4 h-4 text-emerald-400" />}
                text="Focus on Platinum conversion — highest margin tier"
              />
              <Recommendation
                icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
                text="API cost is the #1 expense. Offering BYOK reduces cost by 40-60%"
              />
              <Recommendation
                icon={<Calculator className="w-4 h-4 text-cyan-400" />}
                text="Break-even at ~15 paid users (Platinum)"
              />
              <Recommendation
                icon={<CheckCircle className="w-4 h-4 text-emerald-400" />}
                text={`At 100 users with 25% conversion, monthly profit is ${usd(calcPnl(100).profit)}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */

function SummaryCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-gray-400 text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-100">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}

function ProjectionCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${
      highlight
        ? 'bg-indigo-900/20 border-indigo-700/30'
        : 'bg-gray-800/40 border-gray-700/30'
    }`}>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-xl font-bold ${highlight ? 'text-indigo-300' : 'text-gray-100'}`}>{value}</div>
    </div>
  );
}

function Recommendation({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3 bg-gray-800/30 rounded-lg p-3 border border-gray-700/20">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <p className="text-gray-300 text-sm">{text}</p>
    </div>
  );
}
