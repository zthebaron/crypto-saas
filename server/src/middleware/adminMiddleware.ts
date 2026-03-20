import type { Request, Response, NextFunction } from 'express';
import { getDb } from '../models/database';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const db = getDb();
  const row = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.userId) as any;
  if (!row || row.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
