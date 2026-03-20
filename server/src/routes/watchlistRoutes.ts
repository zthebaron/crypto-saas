import { Router } from 'express';
import { optionalAuth } from '../middleware/authMiddleware';
import { addToWatchlist, removeFromWatchlist, getWatchlist } from '../models/watchlistModel';

const router = Router();

router.use(optionalAuth);

router.get('/', (req, res) => {
  try {
    const data = getWatchlist(req.user!.userId);
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

router.post('/', (req, res) => {
  try {
    const { coinId, coinSymbol, coinName } = req.body;
    if (!coinId || !coinSymbol) {
      res.status(400).json({ error: 'coinId and coinSymbol are required' });
      return;
    }
    addToWatchlist(req.user!.userId, coinId, coinSymbol, coinName || '');
    res.status(201).json({ message: 'Added to watchlist' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

router.delete('/:coinId', (req, res) => {
  try {
    removeFromWatchlist(req.user!.userId, parseInt(req.params.coinId));
    res.json({ message: 'Removed from watchlist' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

export default router;
