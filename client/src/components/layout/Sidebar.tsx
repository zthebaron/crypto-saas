import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, Bot, Zap, Star, Settings, LogOut,
  Briefcase, GitCompareArrows, BookOpen, ShieldAlert, Target,
  CreditCard, Info, Newspaper, Plug, ShieldCheck, ArrowLeftRight, Palette,
  PanelLeftClose, PanelLeftOpen, X,
} from 'lucide-react';
import { useAgentStore } from '../../store/agentStore';
import { useAuthStore } from '../../store/authStore';
import { useSidebarStore } from '../../store/sidebarStore';
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
  { to: '/brand', icon: Palette, label: 'Brand Kit' },
  { to: '/admin', icon: ShieldCheck, label: 'Admin', adminOnly: true },
  { to: '/settings', icon: Settings, label: 'Settings' },
] as const;

export function Sidebar() {
  const agentStatuses = useAgentStore((s) => s.agentStatuses);
  const { user, logout } = useAuthStore();
  const { collapsed, mobileOpen, toggleCollapsed, setMobileOpen } = useSidebarStore();

  // Filter admin-only items for non-admin users
  const visibleNavItems = navItems.filter(item =>
    !('adminOnly' in item && item.adminOnly) || user?.role === 'admin'
  );

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-64';

  const sidebarContent = (
    <aside
      className={`${sidebarWidth} h-screen bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-200 ease-in-out`}
    >
      {/* Logo + Collapse Toggle */}
      <div className="flex items-center border-b border-gray-800">
        <NavLink
          to="/"
          className="flex-1 block p-4 hover:bg-gray-800/50 transition-colors overflow-hidden"
          onClick={() => setMobileOpen(false)}
        >
          <BlockViewLogo size={collapsed ? 'sm' : 'md'} showText={!collapsed} showSubtext={!collapsed} />
        </NavLink>

        {/* Collapse button - desktop only */}
        <button
          onClick={toggleCollapsed}
          className="hidden lg:flex p-2 mr-2 text-gray-500 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>

        {/* Close button - mobile only */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 mr-2 text-gray-500 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {visibleNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
                collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}

        {/* Agent Status Section */}
        <div className="pt-3 mt-3 border-t border-gray-800">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Agent Status
            </p>
          )}
          {AGENT_ROLES.map((role) => (
            <div
              key={role}
              className={`flex items-center gap-2 py-1.5 text-xs text-gray-400 ${
                collapsed ? 'justify-center px-1' : 'px-3'
              }`}
              title={collapsed ? AGENT_LABELS[role] : undefined}
            >
              <AgentStatusDot status={agentStatuses[role] || 'idle'} />
              {!collapsed && <span className="truncate">{AGENT_LABELS[role]}</span>}
            </div>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-2 border-t border-gray-800">
        {user ? (
          collapsed ? (
            <button
              onClick={logout}
              className="w-full flex justify-center p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-800"
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          ) : (
            <div className="flex items-center justify-between px-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{user.displayName}</p>
                <p className="text-xs text-gray-500 capitalize">{user.tier} plan</p>
              </div>
              <button onClick={logout} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          )
        ) : (
          <NavLink
            to="/login"
            onClick={() => setMobileOpen(false)}
            className={`btn-primary block text-center text-sm ${collapsed ? 'px-2' : ''}`}
          >
            {collapsed ? <LogOut size={16} className="mx-auto rotate-180" /> : 'Sign In'}
          </NavLink>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar - fixed position */}
      <div className={`hidden lg:block fixed left-0 top-0 z-30 ${sidebarWidth} transition-all duration-200`}>
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar - slides in from left */}
      <div
        className={`lg:hidden fixed left-0 top-0 z-50 h-screen transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Force expanded on mobile for usability */}
        <aside className="w-64 h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
          {/* Logo + Close */}
          <div className="flex items-center border-b border-gray-800">
            <NavLink
              to="/"
              className="flex-1 block p-4 hover:bg-gray-800/50 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <BlockViewLogo size="md" showText showSubtext />
            </NavLink>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 mr-2 text-gray-500 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {visibleNavItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`
                }
              >
                <Icon size={18} className="flex-shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}

            <div className="pt-3 mt-3 border-t border-gray-800">
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

          {/* User */}
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
              <NavLink to="/login" onClick={() => setMobileOpen(false)} className="btn-primary block text-center text-sm">
                Sign In
              </NavLink>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
