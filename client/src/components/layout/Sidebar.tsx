import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, Bot, Zap, Star, Settings, LogOut,
  Briefcase, GitCompareArrows, BookOpen, ShieldAlert, Target,
  CreditCard, Info, Newspaper, Plug, ShieldCheck, ArrowLeftRight,
} from 'lucide-react';
import { useAgentStore } from '../../store/agentStore';
import { useAuthStore } from '../../store/authStore';
import { AgentStatusDot } from '../ui/AgentStatusDot';
import { BlockViewLogo } from '../ui/BlockViewLogo';
import { AGENT_ROLES, AGENT_LABELS } from '@crypto-saas/shared';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/market', icon: BarChart3, label: 'Market Data' },
  { to: '/agents', icon: Bot, label: 'Agent Reports' },
  { to: '/signals', icon: Zap, label: 'Signals' },
  { to: '/trade', icon: ArrowLeftRight, label: 'Trade' },
  { to: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { to: '/compare', icon: GitCompareArrows, label: 'Compare' },
  { to: '/knowledge', icon: BookOpen, label: 'Knowledge Base' },
  { to: '/rules', icon: ShieldAlert, label: 'Alert Rules' },
  { to: '/accuracy', icon: Target, label: 'Accuracy' },
  { to: '/watchlist', icon: Star, label: 'Watchlist' },
  { to: '/news', icon: Newspaper, label: 'News' },
  { to: '/pricing', icon: CreditCard, label: 'Pricing' },
  { to: '/about', icon: Info, label: 'About Us' },
  { to: '/integrations', icon: Plug, label: 'Integrations' },
  { to: '/admin', icon: ShieldCheck, label: 'Admin' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const agentStatuses = useAgentStore((s) => s.agentStatuses);
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-64 h-screen bg-gray-900 border-r border-gray-800 flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <NavLink to="/" className="block p-5 border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
        <BlockViewLogo size="md" showText={true} showSubtext={true} />
      </NavLink>

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
