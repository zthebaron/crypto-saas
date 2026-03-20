import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';
import * as adminModel from '../models/adminModel';
import { updateUserTier } from '../models/userModel';

const router = Router();

// Admin routes require authentication + admin role
router.use(requireAuth);
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', (req, res) => {
  const stats = adminModel.getAdminStats();
  res.json({ data: stats });
});

// Users
router.get('/users', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = (req.query.search as string) || '';
  const filter = (req.query.filter as string) || 'all';
  const result = adminModel.getAllUsers(page, limit, search, filter);
  res.json({ data: result });
});

router.put('/users/:id/role', (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) { res.status(400).json({ error: 'Invalid role' }); return; }
  adminModel.updateUserRole(req.params.id, role);
  res.json({ success: true });
});

router.put('/users/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['active', 'suspended', 'banned'].includes(status)) { res.status(400).json({ error: 'Invalid status' }); return; }
  adminModel.updateUserStatus(req.params.id, status);
  res.json({ success: true });
});

router.put('/users/:id/tier', (req, res) => {
  const { tier } = req.body;
  if (!['free', 'pro', 'premium'].includes(tier)) { res.status(400).json({ error: 'Invalid tier' }); return; }
  updateUserTier(req.params.id, tier);
  res.json({ success: true });
});

router.delete('/users/:id', (req, res) => {
  if (req.user && req.params.id === req.user.userId) { res.status(400).json({ error: 'Cannot delete yourself' }); return; }
  adminModel.deleteUser(req.params.id);
  res.json({ success: true });
});

// Subscriptions
router.get('/subscriptions', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = adminModel.getSubscriptions(page, limit);
  res.json({ data: result });
});

// Payments
router.get('/payments', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = adminModel.getPayments(page, limit);
  res.json({ data: result });
});

export default router;
