import { Router } from 'express';
import * as cmcService from '../services/cmcService';
import { getRecentSignals } from '../models/signalModel';

const router = Router();

// GET /api/compare?symbols=BTC,ETH,SOL
router.get('/', async (req, res) => {
  const symbolsParam = req.query.symbols as string;
  if (!symbolsParam) return res.status(400).json({ error: 'symbols query param required' });

  const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).slice(0, 4);
  if (symbols.length < 2) return res.status(400).json({ error: 'At least 2 symbols required' });

  try {
    const coins = await cmcService.getQuotesLatest(symbols);
    const allSignals = getRecentSignals(100);
    const signals: Record<string, any[]> = {};
    for (const sym of symbols) {
      signals[sym] = allSignals.filter(s => s.coinSymbol === sym).slice(0, 5);
    }
    res.json({ data: { coins, signals } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
