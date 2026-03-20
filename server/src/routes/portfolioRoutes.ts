import { Router } from 'express';
import { optionalAuth } from '../middleware/authMiddleware';
import * as portfolioModel from '../models/portfolioModel';
import { getPortfolioSummary } from '../services/portfolioService';
import { getDb } from '../models/database';

const router = Router();

router.use(optionalAuth);

// Get portfolio summary with live prices
router.get('/', async (req, res) => {
  try {
    const summary = await getPortfolioSummary(req.user!.userId);
    res.json({ data: summary });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Open a new position
router.post('/positions', (req, res) => {
  const { coinSymbol, coinName, entryPrice, quantity, signalId } = req.body;
  if (!coinSymbol || !entryPrice || !quantity) {
    return res.status(400).json({ error: 'coinSymbol, entryPrice, and quantity are required' });
  }
  const position = portfolioModel.createPosition(
    req.user!.userId, coinSymbol, coinName || coinSymbol, entryPrice, quantity, signalId
  );
  res.json({ data: position });
});

// Close a position
router.put('/positions/:id/close', (req, res) => {
  const { closePrice } = req.body;
  if (!closePrice) return res.status(400).json({ error: 'closePrice is required' });
  portfolioModel.closePosition(req.params.id, req.user!.userId, closePrice);
  res.json({ message: 'Position closed' });
});

// Delete a position
router.delete('/positions/:id', (req, res) => {
  portfolioModel.deletePosition(req.params.id, req.user!.userId);
  res.json({ message: 'Position deleted' });
});

// Get history (snapshots)
router.get('/history', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 30;
  const snapshots = portfolioModel.getSnapshots(req.user!.userId, limit);
  res.json({ data: snapshots });
});

// Create position from a signal
router.post('/from-signal/:signalId', async (req, res) => {
  const db = getDb();
  const signal = db.prepare('SELECT * FROM signals WHERE id = ?').get(req.params.signalId) as any;
  if (!signal) return res.status(404).json({ error: 'Signal not found' });

  const { quantity } = req.body;
  if (!quantity) return res.status(400).json({ error: 'quantity is required' });

  // Get current price from CMC
  let entryPrice = 0;
  try {
    const cmcService = require('../services/cmcService');
    const quotes = await cmcService.getQuotesLatest([signal.coin_symbol]);
    entryPrice = quotes[0]?.price || 0;
  } catch {
    return res.status(500).json({ error: 'Could not fetch current price' });
  }

  const position = portfolioModel.createPosition(
    req.user!.userId, signal.coin_symbol, signal.coin_name, entryPrice, quantity, signal.id
  );
  res.json({ data: position });
});

export default router;
