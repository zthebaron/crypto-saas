import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { createSubscription, createPayment } from '../models/adminModel';
import { updateUserTier } from '../models/userModel';

const PROMO_CODES: Record<string, { tier: 'platinum' | 'enterprise'; label: string }> = {
  'SHWOOP': { tier: 'enterprise', label: 'Premium Enterprise' },
};

const router = Router();
router.use(requireAuth);

// Create checkout session (Stripe)
router.post('/checkout/stripe', async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['platinum', 'enterprise'].includes(plan)) { res.status(400).json({ error: 'Invalid plan' }); return; }
    const prices: Record<string, number> = { platinum: 4900, enterprise: 19900 };
    // In production, this would create a real Stripe checkout session
    // For now, simulate successful payment
    const sub = createSubscription(req.user!.userId, plan, 'stripe');
    createPayment(req.user!.userId, prices[plan] / 100, 'stripe', `sim_${Date.now()}`, sub.id);
    res.json({ data: { subscriptionId: sub.id, url: null, message: 'Subscription activated (demo mode)' } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create checkout (PayPal)
router.post('/checkout/paypal', async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['platinum', 'enterprise'].includes(plan)) { res.status(400).json({ error: 'Invalid plan' }); return; }
    const prices: Record<string, number> = { platinum: 49, enterprise: 199 };
    const sub = createSubscription(req.user!.userId, plan, 'paypal');
    createPayment(req.user!.userId, prices[plan], 'paypal', `pp_${Date.now()}`, sub.id);
    res.json({ data: { subscriptionId: sub.id, url: null, message: 'Subscription activated (demo mode)' } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create checkout (Crypto)
router.post('/checkout/crypto', async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['platinum', 'enterprise'].includes(plan)) { res.status(400).json({ error: 'Invalid plan' }); return; }
    const prices: Record<string, number> = { platinum: 49, enterprise: 199 };
    const sub = createSubscription(req.user!.userId, plan, 'crypto');
    createPayment(req.user!.userId, prices[plan], 'crypto', `crypto_${Date.now()}`, sub.id);
    res.json({ data: { subscriptionId: sub.id, walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD68', message: 'Subscription activated (demo mode)' } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get current subscription
router.get('/subscription', (req, res) => {
  const { getDb } = require('../models/database');
  const db = getDb();
  const row = db.prepare('SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(req.user!.userId) as any;
  if (!row) { res.json({ data: null }); return; }
  res.json({ data: { id: row.id, plan: row.plan, status: row.status, paymentMethod: row.payment_method, currentPeriodEnd: row.current_period_end, cancelAtPeriodEnd: !!row.cancel_at_period_end } });
});

// Redeem promo code
router.post('/redeem-code', (req, res) => {
  try {
    const { code } = req.body;
    if (!code) { res.status(400).json({ error: 'Promo code is required' }); return; }

    const promo = PROMO_CODES[code.toUpperCase().trim()];
    if (!promo) {
      res.status(400).json({ error: 'Invalid promo code' });
      return;
    }

    // Upgrade user tier
    updateUserTier(req.user!.userId, promo.tier);

    // Create a subscription record
    const sub = createSubscription(req.user!.userId, promo.tier, 'promo');
    createPayment(req.user!.userId, 0, 'promo', `promo_${code}_${Date.now()}`, sub.id);

    res.json({
      success: true,
      tier: promo.tier,
      message: `Promo code applied! You've been upgraded to ${promo.label}.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel subscription
router.post('/cancel', (req, res) => {
  const { getDb } = require('../models/database');
  const db = getDb();
  db.prepare("UPDATE subscriptions SET cancel_at_period_end = 1, updated_at = datetime('now') WHERE user_id = ? AND status = 'active'").run(req.user!.userId);
  res.json({ success: true, message: 'Subscription will be canceled at period end' });
});

export default router;
