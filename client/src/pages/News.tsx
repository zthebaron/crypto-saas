import { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, RefreshCw, Clock } from 'lucide-react';
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

const CATEGORIES = ['All', 'Bitcoin', 'Ethereum', 'DeFi', 'Regulation', 'AI & Trading', 'Infrastructure'];

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');

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
    </div>
  );
}
