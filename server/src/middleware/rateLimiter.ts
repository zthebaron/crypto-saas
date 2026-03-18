import type { Request, Response, NextFunction } from 'express';

const windowMs = 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimiter(maxRequests = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();

    let entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count++;

    if (entry.count > maxRequests) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count));
    next();
  };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of hits.entries()) {
    if (now > entry.resetAt) hits.delete(key);
  }
}, 5 * 60 * 1000);
