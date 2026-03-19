import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import * as notifModel from '../models/notificationModel';

const router = Router();

router.use(requireAuth);

// List notifications
router.get('/', (req, res) => {
  const notifications = notifModel.getNotifications(req.user!.userId, 50);
  const unreadCount = notifModel.getUnreadCount(req.user!.userId);
  res.json({ data: notifications, unreadCount });
});

// Mark one read
router.put('/:id/read', (req, res) => {
  notifModel.markRead(req.params.id, req.user!.userId);
  res.json({ message: 'Marked as read' });
});

// Mark all read
router.put('/read-all', (req, res) => {
  notifModel.markAllRead(req.user!.userId);
  res.json({ message: 'All marked as read' });
});

// Get preferences
router.get('/preferences', (req, res) => {
  const prefs = notifModel.getPreferences(req.user!.userId);
  res.json({ data: prefs });
});

// Update preferences
router.put('/preferences', (req, res) => {
  notifModel.upsertPreferences(req.user!.userId, req.body);
  res.json({ message: 'Preferences updated' });
});

// Save push subscription
router.post('/push-subscription', (req, res) => {
  const { subscription } = req.body;
  if (!subscription) return res.status(400).json({ error: 'Subscription required' });
  notifModel.savePushSubscription(req.user!.userId, JSON.stringify(subscription));
  res.json({ message: 'Push subscription saved' });
});

export default router;
