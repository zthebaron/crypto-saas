import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, Bot, Zap, Star, Settings, LogOut,
} from 'lucide-react';
import { useAgentStore } from '../../store/agentStore';
import { useAuthStore } from '../../store/authStore';
import { AgentStatusDot } from '../ui/AgentStatusDot';
import { AGENT_ROLES, AGENT_LABELS } from '@crypto-saas/shared';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/market', icon: BarChart3, label: 'Market Data' },
  { to: '/agents', icon: Bot, label: 'Agent Reports' },
  { to: '/signals', icon: Zap, label: 'Signals' },
  { to: '/watchlist', icon: Star, label: 'Watchlist' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const agentStatuses = useAgentStore((s) => s.agentStatuses);
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-64 h-screen bg-gray-900 border-r border-gray-800 flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          CryptoSaaS
        </h1>
        <p className="text-xs text-gray-500 mt-1">AI-Powered Research</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        {/* Agent Status Section */}
        <div className="pt-4 mt-4 border-t border-gray-800">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Agent Status
          </p>
          {AGENT_ROLES.map((role) => (
            <div key={role} className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400">
              <AgentStatusDot status={agentStatuses[role] || 'idle'} />
              {AGENT_LABELS[role]}
            </div>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-gray-800">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{user.displayName}</p>
              <p className="text-xs text-gray-500 capitalize">{user.tier} plan</p>
            </div>
            <button onClick={logout} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <NavLink to="/login" className="btn-primary block text-center text-sm">
            Sign In
          </NavLink>
        )}
      </div>
    </aside>
  );
}
