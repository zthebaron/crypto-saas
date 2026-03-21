import { Router } from 'express';
import {
  searchPairs,
  getTopBoostedTokens,
  getLatestBoostedTokens,
  getLatestTokenProfiles,
  getTokenPairs,
} from '../services/dexScreenerService';

const router = Router();

// GET /api/dex/search?q=...
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q) {
      res.status(400).json({ error: 'Query parameter "q" is required' });
      return;
    }
    const pairs = await searchPairs(q);
    res.json({ data: pairs });
  } catch (error: any) {
    console.error('DEX search error:', error.message);
    res.status(500).json({ error: 'Failed to search DEX pairs' });
  }
});

// GET /api/dex/boosted/top
router.get('/boosted/top', async (_req, res) => {
  try {
    const data = await getTopBoostedTokens();
    res.json({ data });
  } catch (error: any) {
    console.error('DEX boosted error:', error.message);
    res.status(500).json({ error: 'Failed to fetch boosted tokens' });
  }
});

// GET /api/dex/boosted/latest
router.get('/boosted/latest', async (_req, res) => {
  try {
    const data = await getLatestBoostedTokens();
    res.json({ data });
  } catch (error: any) {
    console.error('DEX boosted latest error:', error.message);
    res.status(500).json({ error: 'Failed to fetch latest boosted tokens' });
  }
});

// GET /api/dex/profiles
router.get('/profiles', async (_req, res) => {
  try {
    const data = await getLatestTokenProfiles();
    res.json({ data });
  } catch (error: any) {
    console.error('DEX profiles error:', error.message);
    res.status(500).json({ error: 'Failed to fetch token profiles' });
  }
});

// GET /api/dex/token-pairs/:chainId/:tokenAddress
router.get('/token-pairs/:chainId/:tokenAddress', async (req, res) => {
  try {
    const { chainId, tokenAddress } = req.params;
    const data = await getTokenPairs(chainId, tokenAddress);
    res.json({ data });
  } catch (error: any) {
    console.error('DEX token pairs error:', error.message);
    res.status(500).json({ error: 'Failed to fetch token pairs' });
  }
});

export default router;
