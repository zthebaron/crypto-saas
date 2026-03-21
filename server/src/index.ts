// BlockView Crypto Server
import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { config } from './config';
import { initDatabase } from './models/database';
import { rateLimiter } from './middleware/rateLimiter';
import { requireAuth, optionalAuth } from './middleware/authMiddleware';
import { setBroadcast } from './agents/coordinator';
import { startScheduler } from './agents/scheduler';
import marketRoutes from './routes/marketRoutes';
import agentRoutes from './routes/agentRoutes';
import signalRoutes from './routes/signalRoutes';
import authRoutes from './routes/authRoutes';
import watchlistRoutes from './routes/watchlistRoutes';
import chatRoutes from './routes/chatRoutes';
import notificationRoutes from './routes/notificationRoutes';
import portfolioRoutes from './routes/portfolioRoutes';
import compareRoutes from './routes/compareRoutes';
import documentRoutes from './routes/documentRoutes';
import alertRuleRoutes from './routes/alertRuleRoutes';
import accuracyRoutes from './routes/accuracyRoutes';
import adminRoutes from './routes/adminRoutes';
import paymentRoutes from './routes/paymentRoutes';
import apiKeyRoutes from './routes/apiKeyRoutes';
import tradeRoutes from './routes/tradeRoutes';
import dexScreenerRoutes from './routes/dexScreenerRoutes';
import type { WsEvent } from '@crypto-saas/shared';
import { verifyToken } from './services/authService';

const app = express();
const server = http.createServer(app);

// Security headers (in lieu of helmet — zero dependency)
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (!config.isDev) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// CORS — explicit origins, never wildcard with credentials
app.use(cors({
  origin: config.corsOrigin === '*'
    ? ['https://block-view.app', 'http://localhost:5173']
    : config.corsOrigin.split(',').map(o => o.trim()),
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

// Global rate limiter: 120 req/min
app.use(rateLimiter(120));

// Stricter rate limits on auth endpoints
app.use('/api/auth/login', rateLimiter(10));
app.use('/api/auth/register', rateLimiter(5));
app.use('/api/auth/forgot-password', rateLimiter(3));

// Request logging in dev
if (config.isDev) {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/agents', optionalAuth, agentRoutes);        // Open access for now — Google auth later
app.use('/api/signals', signalRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/chat', optionalAuth, chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/rules', alertRuleRoutes);
app.use('/api/accuracy', accuracyRoutes);
app.use('/api/admin', adminRoutes);                       // Admin auth handled inside adminRoutes
app.use('/api/payments', paymentRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/dex', dexScreenerRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

interface AuthenticatedWs extends WebSocket {
  userId?: string;
  isAuthenticated?: boolean;
}

const wsClients = new Set<AuthenticatedWs>();

wss.on('connection', (ws: AuthenticatedWs, req) => {
  const url = new URL(req.url || '', `http://localhost`);
  const token = url.searchParams.get('token');

  if (token) {
    try {
      const payload = verifyToken(token);
      ws.userId = payload.userId;
      ws.isAuthenticated = true;
    } catch {
      // Allow connection even with invalid token — open access for now
      ws.isAuthenticated = false;
    }
  } else {
    ws.isAuthenticated = false;
  }

  wsClients.add(ws);
  ws.on('close', () => wsClients.delete(ws));
  ws.on('error', () => wsClients.delete(ws));
});

function broadcast(event: WsEvent) {
  const message = JSON.stringify(event);
  for (const client of wsClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

setBroadcast(broadcast);

// Initialize and start
async function start() {
  await initDatabase();
  console.log('Database initialized');

  startScheduler();

  server.listen(config.port, () => {
    console.log(`Crypto SaaS server running on port ${config.port}`);
    console.log(`WebSocket server on ws://localhost:${config.port}/ws`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export { app, server };
