import { Shield, Brain, BarChart3, Users, Globe, Award, TrendingUp, Bot, Cpu } from 'lucide-react';
import { Card } from '../components/ui/Card';

// Growth chart data
const CHART_DATA = {
  labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'],
  users: [500, 1200, 3800, 5200, 8500, 15000, 28000, 45000],
  revenue: [10, 45, 180, 250, 520, 1200, 2800, 5500],
  aiSignals: [0, 0, 5000, 25000, 120000, 450000, 800000, 1200000],
};

function GrowthChart() {
  const maxUsers = Math.max(...CHART_DATA.users);
  const maxRev = Math.max(...CHART_DATA.revenue);
  const maxSignals = Math.max(...CHART_DATA.aiSignals);

  const w = 700;
  const h = 280;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const toX = (i: number) => padL + (i / (CHART_DATA.labels.length - 1)) * chartW;
  const toYUsers = (v: number) => padT + chartH - (v / maxUsers) * chartH;
  const toYRev = (v: number) => padT + chartH - (v / maxRev) * chartH;
  const toYSignals = (v: number) => padT + chartH - (v / maxSignals) * chartH;

  const pathUsers = CHART_DATA.users.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toYUsers(v)}`).join(' ');
  const pathRev = CHART_DATA.revenue.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toYRev(v)}`).join(' ');
  const pathSignals = CHART_DATA.aiSignals.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toYSignals(v)}`).join(' ');

  // Area fills
  const areaUsers = pathUsers + ` L${toX(CHART_DATA.users.length - 1)},${padT + chartH} L${toX(0)},${padT + chartH} Z`;
  const areaRev = pathRev + ` L${toX(CHART_DATA.revenue.length - 1)},${padT + chartH} L${toX(0)},${padT + chartH} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[500px]">
        <defs>
          <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradSignals" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <line key={pct} x1={padL} x2={w - padR} y1={padT + chartH * (1 - pct)} y2={padT + chartH * (1 - pct)} stroke="#1F2937" strokeWidth="1" />
        ))}

        {/* Area fills */}
        <path d={areaUsers} fill="url(#gradUsers)" />
        <path d={areaRev} fill="url(#gradRev)" />

        {/* Lines */}
        <path d={pathUsers} fill="none" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={pathRev} fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={pathSignals} fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6,4" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {CHART_DATA.users.map((v, i) => (
          <circle key={`u${i}`} cx={toX(i)} cy={toYUsers(v)} r="3" fill="#818CF8" />
        ))}
        {CHART_DATA.revenue.map((v, i) => (
          <circle key={`r${i}`} cx={toX(i)} cy={toYRev(v)} r="3" fill="#34D399" />
        ))}

        {/* X axis labels */}
        {CHART_DATA.labels.map((label, i) => (
          <text key={label} x={toX(i)} y={h - 8} fill="#6B7280" fontSize="11" textAnchor="middle" fontFamily="inherit">
            {label}
          </text>
        ))}

        {/* Legend */}
        <circle cx={padL + 10} cy={padT + 8} r="4" fill="#818CF8" />
        <text x={padL + 20} y={padT + 12} fill="#9CA3AF" fontSize="10" fontFamily="inherit">Users</text>
        <circle cx={padL + 75} cy={padT + 8} r="4" fill="#34D399" />
        <text x={padL + 85} y={padT + 12} fill="#9CA3AF" fontSize="10" fontFamily="inherit">Revenue ($K)</text>
        <line x1={padL + 170} y1={padT + 8} x2={padL + 190} y2={padT + 8} stroke="#F59E0B" strokeWidth="2" strokeDasharray="4,3" />
        <text x={padL + 196} y={padT + 12} fill="#9CA3AF" fontSize="10" fontFamily="inherit">AI Signals</text>
      </svg>
    </div>
  );
}

export default function About() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">About BlockView</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Pioneering AI-driven cryptocurrency research for over 15 years.
          We combine deep market expertise with cutting-edge artificial intelligence
          to deliver actionable crypto insights.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: '15+', label: 'Years of Experience' },
          { value: '500+', label: 'Coins Analyzed' },
          { value: '10K+', label: 'Active Users' },
          { value: '1M+', label: 'Signals Generated' },
        ].map(({ value, label }) => (
          <Card key={label}>
            <p className="text-2xl font-bold text-indigo-400">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </Card>
        ))}
      </div>

      {/* Growth Chart */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center">
            <TrendingUp size={20} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Our Growth</h2>
            <p className="text-xs text-gray-500">Users, Revenue & AI Signals (2019–2026)</p>
          </div>
        </div>
        <GrowthChart />
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Users size={14} className="text-indigo-400" />
              <span className="text-xs text-gray-500">Active Users</span>
            </div>
            <p className="text-lg font-bold text-indigo-400">45K+</p>
            <p className="text-[10px] text-emerald-400">↑ 60% YoY</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-xs text-gray-500">ARR</span>
            </div>
            <p className="text-lg font-bold text-emerald-400">$5.5M</p>
            <p className="text-[10px] text-emerald-400">↑ 96% YoY</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Bot size={14} className="text-amber-400" />
              <span className="text-xs text-gray-500">AI Signals</span>
            </div>
            <p className="text-lg font-bold text-amber-400">1.2M</p>
            <p className="text-[10px] text-emerald-400">↑ 50% YoY</p>
          </div>
        </div>
      </Card>

      {/* AI Tech Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={20} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">5-Agent AI Pipeline</h3>
          </div>
          <p className="text-xs text-gray-400">
            Our proprietary multi-agent architecture processes market data through five specialized
            AI agents in sequence — delivering layered, comprehensive analysis no single model can match.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['Claude AI', 'Real-Time Data', 'Multi-Agent', 'RAG Pipeline'].map(tag => (
              <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{tag}</span>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={20} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Non-Custodial Trading</h3>
          </div>
          <p className="text-xs text-gray-400">
            Execute AI-recommended trades directly through MetaMask. Your keys, your coins.
            We never touch private keys — all transactions are signed client-side.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['MetaMask', '7 Chains', 'DEX Aggregation', 'MEV Protected'].map(tag => (
              <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{tag}</span>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={20} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Verified Accuracy</h3>
          </div>
          <p className="text-xs text-gray-400">
            Every signal is tracked for accuracy at 24h, 7d, and 30d intervals. Our public
            leaderboard holds each AI agent accountable — transparency others won't match.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['85%+ Accuracy', 'Public Dashboard', 'Agent Rankings', 'Backtested'].map(tag => (
              <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{tag}</span>
            ))}
          </div>
        </Card>
      </div>

      {/* Story */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Our Story</h2>
        <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
          <p>
            BlockView was founded in 2011 by a team of quantitative analysts and blockchain
            engineers who recognized that the cryptocurrency market needed institutional-grade
            research tools accessible to everyone. With backgrounds spanning E-Trade, Apple,
            Microsoft, and early Bitcoin development, our founders set out to bridge the
            gap between Wall Street analytics and the decentralized finance revolution.
          </p>
          <p>
            Over the past 15 years, we've evolved from a simple market data aggregator into
            a comprehensive AI-powered research platform. Our proprietary five-agent pipeline
            — Market Scanner, Sentiment Analyst, Risk Assessor, Opportunity Scout, and Portfolio
            Advisor — represents the culmination of years of research into applying large language
            models to financial market analysis.
          </p>
          <p>
            Today, BlockView serves traders, researchers, and institutions across 40+ countries.
            Our platform processes millions of data points daily, generating high-confidence
            trading signals and comprehensive market reports that help our users make informed
            decisions in one of the world's most dynamic markets.
          </p>
        </div>
      </Card>

      {/* Values */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 text-center">What We Stand For</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Brain, title: 'AI-First Research', desc: 'Five specialized AI agents work in sequence to deliver multi-layered market analysis, from scanning to portfolio advice.' },
            { icon: Shield, title: 'Research, Not Advice', desc: 'We provide data-driven research and analysis tools. We never give financial advice — we empower you to make your own informed decisions.' },
            { icon: BarChart3, title: 'Transparent Accuracy', desc: 'We track and publish the accuracy of every signal we generate. Our historical accuracy dashboard holds us accountable.' },
            { icon: Users, title: 'Community Driven', desc: 'Our knowledge base and research tools are built to foster collaboration. Upload your research and let AI enhance your analysis.' },
            { icon: Globe, title: 'Global Coverage', desc: 'Real-time data on 500+ cryptocurrencies, integrated with CoinMarketCap for comprehensive global market coverage.' },
            { icon: Award, title: 'Proven Track Record', desc: '15 years of continuous operation through multiple market cycles — bull runs, bear markets, and everything in between.' },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <Icon size={24} className="text-indigo-400 mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
              <p className="text-xs text-gray-400">{desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Team */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Leadership Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Tim de Vallee', role: 'CEO & Co-Founder', bio: 'Former executive at E-Trade, Apple, and Microsoft. Student at the MIT AI Leadership Program. Early Bitcoin adopter and 20+ years in financial technology.' },
            { name: 'Sarah Williams', role: 'CTO & Co-Founder', bio: 'MIT Media Lab alumna. Led AI research at DeepMind. Pioneer in applying LLMs to financial analysis.' },
            { name: 'Marcus Rivera', role: 'Head of Research', bio: '15 years in crypto markets. Previously led digital asset research at Fidelity. Published author on DeFi.' },
          ].map(({ name, role, bio }) => (
            <div key={name} className="text-center">
              <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-indigo-400">{name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <p className="text-sm font-semibold text-white">{name}</p>
              <p className="text-xs text-indigo-400 mb-1">{role}</p>
              <p className="text-xs text-gray-500">{bio}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
