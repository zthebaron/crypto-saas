import type { AgentStatus } from '@crypto-saas/shared';

const dotStyles: Record<AgentStatus, string> = {
  idle: 'bg-gray-500',
  running: 'bg-yellow-400 animate-pulse',
  completed: 'bg-green-500',
  error: 'bg-red-500',
};

export function AgentStatusDot({ status }: { status: AgentStatus }) {
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${dotStyles[status]}`} />;
}
