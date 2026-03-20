import { useState, useRef, useEffect } from 'react';
import { Play, RefreshCw, Sun, Moon, ExternalLink, ChevronDown, Clock, Timer } from 'lucide-react';
import { useMarketStore } from '../../store/marketStore';
import { useAgentStore } from '../../store/agentStore';
import { useThemeStore } from '../../store/themeStore';
import { PriceChange } from '../ui/PriceChange';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { NotificationBell } from '../notifications/NotificationBell';
import { agents as agentsApi } from '../../services/api';

const SCHEDULE_OPTIONS = [
  { value: 'off', label: 'Manual Only' },
  { value: '1h', label: 'Every Hour' },
  { value: '6h', label: 'Every 6 Hours' },
  { value: '12h', label: 'Every 12 Hours' },
  { value: '24h', label: 'Every 24 Hours' },
] as const;

const RESEARCH_LINKS = [
  { name: 'TradingView', url: 'https://www.tradingview.com', color: '#2962FF' },
  { name: 'CoinMarketCap', url: 'https://coinmarketcap.com', color: '#17181B' },
  { name: 'DEX Screener', url: 'https://dexscreener.com', color: '#1C1C28' },
  { name: 'CoinGecko', url: 'https://www.coingecko.com', color: '#8BC53F' },
  { name: 'Messari', url: 'https://messari.io', color: '#1652F0' },
  { name: 'Glassnode', url: 'https://glassnode.com', color: '#1FBF92' },
];

function formatUsd(n: number): string {
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  return '$' + n.toLocaleString();
}

export function Header({ title }: { title: string }) {
  const globalMetrics = useMarketStore((s) => s.globalMetrics);
  const { triggerRun, pipelineRunning } = useAgentStore();
  const fetchAll = useMarketStore((s) => s.fetchAll);
  const { theme, toggleTheme } = useThemeStore();
  const [showResearch, setShowResearch] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleInterval, setScheduleInterval] = useState('1h');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    agentsApi.getSchedule().then(setScheduleInterval).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowResearch(false);
      }
      if (scheduleRef.current && !scheduleRef.current.contains(e.target as Node)) {
        setShowSchedule(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScheduleChange = async (interval: string) => {
    try {
      await agentsApi.setSchedule(interval);
      setScheduleInterval(interval);
    } catch { }
    setShowSchedule(false);
  };

  return (
    <header className="h-16 bg-gray-900/80 backdrop-blur border-b border-gray-800 flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-gray-100">{title}</h2>

      <div className="flex items-center gap-4">
        {/* Global ticker */}
        {globalMetrics && (
          <div className="hidden xl:flex items-center gap-5 text-xs text-gray-400">
            <div>
              <span className="text-gray-500">Mkt Cap</span>{' '}
              <span className="text-gray-200">{formatUsd(globalMetrics.totalMarketCap)}</span>
            </div>
            <div>
              <span className="text-gray-500">24h</span>{' '}
              <PriceChange value={globalMetrics.totalMarketCapChange24h} />
            </div>
            <div>
              <span className="text-gray-500">BTC</span>{' '}
              <span className="text-gray-200">{globalMetrics.btcDominance.toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* Research Links Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowResearch(!showResearch)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ExternalLink size={12} />
            <span className="hidden md:inline">Research</span>
            <ChevronDown size={10} className={`transition-transform ${showResearch ? 'rotate-180' : ''}`} />
          </button>

          {showResearch && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-xl shadow-black/30 py-2 z-50">
              <p className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Research & Trading</p>
              {RESEARCH_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  onClick={() => setShowResearch(false)}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: link.color }} />
                  {link.name}
                  <ExternalLink size={10} className="ml-auto text-gray-600" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-800"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <NotificationBell />

        <button
          onClick={() => fetchAll()}
          className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
          title="Refresh market data"
        >
          <RefreshCw size={16} />
        </button>

        <div className="flex items-center">
          <button
            onClick={() => triggerRun()}
            disabled={pipelineRunning}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50 rounded-r-none"
          >
            {pipelineRunning ? <LoadingSpinner size="sm" /> : <Play size={14} />}
            {pipelineRunning ? 'Running...' : 'Run Agents'}
          </button>

          {/* Schedule Dropdown */}
          <div className="relative" ref={scheduleRef}>
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="btn-primary flex items-center gap-1 text-sm rounded-l-none border-l border-indigo-400/30 px-2 py-2"
              title={`Schedule: ${SCHEDULE_OPTIONS.find(o => o.value === scheduleInterval)?.label || 'Manual'}`}
            >
              <Timer size={13} />
              <ChevronDown size={10} className={`transition-transform ${showSchedule ? 'rotate-180' : ''}`} />
            </button>

            {showSchedule && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-xl shadow-black/30 py-2 z-50">
                <p className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <Clock size={10} /> Auto-Run Schedule
                </p>
                {SCHEDULE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleScheduleChange(opt.value)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                      scheduleInterval === opt.value
                        ? 'text-indigo-400 bg-indigo-500/10'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {opt.label}
                    {scheduleInterval === opt.value && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">Active</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
