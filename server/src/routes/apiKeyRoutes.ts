import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import * as apiKeyModel from '../models/apiKeyModel';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const keys = apiKeyModel.getApiKeys(req.user!.userId);
  res.json({ data: keys });
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) { res.status(400).json({ error: 'Name is required' }); return; }
  const result = apiKeyModel.generateApiKey(req.user!.userId, name);
  res.json({ data: result });
});

router.delete('/:id', (req, res) => {
  apiKeyModel.deleteApiKey(req.user!.userId, req.params.id);
  res.json({ success: true });
});

export default router;
