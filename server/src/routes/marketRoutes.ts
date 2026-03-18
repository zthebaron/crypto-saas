import { Router } from 'express';
import * as cmcService from '../services/cmcService';

const router = Router();

router.get('/listings', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const data = await cmcService.getListingsLatest(limit);
    res.json({ data });
  } catch (error: any) {
    console.error('Market listings error:', error.message);
    res.status(500).json({ error: 'Failed to fetch market listings' });
  }
});

router.get('/global', async (_req, res) => {
  try {
    const data = await cmcService.getGlobalMetrics();
    res.json({ data });
  } catch (error: any) {
    console.error('Global metrics error:', error.message);
    res.status(500).json({ error: 'Failed to fetch global metrics' });
  }
});

router.get('/trending', async (_req, res) => {
  try {
    const data = await cmcService.getTrendingGainersLosers();
    res.json({ data });
  } catch (error: any) {
    console.error('Trending error:', error.message);
    res.status(500).json({ error: 'Failed to fetch trending data' });
  }
});

router.get('/quotes', async (req, res) => {
  try {
    const symbols = (req.query.symbols as string || '').split(',').filter(Boolean);
    if (symbols.length === 0) {
      res.status(400).json({ error: 'symbols query parameter is required' });
      return;
    }
    const data = await cmcService.getQuotesLatest(symbols);
    res.json({ data });
  } catch (error: any) {
    console.error('Quotes error:', error.message);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

export default router;
