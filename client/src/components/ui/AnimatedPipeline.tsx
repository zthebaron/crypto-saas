import { useEffect, useRef, useState } from 'react';
import { useAgentStore } from '../../store/agentStore';
import { AGENT_ROLES, AGENT_LABELS } from '@crypto-saas/shared';
import type { AgentRole, AgentStatus } from '@crypto-saas/shared';
import {
  Scan, Brain, ShieldCheck, Compass, PieChart as PieChartIcon,
  Play, CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';

/* ─── Agent Metadata ─── */

const AGENT_ICONS: Record<AgentRole, typeof Scan> = {
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

const AGENT_SUBTITLES: Record<AgentRole, string> = {
  market_scanner: 'Price & Volume',
  sentiment_analyst: 'News & Social',
  risk_assessor: 'Risk Metrics',
  opportunity_scout: 'Trade Setups',
  portfolio_advisor: 'Allocation',
};

/* ─── Animated Spinner Ring (SVG) ─── */

function SpinnerRing({ color, size = 72 }: { color: string; size?: number }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 72 72"
      className="absolute inset-0 m-auto"
      style={{ animation: 'pipeline-spin 1.5s linear infinite' }}
    >
      <circle
        cx="36" cy="36" r="32"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeDasharray="60 140"
        strokeLinecap="round"
        opacity="0.8"
      />
      <circle
        cx="36" cy="36" r="32"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="20 180"
        strokeLinecap="round"
        opacity="0.4"
        style={{ animation: 'pipeline-spin-reverse 2s linear infinite' }}
      />
    </svg>
  );
}

/* ─── Pulsing Glow Effect ─── */

function PulseGlow({ color }: { color: string }) {
  return (
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`,
        animation: 'pipeline-pulse 2s ease-in-out infinite',
      }}
    />
  );
}

/* ─── Connection Line Between Nodes ─── */

function ConnectionLine({
  fromStatus,
  toStatus,
  fromColor,
  toColor,
}: {
  fromStatus: AgentStatus;
  toStatus: AgentStatus;
  fromColor: string;
  toColor: string;
}) {
  const isActive = fromStatus === 'completed' && toStatus === 'running';
  const isCompleted = fromStatus === 'completed' && toStatus === 'completed';
  const hasError = toStatus === 'error';
  const isPending = fromStatus === 'idle' || (fromStatus !== 'completed' && toStatus === 'idle');

  return (
    <div className="flex items-center mx-1 relative" style={{ width: 48, height: 48 }}>
      {/* Base line */}
      <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2"
        style={{
          background: isPending
            ? '#1f2937'
            : isCompleted
            ? `linear-gradient(90deg, ${fromColor}, ${toColor})`
            : hasError
            ? '#ef4444'
            : `linear-gradient(90deg, ${fromColor}, ${toColor})`,
          opacity: isPending ? 0.4 : isCompleted ? 0.7 : hasError ? 0.5 : 0.5,
        }}
      />
      {/* Animated data particle flowing along line */}
      {isActive && (
        <>
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{
              background: toColor,
              boxShadow: `0 0 8px ${toColor}`,
              animation: 'pipeline-flow 1s ease-in-out infinite',
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
            style={{
              background: toColor,
              boxShadow: `0 0 6px ${toColor}`,
              animation: 'pipeline-flow 1s ease-in-out infinite 0.4s',
            }}
          />
        </>
      )}
      {/* Completed checkmark line overlay */}
      {isCompleted && (
        <div
          className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2"
          style={{
            background: `linear-gradient(90deg, ${fromColor}, ${toColor})`,
            animation: 'pipeline-line-glow 3s ease-in-out infinite',
          }}
        />
      )}
      {/* Arrow head */}
      <svg
        width="8" height="8"
        viewBox="0 0 8 8"
        className="absolute right-0 top-1/2 -translate-y-1/2"
        style={{ opacity: isPending ? 0.2 : 0.6 }}
      >
        <path
          d="M0 0 L8 4 L0 8 Z"
          fill={isPending ? '#374151' : isCompleted ? toColor : hasError ? '#ef4444' : toColor}
        />
      </svg>
    </div>
  );
}

/* ─── Single Agent Node ─── */

function AgentNode({
  role,
  status,
  index,
}: {
  role: AgentRole;
  status: AgentStatus;
  index: number;
}) {
  const Icon = AGENT_ICONS[role];
  const color = AGENT_COLORS[role];
  const isRunning = status === 'running';
  const isCompleted = status === 'completed';
  const isError = status === 'error';
  const isIdle = status === 'idle';

  return (
    <div
      className="flex flex-col items-center gap-2 relative"
      style={{
        opacity: isIdle ? 0.35 : 1,
        transition: 'opacity 0.5s ease',
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Node container */}
      <div className="relative" style={{ width: 72, height: 72 }}>
        {/* Pulse glow when running */}
        {isRunning && <PulseGlow color={color} />}

        {/* Spinner ring when running */}
        {isRunning && <SpinnerRing color={color} />}

        {/* Completed ring */}
        {isCompleted && (
          <svg
            width={72} height={72}
            viewBox="0 0 72 72"
            className="absolute inset-0"
          >
            <circle
              cx="36" cy="36" r="32"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              opacity="0.4"
              strokeDasharray="201"
              strokeDashoffset="0"
              style={{
                animation: 'pipeline-draw 0.8s ease-out forwards',
              }}
            />
          </svg>
        )}

        {/* Error ring */}
        {isError && (
          <svg
            width={72} height={72}
            viewBox="0 0 72 72"
            className="absolute inset-0"
          >
            <circle
              cx="36" cy="36" r="32"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              opacity="0.5"
            />
          </svg>
        )}

        {/* Main icon background */}
        <div
          className="w-[56px] h-[56px] rounded-2xl flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
          style={{
            backgroundColor: isRunning
              ? color + '30'
              : isCompleted
              ? '#22c55e18'
              : isError
              ? '#ef444418'
              : color + '10',
            border: `1.5px solid ${
              isRunning ? color + '60'
              : isCompleted ? '#22c55e40'
              : isError ? '#ef444440'
              : color + '15'
            }`,
            boxShadow: isRunning
              ? `0 0 20px ${color}30, 0 0 40px ${color}15`
              : isCompleted
              ? `0 0 15px #22c55e20`
              : 'none',
          }}
        >
          <Icon
            size={26}
            style={{
              color: isRunning
                ? color
                : isCompleted
                ? '#22c55e'
                : isError
                ? '#ef4444'
                : color,
              transition: 'color 0.5s ease',
            }}
          />
        </div>

        {/* Status badge */}
        {isCompleted && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-gray-900 z-10"
            style={{ animation: 'pipeline-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
            <CheckCircle2 size={14} className="text-white" />
          </div>
        )}
        {isError && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-gray-900 z-10">
            <AlertCircle size={14} className="text-white" />
          </div>
        )}
        {isRunning && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-gray-900 z-10">
            <Loader2 size={14} className="text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Label */}
      <div className="text-center">
        <p className={`text-[11px] font-bold leading-tight transition-colors duration-500 ${
          isRunning ? 'text-white'
          : isCompleted ? 'text-green-400'
          : isError ? 'text-red-400'
          : 'text-gray-500'
        }`}>
          {AGENT_LABELS[role]}
        </p>
        <p className={`text-[9px] mt-0.5 transition-colors duration-500 ${
          isRunning ? 'text-gray-400'
          : isCompleted ? 'text-green-500/60'
          : isError ? 'text-red-500/60'
          : 'text-gray-600'
        }`}>
          {AGENT_SUBTITLES[role]}
        </p>
      </div>

      {/* Running status text */}
      {isRunning && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: color + '20', color }}>
            Analyzing...
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Main Pipeline Visualization ─── */

export function AnimatedPipeline() {
  const { agentStatuses, pipelineRunning, triggerRun } = useAgentStore();
  const [starting, setStarting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRunPipeline = async () => {
    setStarting(true);
    try {
      await triggerRun();
    } finally {
      // The pipeline running state is managed by websocket events
      setTimeout(() => setStarting(false), 2000);
    }
  };

  const completedCount = AGENT_ROLES.filter(r => agentStatuses[r] === 'completed').length;
  const runningRole = AGENT_ROLES.find(r => agentStatuses[r] === 'running');
  const hasErrors = AGENT_ROLES.some(r => agentStatuses[r] === 'error');
  const allIdle = AGENT_ROLES.every(r => agentStatuses[r] === 'idle');
  const allComplete = completedCount === 5;

  return (
    <div className="relative">
      {/* Inject keyframe animations */}
      <style>{`
        @keyframes pipeline-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pipeline-spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pipeline-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes pipeline-flow {
          0% { left: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: calc(100% - 8px); opacity: 0; }
        }
        @keyframes pipeline-draw {
          from { stroke-dashoffset: 201; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes pipeline-pop {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
        @keyframes pipeline-line-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes pipeline-bg-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div
        ref={containerRef}
        className="bg-gray-900/70 border border-gray-800/60 rounded-2xl p-6 overflow-hidden relative"
      >
        {/* Animated background gradient when running */}
        {pipelineRunning && (
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, transparent 0%, rgba(99,102,241,0.03) 25%, transparent 50%, rgba(139,92,246,0.03) 75%, transparent 100%)',
              backgroundSize: '400% 400%',
              animation: 'pipeline-bg-shift 8s ease infinite',
            }}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
              AI Agent Pipeline
            </h3>
            {pipelineRunning && runningRole && (
              <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                {completedCount}/5 complete
              </span>
            )}
            {allComplete && (
              <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                Pipeline Complete
              </span>
            )}
            {hasErrors && !pipelineRunning && (
              <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
                Errors Detected
              </span>
            )}
          </div>

          <button
            onClick={handleRunPipeline}
            disabled={pipelineRunning || starting}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-300 ${
              pipelineRunning || starting
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40'
            }`}
          >
            {pipelineRunning ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Running...
              </>
            ) : starting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play size={14} />
                Run Pipeline
              </>
            )}
          </button>
        </div>

        {/* Progress bar */}
        {(pipelineRunning || allComplete || hasErrors) && (
          <div className="mb-5 relative z-10">
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${(completedCount / 5) * 100}%`,
                  background: hasErrors
                    ? 'linear-gradient(90deg, #22c55e, #ef4444)'
                    : 'linear-gradient(90deg, #6366f1, #8b5cf6, #22c55e)',
                }}
              />
            </div>
          </div>
        )}

        {/* Pipeline Nodes */}
        <div className="flex items-start justify-center gap-0 overflow-x-auto pb-2 relative z-10 pt-6">
          {AGENT_ROLES.map((role, index) => (
            <div key={role} className="flex items-center flex-shrink-0">
              <AgentNode
                role={role}
                status={agentStatuses[role] || 'idle'}
                index={index}
              />
              {index < AGENT_ROLES.length - 1 && (
                <ConnectionLine
                  fromStatus={agentStatuses[role] || 'idle'}
                  toStatus={agentStatuses[AGENT_ROLES[index + 1]] || 'idle'}
                  fromColor={AGENT_COLORS[role]}
                  toColor={AGENT_COLORS[AGENT_ROLES[index + 1]]}
                />
              )}
            </div>
          ))}
        </div>

        {/* Bottom hint text */}
        {allIdle && !pipelineRunning && (
          <p className="text-center text-[10px] text-gray-600 mt-4 relative z-10">
            Click "Run Pipeline" to start the AI analysis chain
          </p>
        )}
      </div>
    </div>
  );
}
