import { useEffect, useState } from 'react';
import { useAgentStore } from '../store/agentStore';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AgentStatusDot } from '../components/ui/AgentStatusDot';
import { SignalBadge } from '../components/ui/Badge';
import { AGENT_ROLES, AGENT_LABELS } from '@crypto-saas/shared';
import type { AgentRole, AgentReport } from '@crypto-saas/shared';
import ReactMarkdown from 'react-markdown';

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

  return (
    <div className="space-y-6">
      {/* Run Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-400">Pipeline Run:</label>
        <select
          value={selectedRunId || ''}
          onChange={(e) => setSelectedRunId(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
        >
          {runs.map((run) => (
            <option key={run.id} value={run.id}>
              {new Date(run.startedAt).toLocaleString()} - {run.status}
            </option>
          ))}
        </select>
      </div>

      {/* Agent Tabs */}
      <div className="flex gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800">
        {AGENT_ROLES.map((role) => {
          const hasReport = runReports.some((r) => r.agentRole === role);
          return (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedRole === role
                  ? 'bg-indigo-600 text-white'
                  : hasReport
                  ? 'text-gray-300 hover:bg-gray-800'
                  : 'text-gray-600'
              }`}
            >
              <AgentStatusDot status={agentStatuses[role] || 'idle'} />
              {AGENT_LABELS[role]}
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : activeReport ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3">
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{activeReport.content}</ReactMarkdown>
            </div>
          </Card>
          <div className="space-y-4">
            <Card title="Report Info">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Agent:</span>{' '}
                  <span className="text-gray-200">{AGENT_LABELS[activeReport.agentRole]}</span>
                </div>
                <div>
                  <span className="text-gray-500">Time:</span>{' '}
                  <span className="text-gray-200">{new Date(activeReport.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Run ID:</span>{' '}
                  <span className="text-gray-400 font-mono text-xs">{activeReport.runId.slice(0, 8)}</span>
                </div>
              </div>
            </Card>
            <Card title="Signals from this Agent">
              {activeReport.signals && activeReport.signals.length > 0 ? (
                <div className="space-y-2">
                  {activeReport.signals.map((s: any, i: number) => (
                    <div key={i} className="p-2 bg-gray-800/50 rounded text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-200">{s.coinSymbol}</span>
                        <SignalBadge type={s.type} />
                        <span className="text-gray-500">{s.confidence}%</span>
                      </div>
                      <p className="text-gray-500">{s.reasoning}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No signals from this report.</p>
              )}
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <p className="text-gray-500 text-center py-10">
            {runs.length === 0
              ? 'No agent runs yet. Click "Run Agents" to start the pipeline.'
              : 'No report available for this agent in this run.'}
          </p>
        </Card>
      )}
    </div>
  );
}
