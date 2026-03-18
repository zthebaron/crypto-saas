import { useAuthStore } from '../store/authStore';
import { useAgentStore } from '../store/agentStore';
import { Card } from '../components/ui/Card';
import { SUBSCRIPTION_TIERS } from '@crypto-saas/shared';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Shield, Zap, Crown } from 'lucide-react';

const tierIcons = { free: Shield, pro: Zap, premium: Crown };
const tierColors = { free: 'text-gray-400', pro: 'text-indigo-400', premium: 'text-yellow-400' };

export default function Settings() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { runs } = useAgentStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated]);

  if (!user) return null;

  const tier = SUBSCRIPTION_TIERS[user.tier];
  const todayRuns = runs.filter(
    (r) => r.userId === user.id && new Date(r.startedAt).toDateString() === new Date().toDateString()
  ).length;

  const TierIcon = tierIcons[user.tier];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Profile */}
      <Card title="Profile">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Display Name</label>
              <p className="text-gray-200">{user.displayName}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Email</label>
              <p className="text-gray-200">{user.email}</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Member Since</label>
            <p className="text-gray-200">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </Card>

      {/* Subscription */}
      <Card title="Subscription">
        <div className="flex items-center gap-3 mb-4">
          <TierIcon size={24} className={tierColors[user.tier]} />
          <div>
            <p className="text-lg font-semibold text-gray-200">{tier.label} Plan</p>
            <p className="text-sm text-gray-500">{tier.maxRunsPerDay === Infinity ? 'Unlimited' : tier.maxRunsPerDay} agent runs per day</p>
          </div>
        </div>

        {/* Usage */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Today's Usage</span>
            <span className="text-gray-200">
              {todayRuns} / {tier.maxRunsPerDay === Infinity ? '\u221e' : tier.maxRunsPerDay} runs
            </span>
          </div>
          {tier.maxRunsPerDay !== Infinity && (
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${Math.min(100, (todayRuns / tier.maxRunsPerDay) * 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Tier Comparison */}
        <div className="grid grid-cols-3 gap-3">
          {(Object.entries(SUBSCRIPTION_TIERS) as [string, typeof SUBSCRIPTION_TIERS.free][]).map(([key, t]) => (
            <div
              key={key}
              className={`border rounded-lg p-3 text-center ${
                key === user.tier ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-800'
              }`}
            >
              <p className="font-semibold text-gray-200">{t.label}</p>
              <p className="text-xs text-gray-500 mt-1">
                {t.maxRunsPerDay === Infinity ? 'Unlimited' : t.maxRunsPerDay} runs/day
              </p>
              <p className="text-xs text-gray-500">
                Top {t.maxCoins} coins
              </p>
              {key === user.tier && (
                <span className="inline-block mt-2 text-xs text-indigo-400 font-medium">Current</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
        >
          Sign Out
        </button>
      </Card>
    </div>
  );
}
