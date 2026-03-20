import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Crown, Building2, Star, X, Mail, Phone, MessageSquare, CreditCard, Bitcoin } from 'lucide-react';
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
    action: 'register' as const,
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
    action: 'stripe' as const,
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
    action: 'contact' as const,
  },
];

const reviews = [
  { name: 'David L.', title: 'Portfolio Manager', text: 'BlockView\'s AI agents have completely transformed how I analyze crypto markets. The signal accuracy is unmatched.', avatar: 'DL' },
  { name: 'Sarah K.', title: 'Day Trader', text: 'The real-time pipeline gives me an edge I never had before. Switched from 3Commas and never looked back.', avatar: 'SK' },
  { name: 'James R.', title: 'DeFi Researcher', text: 'The knowledge base integration with AI analysis is genius. I upload my research and get enhanced insights instantly.', avatar: 'JR' },
  { name: 'Maria C.', title: 'Crypto Fund Manager', text: 'Enterprise tier is worth every penny. Our team\'s productivity tripled since we started using BlockView for research.', avatar: 'MC' },
  { name: 'Alex T.', title: 'Swing Trader', text: 'Signal accuracy tracking keeps the platform honest. 85%+ accuracy on 7-day signals — that\'s real performance.', avatar: 'AT' },
  { name: 'Priya M.', title: 'Blockchain Analyst', text: 'From watchlist to execution, BlockView streamlines my entire workflow. The MetaMask integration is seamless.', avatar: 'PM' },
];

const STRIPE_PLATINUM_URL = 'https://checkout.stripe.com/pay/cs_live_blockview_platinum'; // Replace with real Stripe link

export default function Pricing() {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handlePlanClick = (action: string) => {
    if (action === 'register') {
      navigate('/register');
    } else if (action === 'stripe') {
      // Open Stripe checkout
      window.open(STRIPE_PLATINUM_URL, '_blank');
    } else if (action === 'contact') {
      setShowContactModal(true);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, send to API
    setContactSubmitted(true);
    setTimeout(() => {
      setShowContactModal(false);
      setContactSubmitted(false);
      setContactForm({ name: '', email: '', company: '', message: '' });
    }, 3000);
  };

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

              <button
                onClick={() => handlePlanClick(plan.action)}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${plan.ctaClass}`}
              >
                {plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Reviews Carousel */}
      <div className="max-w-6xl mx-auto overflow-hidden">
        <h2 className="text-xl font-bold text-white text-center mb-6">What Our Users Say</h2>
        <div className="relative">
          <div className="flex animate-scroll-slow gap-6" style={{ width: 'max-content' }}>
            {/* Duplicate reviews for infinite scroll effect */}
            {[...reviews, ...reviews].map((review, i) => (
              <div
                key={i}
                className="w-80 flex-shrink-0 bg-gray-900 border border-gray-800 rounded-xl p-5"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-300 mb-4 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-indigo-400">{review.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{review.name}</p>
                    <p className="text-[10px] text-gray-500">{review.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes scroll-slow {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll-slow {
            animation: scroll-slow 60s linear infinite;
          }
          .animate-scroll-slow:hover {
            animation-play-state: paused;
          }
        `}</style>
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

      {/* Contact Sales Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white">Enterprise Sales</h3>
              <button onClick={() => { setShowContactModal(false); setContactSubmitted(false); }} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {contactSubmitted ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-emerald-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Thank You!</h4>
                <p className="text-sm text-gray-400">Our sales team will be in touch within 24 hours.</p>
              </div>
            ) : (
              <div className="p-5 space-y-5">
                {/* Payment options */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Quick Payment Options</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => window.open(STRIPE_PLATINUM_URL, '_blank')}
                      className="flex flex-col items-center gap-1.5 p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-colors"
                    >
                      <CreditCard size={20} className="text-indigo-400" />
                      <span className="text-[10px] text-gray-300 font-medium">Credit Card</span>
                    </button>
                    <button
                      onClick={() => window.open('https://paypal.me/blockview', '_blank')}
                      className="flex flex-col items-center gap-1.5 p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-colors"
                    >
                      <div className="text-blue-400 font-bold text-sm">PP</div>
                      <span className="text-[10px] text-gray-300 font-medium">PayPal</span>
                    </button>
                    <button
                      onClick={() => window.open('#', '_blank')}
                      className="flex flex-col items-center gap-1.5 p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-colors"
                    >
                      <Bitcoin size={20} className="text-orange-400" />
                      <span className="text-[10px] text-gray-300 font-medium">Crypto</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-xs text-gray-500">or contact us</span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>

                {/* Contact form */}
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Name</label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Company</label>
                      <input
                        type="text"
                        value={contactForm.company}
                        onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Email</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Message</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      rows={3}
                      placeholder="Tell us about your needs..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 placeholder:text-gray-600 resize-none"
                    />
                  </div>
                  <button type="submit" className="w-full btn-primary py-2.5 flex items-center justify-center gap-2">
                    <Mail size={14} />
                    Send Message
                  </button>
                </form>

                {/* Direct contact */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <a href="mailto:sales@block-view.app" className="text-xs text-gray-400 hover:text-indigo-400 flex items-center gap-1">
                    <Mail size={12} /> sales@block-view.app
                  </a>
                  <a href="tel:+1-800-BLOCK" className="text-xs text-gray-400 hover:text-indigo-400 flex items-center gap-1">
                    <Phone size={12} /> 1-800-BLOCK
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
