import { useAuthStore } from '../store/authStore';
import { useAgentStore } from '../store/agentStore';
import { Card } from '../components/ui/Card';
import { SUBSCRIPTION_TIERS } from '@crypto-saas/shared';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Shield, Zap, Crown, Building2, Tag, CheckCircle, ArrowRight, Sparkles, X } from 'lucide-react';

const tierIcons: Record<string, any> = { free: Shield, platinum: Crown, enterprise: Building2 };
const tierColors: Record<string, string> = { free: 'text-gray-400', platinum: 'text-indigo-400', enterprise: 'text-yellow-400' };

export default function Settings() {
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const { runs } = useAgentStore();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [congratsTier, setCongratsTier] = useState('');

  const API = import.meta.env.VITE_API_URL || '/api';

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
      // Show congratulations splash
      setCongratsTier(data.tier);
      setShowCongrats(true);
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

      {/* API Token Note */}
      <Card>
        <div className="text-xs text-gray-400">
          <p className="font-semibold text-gray-300 mb-1">API Token Usage</p>
          <p>Customers need to use their Anthropic Token for agent runs or they will be billed per agent run and any API token usage.</p>
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

      {/* Congratulations Splash Overlay */}
      {showCongrats && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-md w-full mx-4">
            {/* Close button */}
            <button
              onClick={() => setShowCongrats(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 p-1"
            >
              <X size={20} />
            </button>

            {/* Main card */}
            <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border border-yellow-500/30 rounded-3xl p-8 text-center shadow-2xl shadow-yellow-500/10">
              {/* Animated sparkle ring */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 animate-spin" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-[3px] rounded-full bg-gray-900 flex items-center justify-center">
                  <Crown size={36} className="text-yellow-400 animate-pulse" />
                </div>
              </div>

              {/* Confetti particles */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full animate-confetti"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `-5%`,
                      backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F97316', '#22D3EE'][i % 6],
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles size={20} className="text-yellow-400" />
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
                  Congratulations!
                </h2>
                <Sparkles size={20} className="text-yellow-400" />
              </div>

              <p className="text-gray-300 text-sm mb-4">
                Your promo code has been successfully redeemed!
              </p>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
                <p className="text-xs text-yellow-400/70 uppercase tracking-wider font-medium mb-1">You've been upgraded to</p>
                <p className="text-2xl font-bold text-yellow-400 capitalize">
                  {congratsTier === 'enterprise' ? 'Premium Enterprise' : congratsTier === 'platinum' ? 'Platinum' : congratsTier} Plan
                </p>
                <p className="text-xs text-gray-400 mt-2">Unlimited agent runs, priority support, and all premium features unlocked.</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: Zap, label: 'Unlimited Runs', color: 'text-blue-400' },
                  { icon: Shield, label: 'Priority Access', color: 'text-green-400' },
                  { icon: Crown, label: 'All Features', color: 'text-yellow-400' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="bg-gray-800/50 rounded-lg p-3">
                    <Icon size={18} className={`${color} mx-auto mb-1`} />
                    <p className="text-[10px] text-gray-400 font-medium">{label}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowCongrats(false)}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold py-3 rounded-xl transition-all text-sm"
              >
                Start Exploring
              </button>
            </div>
          </div>

          {/* CSS for animations */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fadeIn {
              animation: fadeIn 0.3s ease-out;
            }
            @keyframes confetti {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
            }
            .animate-confetti {
              animation: confetti 3s ease-in infinite;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
