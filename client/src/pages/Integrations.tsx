import { useState, useEffect } from 'react';
import { Key, Plus, Copy, Trash2, Check, ExternalLink, Shield, Zap, Globe } from 'lucide-react';

const RAILWAY_API = 'https://crypto-saasserver-production.up.railway.app/api';
const API_BASE = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? '/api' : RAILWAY_API);

interface ApiKeyData {
  id: string;
  name: string;
  key: string;
  lastUsedAt: string | null;
  createdAt: string;
  fullKey?: string;
}

const INTEGRATIONS = [
  { name: 'Binance', desc: 'World\'s largest crypto exchange by volume', color: '#F0B90B', logo: 'https://bin.bnbstatic.com/static/images/common/favicon.ico', category: 'Exchange' },
  { name: 'Coinbase', desc: 'Trusted platform for buying, selling, and storing crypto', color: '#0052FF', logo: 'https://www.coinbase.com/favicon.ico', category: 'Exchange' },
  { name: 'Kraken', desc: 'Secure crypto exchange with advanced trading features', color: '#5741D9', logo: 'https://assets-cms.kraken.com/images/51n36hrp/facade/favicon-32x32.png', category: 'Exchange' },
  { name: 'KuCoin', desc: 'Global exchange with 700+ digital assets', color: '#23AF91', logo: 'https://assets.staticimg.com/cms/media/1lB3PkckFDyfxz6VudCEACGX8RA.png', category: 'Exchange' },
  { name: 'OKX', desc: 'Leading exchange for crypto spot and derivatives', color: '#FFFFFF', logo: 'https://static.okx.com/cdn/assets/imgs/2112/F43E7E55E4C878AF.png', category: 'Exchange' },
  { name: 'Bybit', desc: 'Fast-growing exchange with derivatives and spot trading', color: '#F7A600', logo: 'https://www.bybit.com/favicon.ico', category: 'Exchange' },
  { name: 'Gate.io', desc: 'Exchange with 1400+ cryptocurrencies and DeFi services', color: '#2354E6', logo: 'https://www.gate.io/favicon.ico', category: 'Exchange' },
  { name: 'Bitget', desc: 'Copy trading and social trading platform', color: '#00F0FF', logo: 'https://www.bitget.com/favicon.ico', category: 'Exchange' },
  { name: 'TradingView', desc: 'Advanced charting and technical analysis platform', color: '#2962FF', logo: 'https://static.tradingview.com/static/images/favicon.ico', category: 'Analytics' },
  { name: 'CoinMarketCap', desc: 'Market data, rankings, and price tracking', color: '#3861FB', logo: 'https://s2.coinmarketcap.com/static/cloud/img/favicon.ico', category: 'Data' },
  { name: 'CoinGecko', desc: 'Independent crypto data aggregator', color: '#8BC53F', logo: 'https://static.coingecko.com/s/thumbnail-007177f3eca19695592f0b8b0eabbdae282b54154e1be912285c9034ea6cbaf2.png', category: 'Data' },
  { name: 'DEX Screener', desc: 'Real-time DEX analytics and pair tracking', color: '#88D693', logo: 'https://dexscreener.com/favicon.png', category: 'Analytics' },
  { name: 'Messari', desc: 'Crypto research, data, and tools for professionals', color: '#1652F0', logo: 'https://messari.io/favicon.ico', category: 'Research' },
  { name: 'Glassnode', desc: 'On-chain market intelligence and analytics', color: '#1FBF92', logo: 'https://glassnode.com/favicon.ico', category: 'Analytics' },
  { name: 'Chainalysis', desc: 'Blockchain data platform for compliance and investigation', color: '#FF5A00', logo: 'https://www.chainalysis.com/favicon.ico', category: 'Compliance' },
  { name: 'MetaMask', desc: 'Leading self-custody Web3 wallet', color: '#E2761B', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg', category: 'Wallet' },
  { name: 'Phantom', desc: 'Multi-chain wallet for Solana, Ethereum, and more', color: '#AB9FF2', logo: 'https://phantom.app/favicon.ico', category: 'Wallet' },
  { name: 'Uniswap', desc: 'Largest decentralized exchange protocol', color: '#FF007A', logo: 'https://app.uniswap.org/favicon.png', category: 'DeFi' },
];

export default function Integrations() {
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(INTEGRATIONS.map(i => i.category)))];
  const filteredIntegrations = categoryFilter === 'All' ? INTEGRATIONS : INTEGRATIONS.filter(i => i.category === categoryFilter);

  const fetchKeys = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api-keys`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.data || []);
      }
    } catch {}
  };

  useEffect(() => { fetchKeys(); }, []);

  const generateKey = async () => {
    if (!newKeyName.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newKeyName }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewKey(data.data.fullKey);
        setNewKeyName('');
        fetchKeys();
      }
    } catch {}
    setLoading(false);
  };

  const deleteKey = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api-keys/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchKeys();
    } catch {}
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-10 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-600/15 rounded-2xl flex items-center justify-center">
          <Globe size={24} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Integrations & API</h1>
          <p className="text-sm text-gray-400">Connect BlockView with your favorite trading platforms and tools</p>
        </div>
      </div>

      {/* API Key Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
          <Key size={18} className="text-indigo-400" />
          <h2 className="text-lg font-bold text-white">API Keys</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-400">
            Generate API keys to access BlockView programmatically. Enterprise plan includes up to 10,000 API requests per day.
          </p>

          {/* Generate Key Form */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g., Trading Bot, Dashboard)"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={generateKey}
              disabled={!newKeyName.trim() || loading}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Plus size={14} />
              Generate Key
            </button>
          </div>

          {/* Newly Generated Key (show once) */}
          {newKey && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={14} className="text-green-400" />
                <p className="text-sm text-green-300 font-semibold">API Key Generated — copy it now, you won't see it again!</p>
              </div>
              <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-3">
                <code className="text-xs text-indigo-300 flex-1 font-mono break-all">{newKey}</code>
                <button
                  onClick={() => { copyToClipboard(newKey, 'new'); setNewKey(null); }}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Keys Table */}
          {apiKeys.length > 0 ? (
            <div className="border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-left px-4 py-3">Key</th>
                    <th className="text-left px-4 py-3">Created</th>
                    <th className="text-left px-4 py-3">Last Used</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {apiKeys.map((k) => (
                    <tr key={k.id} className="hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-gray-200 font-medium">{k.name}</td>
                      <td className="px-4 py-3">
                        <code className="text-xs text-gray-400 font-mono">{k.key}</code>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(k.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => deleteKey(k.id)} className="text-red-400 hover:text-red-300 p-1">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              <Key size={24} className="mx-auto mb-2 text-gray-600" />
              No API keys generated yet
            </div>
          )}
        </div>
      </div>

      {/* Integration Partners */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Integration Partners</h2>
            <p className="text-sm text-gray-400 mt-1">BlockView integrates seamlessly with the world's leading crypto platforms</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration) => (
            <div key={integration.name} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-800"
                  style={{ backgroundColor: integration.color + '15' }}>
                  <img
                    src={integration.logo}
                    alt={integration.name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      // Fallback to first letter if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<span style="color:${integration.color};font-size:1.25rem;font-weight:700">${integration.name[0]}</span>`;
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{integration.name}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-400">{integration.category}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{integration.desc}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[10px] text-green-400 font-medium">Available</span>
                </div>
                <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Configure <ExternalLink size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Documentation */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} className="text-indigo-400" />
          <h3 className="text-lg font-bold text-white">API Documentation</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { method: 'GET', path: '/api/market/coins', desc: 'Fetch live market data for all tracked coins' },
            { method: 'GET', path: '/api/signals?limit=20', desc: 'Get latest AI-generated trading signals' },
            { method: 'POST', path: '/api/agents/run', desc: 'Trigger a new AI agent pipeline run' },
            { method: 'GET', path: '/api/portfolio', desc: 'Retrieve your portfolio positions and P&L' },
            { method: 'GET', path: '/api/accuracy', desc: 'Get historical signal accuracy metrics' },
            { method: 'GET', path: '/api/compare?symbols=BTC,ETH', desc: 'Compare multiple coins side-by-side' },
          ].map(({ method, path, desc }) => (
            <div key={path} className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  method === 'GET' ? 'bg-green-500/15 text-green-400' : 'bg-blue-500/15 text-blue-400'
                }`}>{method}</span>
                <code className="text-xs text-gray-300 font-mono">{path}</code>
              </div>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
