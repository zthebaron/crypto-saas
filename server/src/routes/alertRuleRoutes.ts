import { Router } from 'express';
import { optionalAuth } from '../middleware/authMiddleware';
import * as ruleModel from '../models/alertRuleModel';

const router = Router();

router.use(optionalAuth);

// List rules
router.get('/', (req, res) => {
  const rules = ruleModel.getRules(req.user!.userId);
  res.json({ data: rules });
});

// Create rule
router.post('/', (req, res) => {
  const { name, conditionType, conditionConfig, actionType, actionConfig } = req.body;
  if (!name || !conditionType || !actionType) {
    return res.status(400).json({ error: 'name, conditionType, and actionType are required' });
  }
  const rule = ruleModel.createRule(req.user!.userId, {
    name, conditionType, conditionConfig: conditionConfig || {},
    actionType, actionConfig: actionConfig || {},
  });
  res.json({ data: rule });
});

// Update rule
router.put('/:id', (req, res) => {
  ruleModel.updateRule(req.params.id, req.user!.userId, req.body);
  res.json({ message: 'Updated' });
});

// Toggle rule
router.put('/:id/toggle', (req, res) => {
  ruleModel.toggleRule(req.params.id, req.user!.userId);
  res.json({ message: 'Toggled' });
});

// Delete rule
router.delete('/:id', (req, res) => {
  ruleModel.deleteRule(req.params.id, req.user!.userId);
  res.json({ message: 'Deleted' });
});

export default router;
