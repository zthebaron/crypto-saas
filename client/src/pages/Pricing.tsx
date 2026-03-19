import { Check, Zap, Crown, Building2 } from 'lucide-react';
import { Card } from '../components/ui/Card';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: Zap,
    color: 'text-gray-400',
    bgColor: 'bg-gray-800',
    borderColor: 'border-gray-700',
    features: [
      '5 agent runs per day',
      'Top 50 coins analysis',
      '24h report history',
      'Basic signals & alerts',
      'Market data dashboard',
      'Community chat support',
    ],
    cta: 'Get Started Free',
    ctaClass: 'btn-secondary',
  },
  {
    name: 'Platinum',
    price: '$49',
    period: '/month',
    icon: Crown,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-600/10',
    borderColor: 'border-indigo-500/30',
    popular: true,
    features: [
      '50 agent runs per day',
      'Top 200 coins analysis',
      'Full report history',
      'Advanced signals with confidence scores',
      'Portfolio tracking & P&L',
      'Knowledge base (50 documents)',
      'Custom alert rules (25 rules)',
      'PDF export reports',
      'Coin comparison tool',
      'Signal accuracy tracking',
      'Priority email support',
      'Real-time WebSocket updates',
    ],
    cta: 'Start Platinum Trial',
    ctaClass: 'btn-primary',
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: '/month',
    icon: Building2,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-600/5',
    borderColor: 'border-yellow-500/20',
    features: [
      'Unlimited agent runs',
      'All 500+ coins analysis',
      'Full report history',
      'All Platinum features',
      'Unlimited knowledge base',
      'Unlimited alert rules',
      'API access for custom integrations',
      'Custom agent configurations',
      'Team collaboration (5 seats)',
      'White-label reporting',
      'Dedicated account manager',
      'Custom SLA & uptime guarantee',
      'Priority phone & Slack support',
    ],
    cta: 'Contact Sales',
    ctaClass: 'bg-yellow-600 hover:bg-yellow-500 text-black font-semibold px-6 py-2.5 rounded-lg transition-colors',
  },
];

export default function Pricing() {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-3">Choose Your Plan</h1>
        <p className="text-gray-400">
          Unlock the full power of BlockView's AI-driven crypto research platform.
          From real-time market scanning to advanced portfolio tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map(plan => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.name}
              className={`relative bg-gray-900 border ${plan.borderColor} rounded-2xl p-6 flex flex-col ${plan.popular ? 'ring-2 ring-indigo-500/50' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${plan.bgColor} flex items-center justify-center`}>
                  <Icon size={20} className={plan.color} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-500 text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-3 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check size={16} className={`flex-shrink-0 mt-0.5 ${plan.color}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${plan.ctaClass}`}>
                {plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto mt-12">
        <h2 className="text-xl font-bold text-white text-center mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Can I upgrade or downgrade at any time?', a: 'Yes, you can change your plan at any time. Changes take effect immediately, and we prorate your billing.' },
            { q: 'Is there a free trial for paid plans?', a: 'Yes! Platinum comes with a 14-day free trial. No credit card required to start.' },
            { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and cryptocurrency payments (BTC, ETH, USDT).' },
            { q: 'Do you offer refunds?', a: 'We offer a 30-day money-back guarantee on all paid plans. No questions asked.' },
          ].map(({ q, a }) => (
            <Card key={q}>
              <h3 className="text-sm font-semibold text-white mb-1">{q}</h3>
              <p className="text-xs text-gray-400">{a}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
