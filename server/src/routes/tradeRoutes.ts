import { Router } from 'express';
import { optionalAuth } from '../middleware/authMiddleware';
import { getSwapQuote, getSupportedChains } from '../services/dexService';
import { getDb } from '../models/database';
import { v4 as uuid } from 'uuid';

const router = Router();

// POST /api/trade/quote — Get swap quote with optional tx data
router.post('/quote', optionalAuth, async (req, res) => {
  try {
    const { chainId, fromToken, toToken, amount, slippage = 1, userAddress } = req.body;

    if (!chainId || !fromToken || !toToken || !amount) {
      res.status(400).json({ error: 'chainId, fromToken, toToken, and amount are required' });
      return;
    }

    const chains = getSupportedChains();
    if (!chains.includes(Number(chainId))) {
      res.status(400).json({ error: `Unsupported chain. Supported: ${chains.join(', ')}` });
      return;
    }

    const quote = await getSwapQuote(
      Number(chainId),
      fromToken,
      toToken,
      amount,
      Number(slippage),
      userAddress
    );

    res.json(quote);
  } catch (error: any) {
    console.error('Trade quote error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to get swap quote' });
  }
});

// POST /api/trade/record — Record an executed trade
router.post('/record', optionalAuth, async (req, res) => {
  try {
    const { chainId, tokenIn, tokenOut, amountIn, amountOut, txHash, signalId, dexUsed, gasPaid, slippage } = req.body;

    if (!chainId || !tokenIn || !tokenOut || !amountIn || !txHash) {
      res.status(400).json({ error: 'Missing required trade fields' });
      return;
    }

    const db = getDb();
    const id = uuid();
    db.prepare(`
      INSERT INTO trades (id, user_id, chain_id, token_in, token_out, amount_in, amount_out, tx_hash, status, signal_id, dex_used, gas_paid, slippage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?)
    `).run(id, req.user?.userId || 'guest', chainId, tokenIn, tokenOut, amountIn, amountOut || '', txHash, signalId || null, dexUsed || '', gasPaid || '', slippage || 1);

    res.status(201).json({ id, status: 'confirmed' });
  } catch (error: any) {
    console.error('Trade record error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to record trade' });
  }
});

// GET /api/trade/history — Get user's trade history
router.get('/history', optionalAuth, (req, res) => {
  try {
    const db = getDb();
    const trades = db.prepare(`
      SELECT * FROM trades WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
    `).all(req.user?.userId || 'guest');

    res.json({ data: trades });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch trade history' });
  }
});

// GET /api/trade/chains — Get supported chains
router.get('/chains', (_req, res) => {
  res.json({ data: getSupportedChains() });
});

export default router;
