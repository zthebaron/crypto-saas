import { useState, useEffect } from 'react';
import {
  Users, DollarSign, Activity, TrendingUp, Crown, Shield, Zap,
  Search, ChevronLeft, ChevronRight, MoreVertical, Ban, Trash2, Star,
  CreditCard, ArrowUpRight, ArrowDownRight, UserPlus,
} from 'lucide-react';

interface AdminStatsData {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalRuns: number;
  freeUsers: number;
  platinumUsers: number;
  enterpriseUsers: number;
  recentSignups: number;
}

interface AdminUserData {
  id: string;
  email: string;
  displayName: string;
  tier: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  totalRuns: number;
}

interface PaymentData {
  id: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = (path: string, opts?: RequestInit) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...opts?.headers as Record<string, string> };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${API_BASE}/admin${path}`, {
    ...opts,
    headers,
  }).then(r => r.json());
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [tab, setTab] = useState<'users' | 'payments'>('users');
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = () => api('/stats').then(r => setStats(r.data)).catch(() => setError('Failed to load admin data. Please check your connection.'));
  const fetchUsers = () => api(`/users?page=${page}&limit=15&search=${search}&filter=${filter}`).then(r => { setUsers(r.data?.users || []); setTotalUsers(r.data?.total || 0); }).catch(() => {});
  const fetchPayments = () => api(`/payments?page=1&limit=20`).then(r => setPayments(r.data?.payments || [])).catch(() => {});

  useEffect(() => { fetchStats(); fetchPayments(); }, []);
  useEffect(() => { fetchUsers(); }, [page, search, filter]);

  const updateUser = async (userId: string, field: string, value: string) => {
    await api(`/users/${userId}/${field}`, { method: 'PUT', body: JSON.stringify({ [field]: value }) });
    fetchUsers();
    fetchStats();
    setActionMenu(null);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure? This will permanently delete the user and all their data.')) return;
    await api(`/users/${userId}`, { method: 'DELETE' });
    fetchUsers();
    fetchStats();
    setActionMenu(null);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Shield size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const tierColors: Record<string, string> = { free: 'text-gray-400', pro: 'text-indigo-400', premium: 'text-yellow-400' };
  const statusColors: Record<string, string> = { active: 'bg-green-500/15 text-green-400', suspended: 'bg-yellow-500/15 text-yellow-400', banned: 'bg-red-500/15 text-red-400' };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-600/15 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Manage users, subscriptions, and payments</p>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Total Users', value: stats.totalUsers, sub: `${stats.recentSignups} new this week`, color: 'text-blue-400', bg: 'bg-blue-500/15' },
            { icon: DollarSign, label: 'Monthly Revenue', value: `$${stats.monthlyRevenue.toLocaleString()}`, sub: `$${stats.totalRevenue.toLocaleString()} total`, color: 'text-green-400', bg: 'bg-green-500/15' },
            { icon: Activity, label: 'Total Runs', value: stats.totalRuns.toLocaleString(), sub: `${stats.activeUsers} active users`, color: 'text-indigo-400', bg: 'bg-indigo-500/15' },
            { icon: Crown, label: 'Paid Users', value: stats.platinumUsers + stats.enterpriseUsers, sub: `${stats.platinumUsers} Platinum · ${stats.enterpriseUsers} Enterprise`, color: 'text-yellow-400', bg: 'bg-yellow-500/15' },
          ].map(({ icon: Icon, label, value, sub, color, bg }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                  <Icon size={16} className={color} />
                </div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-[11px] text-gray-500 mt-1">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-800 pb-0">
        {(['users', 'payments'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t ? 'border-indigo-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}>
            {t === 'users' ? 'User Management' : 'Payment History'}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by email or name..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500">
              <option value="all">All Tiers</option>
              <option value="free">Free</option>
              <option value="pro">Platinum</option>
              <option value="premium">Enterprise</option>
            </select>
          </div>

          <div className="border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800/50 text-gray-400 text-[11px] uppercase tracking-wider">
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Tier</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Runs</th>
                  <th className="text-left px-4 py-3">Joined</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <p className="text-gray-200 font-medium text-sm">{u.displayName}</p>
                      <p className="text-gray-500 text-xs">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold capitalize ${tierColors[u.tier] || 'text-gray-400'}`}>{u.tier === 'pro' ? 'Platinum' : u.tier === 'premium' ? 'Enterprise' : 'Free'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[u.status] || ''}`}>{u.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${u.role === 'admin' ? 'text-red-400 font-semibold' : 'text-gray-400'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{u.totalRuns}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right relative">
                      <button onClick={() => setActionMenu(actionMenu === u.id ? null : u.id)} className="text-gray-400 hover:text-white p-1">
                        <MoreVertical size={14} />
                      </button>
                      {actionMenu === u.id && (
                        <div className="absolute right-4 top-full mt-1 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 py-1">
                          <button onClick={() => updateUser(u.id, 'tier', u.tier === 'pro' ? 'free' : 'pro')}
                            className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                            <Crown size={12} /> {u.tier === 'pro' ? 'Downgrade to Free' : 'Upgrade to Platinum'}
                          </button>
                          <button onClick={() => updateUser(u.id, 'role', u.role === 'admin' ? 'user' : 'admin')}
                            className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                            <Star size={12} /> {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          </button>
                          <button onClick={() => updateUser(u.id, 'status', u.status === 'suspended' ? 'active' : 'suspended')}
                            className="w-full text-left px-3 py-2 text-xs text-yellow-400 hover:bg-gray-800 flex items-center gap-2">
                            <Ban size={12} /> {u.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                          </button>
                          <button onClick={() => deleteUser(u.id)}
                            className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-gray-800 flex items-center gap-2">
                            <Trash2 size={12} /> Delete User
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-500 text-sm">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">{totalUsers} users total</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30"><ChevronLeft size={14} /></button>
              <span className="text-xs text-gray-400">Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={users.length < 15}
                className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30"><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {tab === 'payments' && (
        <div className="border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800/50 text-gray-400 text-[11px] uppercase tracking-wider">
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Method</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-gray-200 text-sm">{p.email}</td>
                  <td className="px-4 py-3 text-green-400 font-semibold">${p.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-300 capitalize flex items-center gap-1.5">
                      <CreditCard size={12} />{p.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                      p.status === 'completed' ? 'bg-green-500/15 text-green-400' : p.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-red-500/15 text-red-400'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500 text-sm">No payments recorded</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
