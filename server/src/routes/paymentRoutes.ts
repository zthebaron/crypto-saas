import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { createSubscription, createPayment } from '../models/adminModel';
import { updateUserTier } from '../models/userModel';

// Promo codes loaded from env var: PROMO_CODES='{"CODE":{"tier":"enterprise","label":"Label"}}'
const PROMO_CODES: Record<string, { tier: 'platinum' | 'enterprise'; label: string }> = (() => {
  try {
    return process.env.PROMO_CODES ? JSON.parse(process.env.PROMO_CODES) : {};
  } catch {
    console.error('[SECURITY] Invalid PROMO_CODES env var format');
    return {};
  }
})();

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
    console.error('[Payment error]', err);
    res.status(500).json({ error: 'Payment processing failed' });
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
    console.error('[Payment error]', err);
    res.status(500).json({ error: 'Payment processing failed' });
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
    const walletAddress = process.env.PAYMENT_WALLET_ADDRESS || '';
    res.json({ data: { subscriptionId: sub.id, walletAddress, message: 'Subscription activated (demo mode)' } });
  } catch (err: any) {
    console.error('[Payment error]', err);
    res.status(500).json({ error: 'Payment processing failed' });
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
    console.error('[Payment error]', err);
    res.status(500).json({ error: 'Payment processing failed' });
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
