import { Router } from 'express';
import * as authService from '../services/authService';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      res.status(400).json({ error: 'email, password, and displayName are required' });
      return;
    }
    const result = await authService.register(email, password, displayName);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.get('/profile', requireAuth, (req, res) => {
  const user = authService.getProfile(req.user!.userId);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ data: user });
});

router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) { res.status(400).json({ error: 'Email is required' }); return; }
    const result = authService.requestPasswordReset(email);
    // In production, you'd email the token. For now, return it directly.
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) { res.status(400).json({ error: 'Token and password are required' }); return; }
    const result = await authService.resetPassword(token, password);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
