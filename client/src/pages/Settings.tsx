import { useAuthStore } from '../store/authStore';
import { useAgentStore } from '../store/agentStore';
import { Card } from '../components/ui/Card';
import { SUBSCRIPTION_TIERS } from '@crypto-saas/shared';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Shield, Zap, Crown, Tag, CheckCircle, ArrowRight } from 'lucide-react';

const tierIcons = { free: Shield, pro: Zap, premium: Crown };
const tierColors = { free: 'text-gray-400', pro: 'text-indigo-400', premium: 'text-yellow-400' };

export default function Settings() {
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const { runs } = useAgentStore();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated]);

  if (!user) return null;

  const tier = SUBSCRIPTION_TIERS[user.tier];
  const todayRuns = runs.filter(
    (r) => r.userId === user.id && new Date(r.startedAt).toDateString() === new Date().toDateString()
  ).length;

  const TierIcon = tierIcons[user.tier];

  const handleRedeemCode = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    setPromoSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/payments/redeem-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPromoSuccess(data.message);
      // Update user tier locally
      updateUser({ ...user, tier: data.tier });
      setPromoCode('');
    } catch (err: any) {
      setPromoError(err.message || 'Failed to redeem code');
    }
    setPromoLoading(false);
  };

  const handleUpgrade = (plan: string) => {
    if (plan === user.tier) return;
    setShowUpgrade(true);
  };

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

        {/* Tier Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {(Object.entries(SUBSCRIPTION_TIERS) as [string, typeof SUBSCRIPTION_TIERS.free][]).map(([key, t]) => (
            <button
              key={key}
              onClick={() => handleUpgrade(key)}
              className={`border rounded-lg p-3 text-center transition-all ${
                key === user.tier
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-gray-800 hover:border-gray-600 hover:bg-gray-800/50'
              }`}
            >
              <p className="font-semibold text-gray-200">{t.label}</p>
              <p className="text-xs text-gray-500 mt-1">
                {t.maxRunsPerDay === Infinity ? 'Unlimited' : t.maxRunsPerDay} runs/day
              </p>
              <p className="text-xs text-gray-500">
                Top {t.maxCoins} coins
              </p>
              {key === user.tier ? (
                <span className="inline-block mt-2 text-xs text-indigo-400 font-medium">Current</span>
              ) : (
                <span className="inline-flex items-center gap-1 mt-2 text-xs text-gray-400 group-hover:text-indigo-400">
                  Upgrade <ArrowRight size={10} />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Upgrade / Restore Purchase Section */}
        {showUpgrade && (
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
              <Crown size={16} className="text-yellow-400" /> Upgrade Your Plan
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Choose a payment method or enter a promo code to upgrade your account.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => navigate('/pricing')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium py-2.5 rounded-lg transition-colors"
              >
                View Plans
              </button>
              <button
                onClick={() => setShowUpgrade(false)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUpgrade(false);
                  document.getElementById('promo-input')?.focus();
                }}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium py-2.5 rounded-lg transition-colors"
              >
                Use Promo Code
              </button>
            </div>
          </div>
        )}

        {/* Promo Code / Restore Purchase */}
        <div className="border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <Tag size={14} className="text-indigo-400" /> Restore Purchase / Promo Code
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Have a promo code or need to restore a previous purchase? Enter your code below.
          </p>

          {promoSuccess && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-lg mb-3 text-sm flex items-center gap-2">
              <CheckCircle size={16} />
              {promoSuccess}
            </div>
          )}
          {promoError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-lg mb-3 text-sm">
              {promoError}
            </div>
          )}

          <div className="flex gap-2">
            <input
              id="promo-input"
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter promo code"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-gray-600 uppercase tracking-wider"
              onKeyDown={(e) => e.key === 'Enter' && handleRedeemCode()}
            />
            <button
              onClick={handleRedeemCode}
              disabled={promoLoading || !promoCode.trim()}
              className="btn-primary px-5 text-sm disabled:opacity-50"
            >
              {promoLoading ? 'Applying...' : 'Redeem'}
            </button>
          </div>
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
