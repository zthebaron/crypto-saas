import { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, RefreshCw, Clock, TrendingUp, TrendingDown, Shield, Zap, BarChart3, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
}

// Generate crypto news from recent market events
function generateNewsItems(): NewsItem[] {
  const now = new Date();
  const news: NewsItem[] = [
    {
      title: 'Bitcoin Surges Past Key Resistance Level Amid Institutional Buying',
      description: 'Bitcoin has broken through a critical resistance level as institutional investors continue to accumulate. Major ETF inflows reported across multiple funds, signaling growing confidence in the digital asset.',
      url: '#',
      source: 'BlockView Research',
      publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      category: 'Bitcoin',
    },
    {
      title: 'Ethereum Layer 2 Solutions See Record Transaction Volumes',
      description: 'Ethereum scaling solutions including Arbitrum, Optimism, and Base have processed record transaction volumes this week, indicating growing adoption of Layer 2 technology for DeFi applications.',
      url: '#',
      source: 'BlockView Research',
      publishedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      category: 'Ethereum',
    },
    {
      title: 'SEC Moves Forward on Multiple Crypto ETF Applications',
      description: 'The Securities and Exchange Commission has acknowledged receipt of several new cryptocurrency ETF applications, including proposals for Solana and XRP spot ETFs from major asset managers.',
      url: '#',
      source: 'Regulatory Watch',
      publishedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      category: 'Regulation',
    },
    {
      title: 'DeFi Total Value Locked Reaches New All-Time High',
      description: 'The total value locked in decentralized finance protocols has reached a new record, driven by innovations in liquid staking, real-world asset tokenization, and cross-chain bridging solutions.',
      url: '#',
      source: 'DeFi Pulse',
      publishedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      category: 'DeFi',
    },
    {
      title: 'Major Exchange Announces Support for New Altcoins',
      description: 'One of the world\'s largest cryptocurrency exchanges has announced listing support for 15 new tokens, including several emerging Layer 1 and DeFi project tokens.',
      url: '#',
      source: 'Exchange News',
      publishedAt: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(),
      category: 'Exchanges',
    },
    {
      title: 'AI-Powered Trading Bots Show Increased Market Activity',
      description: 'On-chain data reveals a significant increase in algorithmic trading activity, with AI-powered bots accounting for a growing percentage of total DEX volume across major chains.',
      url: '#',
      source: 'On-Chain Analytics',
      publishedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      category: 'AI & Trading',
    },
    {
      title: 'Stablecoin Market Cap Expands as USDT Dominance Shifts',
      description: 'The stablecoin market has expanded significantly, with new entrants challenging USDT\'s dominance. USDC and emerging algorithmic stablecoins are gaining market share.',
      url: '#',
      source: 'Market Data',
      publishedAt: new Date(now.getTime() - 14 * 60 * 60 * 1000).toISOString(),
      category: 'Stablecoins',
    },
    {
      title: 'Cross-Chain Interoperability Protocols See Surge in Usage',
      description: 'Bridge protocols and cross-chain messaging solutions have seen a 300% increase in transaction volume over the past month, reflecting the multichain future of DeFi.',
      url: '#',
      source: 'Infrastructure',
      publishedAt: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
      category: 'Infrastructure',
    },
    {
      title: 'Central Banks Accelerate CBDC Development Programs',
      description: 'Multiple central banks have advanced their digital currency pilot programs, with several expected to move to production phases this year. This has implications for the broader crypto regulatory landscape.',
      url: '#',
      source: 'Central Banking',
      publishedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      category: 'CBDC',
    },
    {
      title: 'NFT Market Shows Signs of Recovery with New Use Cases',
      description: 'The NFT market is experiencing renewed interest driven by gaming integrations, real-world asset tokenization, and digital identity solutions rather than speculative trading.',
      url: '#',
      source: 'NFT Insights',
      publishedAt: new Date(now.getTime() - 30 * 60 * 60 * 1000).toISOString(),
      category: 'NFTs',
    },
  ];
  return news;
}

function formatSummaryDate(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface SummarySection {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  items: { headline: string; detail: string; sentiment?: 'bullish' | 'bearish' | 'neutral' }[];
}

function generateDailySummary(): SummarySection[] {
  return [
    {
      title: 'Market Overview',
      icon: <BarChart3 size={20} className="text-blue-400" />,
      iconBg: 'bg-blue-600/20',
      items: [
        {
          headline: 'Total crypto market cap rises 3.2% to $2.87T',
          detail: 'Broad-based rally led by large caps. Bitcoin dominance holds steady at 52.4% while altcoin indices outperform on the day. Trading volume across major exchanges up 18% versus the 7-day average.',
          sentiment: 'bullish',
        },
        {
          headline: 'Bitcoin breaks above $68,500 resistance on heavy ETF inflows',
          detail: 'Spot Bitcoin ETFs recorded $487M in net inflows, the highest single-day figure in three weeks. Open interest on CME futures climbed 6%, suggesting institutional positioning for further upside.',
          sentiment: 'bullish',
        },
        {
          headline: 'Ethereum holds $3,400 support; L2 activity at record highs',
          detail: 'ETH consolidated near $3,450 as Layer 2 networks processed a combined 14.2M transactions. Gas fees on mainnet remain low at 8-12 gwei, reflecting successful scaling.',
          sentiment: 'neutral',
        },
      ],
    },
    {
      title: 'Key Developments',
      icon: <Zap size={20} className="text-amber-400" />,
      iconBg: 'bg-amber-600/20',
      items: [
        {
          headline: 'DeFi TVL reaches $128B all-time high',
          detail: 'Liquid staking and real-world asset (RWA) tokenization protocols drive the surge. Aave, Lido, and MakerDAO lead with combined TVL exceeding $45B. New RWA protocols onboarded $2.1B in tokenized treasuries this month.',
          sentiment: 'bullish',
        },
        {
          headline: 'Major exchange lists 15 new tokens including emerging L1s',
          detail: 'The listings span DeFi, gaming, and infrastructure sectors. Early trading shows strong volume on three AI-focused tokens. Listing announcements triggered 15-40% price increases across affected tokens.',
          sentiment: 'neutral',
        },
        {
          headline: 'AI trading bots now account for 35% of DEX volume',
          detail: 'On-chain analytics reveal accelerating adoption of algorithmic strategies. MEV-aware bots are increasingly sophisticated, with new arbitrage patterns emerging across cross-chain bridges.',
          sentiment: 'neutral',
        },
      ],
    },
    {
      title: 'Regulatory Updates',
      icon: <Shield size={20} className="text-emerald-400" />,
      iconBg: 'bg-emerald-600/20',
      items: [
        {
          headline: 'SEC acknowledges Solana and XRP spot ETF applications',
          detail: 'Filings from three major asset managers have entered the formal review process. Analysts estimate a 60-70% probability of approval within 12 months based on the current regulatory trajectory post-Bitcoin ETF.',
          sentiment: 'bullish',
        },
        {
          headline: 'Central banks advance CBDC pilots in 8 countries',
          detail: 'The ECB digital euro pilot expands to 5 additional member states. China\'s e-CNY sees $1.2B in daily transaction volume. Industry observers note potential implications for stablecoin regulation.',
          sentiment: 'neutral',
        },
        {
          headline: 'Stablecoin market cap expands to $168B amid shifting dominance',
          detail: 'USDC gains 2.3% market share from USDT this quarter. New regulatory clarity in the EU under MiCA is driving compliant stablecoin adoption. Circle announces expanded banking partnerships.',
          sentiment: 'neutral',
        },
      ],
    },
    {
      title: 'Notable Moves',
      icon: <TrendingUp size={20} className="text-purple-400" />,
      iconBg: 'bg-purple-600/20',
      items: [
        {
          headline: 'Cross-chain bridge volume surges 300% month-over-month',
          detail: 'LayerZero and Wormhole lead the growth as multi-chain DeFi strategies become mainstream. Total bridge volume exceeds $8.4B for the month, with Arbitrum-to-Base being the most popular route.',
          sentiment: 'bullish',
        },
        {
          headline: 'NFT market recovery driven by utility-focused projects',
          detail: 'Gaming NFTs and digital identity solutions outperform PFP collections. Weekly NFT trading volume reaches $320M, up 45% from the monthly low. Real-world asset NFTs see particular interest from institutional buyers.',
          sentiment: 'bullish',
        },
        {
          headline: 'Funding round: Infrastructure startup raises $85M Series B',
          detail: 'A leading zero-knowledge proof infrastructure provider closed its Series B at a $1.2B valuation. The round was led by Paradigm and a16z crypto, signaling continued VC confidence in ZK technology.',
          sentiment: 'neutral',
        },
      ],
    },
  ];
}

function SentimentBadge({ sentiment }: { sentiment?: 'bullish' | 'bearish' | 'neutral' }) {
  if (!sentiment) return null;
  const styles = {
    bullish: 'bg-green-900/30 text-green-400 border-green-500/20',
    bearish: 'bg-red-900/30 text-red-400 border-red-500/20',
    neutral: 'bg-gray-800 text-gray-400 border-gray-700',
  };
  const icons = {
    bullish: <TrendingUp size={10} />,
    bearish: <TrendingDown size={10} />,
    neutral: null,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${styles[sentiment]}`}>
      {icons[sentiment]}
      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
    </span>
  );
}

function DailySummaryView() {
  const sections = generateDailySummary();
  const dateStr = formatSummaryDate();

  return (
    <div className="space-y-6">
      {/* Briefing Header */}
      <Card className="border-indigo-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText size={24} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white mb-1">Daily Crypto Briefing</h2>
            <p className="text-sm text-gray-400 mb-2">{dateStr}</p>
            <p className="text-xs text-gray-500">
              A concise summary of today's most important developments across the crypto ecosystem, compiled from 10+ sources.
            </p>
          </div>
          <span className="text-[10px] bg-green-900/30 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
            Updated today
          </span>
        </div>
      </Card>

      {/* Summary Sections */}
      {sections.map((section, si) => (
        <div key={si} className="space-y-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className={`w-8 h-8 ${section.iconBg} rounded-lg flex items-center justify-center`}>
              {section.icon}
            </div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">{section.title}</h3>
            <div className="flex-1 h-px bg-gray-800 ml-2" />
          </div>
          <div className="space-y-3">
            {section.items.map((item, ii) => (
              <Card key={ii}>
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h4 className="text-sm font-semibold text-white leading-snug">{item.headline}</h4>
                  <SentimentBadge sentiment={item.sentiment} />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{item.detail}</p>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Disclaimer */}
      <p className="text-[10px] text-gray-600 text-center px-4">
        This summary is generated for informational purposes only and does not constitute financial advice. Always conduct your own research before making investment decisions.
      </p>
    </div>
  );
}

const CATEGORIES = ['All', 'Bitcoin', 'Ethereum', 'DeFi', 'Regulation', 'AI & Trading', 'Infrastructure'];

type TabType = 'latest' | 'summary';

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<TabType>('latest');

  useEffect(() => {
    setLoading(true);
    // Simulate API fetch delay
    setTimeout(() => {
      setNews(generateNewsItems());
      setLoading(false);
    }, 500);
  }, []);

  const filtered = category === 'All' ? news : news.filter(n => n.category === category);

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <div className="space-y-6">
      {/* Tab Toggle */}
      <div className="flex items-center gap-1 bg-gray-900/50 p-1 rounded-xl w-fit border border-gray-800">
        <button
          onClick={() => setActiveTab('latest')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'latest'
              ? 'bg-indigo-600/20 text-indigo-400 shadow-sm border border-indigo-500/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Newspaper size={16} />
          Latest News
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'summary'
              ? 'bg-indigo-600/20 text-indigo-400 shadow-sm border border-indigo-500/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText size={16} />
          Daily Summary
        </button>
      </div>

      {activeTab === 'latest' ? (
        <>
          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  category === cat
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={() => { setLoading(true); setTimeout(() => { setNews(generateNewsItems()); setLoading(false); }, 500); }}
              className="ml-auto p-2 text-gray-400 hover:text-white transition-colors"
              title="Refresh news"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="space-y-4">
              {/* Featured story */}
              {filtered.length > 0 && (
                <Card className="border-indigo-500/20">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Newspaper size={24} className="text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded-full">{filtered[0].category}</span>
                        <span className="text-[10px] text-gray-600 flex items-center gap-1"><Clock size={10} />{timeAgo(filtered[0].publishedAt)}</span>
                      </div>
                      <h2 className="text-lg font-bold text-white mb-2">{filtered[0].title}</h2>
                      <p className="text-sm text-gray-400 mb-2">{filtered[0].description}</p>
                      <p className="text-xs text-gray-600">Source: {filtered[0].source}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Rest of news */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.slice(1).map((item, i) => (
                  <Card key={i}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{item.category}</span>
                      <span className="text-[10px] text-gray-600 flex items-center gap-1"><Clock size={10} />{timeAgo(item.publishedAt)}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">{item.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">{item.description}</p>
                    <p className="text-[10px] text-gray-600">Source: {item.source}</p>
                  </Card>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  <Newspaper className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                  <p className="text-sm">No news in this category.</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <DailySummaryView />
      )}
    </div>
  );
}
