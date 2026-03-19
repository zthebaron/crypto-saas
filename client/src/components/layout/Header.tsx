import { Play, RefreshCw } from 'lucide-react';
import { useMarketStore } from '../../store/marketStore';
import { useAgentStore } from '../../store/agentStore';
import { PriceChange } from '../ui/PriceChange';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { NotificationBell } from '../notifications/NotificationBell';

function formatUsd(n: number): string {
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  return '$' + n.toLocaleString();
}

export function Header({ title }: { title: string }) {
  const globalMetrics = useMarketStore((s) => s.globalMetrics);
  const { triggerRun, pipelineRunning } = useAgentStore();
  const fetchAll = useMarketStore((s) => s.fetchAll);

  return (
    <header className="h-16 bg-gray-900/80 backdrop-blur border-b border-gray-800 flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-gray-100">{title}</h2>

      <div className="flex items-center gap-6">
        {/* Global ticker */}
        {globalMetrics && (
          <div className="hidden lg:flex items-center gap-5 text-xs text-gray-400">
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

        <NotificationBell />

        <button
          onClick={() => fetchAll()}
          className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
          title="Refresh market data"
        >
          <RefreshCw size={16} />
        </button>

        <button
          onClick={() => triggerRun()}
          disabled={pipelineRunning}
          className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
        >
          {pipelineRunning ? <LoadingSpinner size="sm" /> : <Play size={14} />}
          {pipelineRunning ? 'Running...' : 'Run Agents'}
        </button>
      </div>
    </header>
  );
}
