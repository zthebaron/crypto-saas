// BlockView Crypto Server
import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { config } from './config';
import { initDatabase } from './models/database';
import { rateLimiter } from './middleware/rateLimiter';
import { optionalAuth } from './middleware/authMiddleware';
import { setBroadcast } from './agents/coordinator';
import { startScheduler } from './agents/scheduler';
import marketRoutes from './routes/marketRoutes';
import agentRoutes from './routes/agentRoutes';
import signalRoutes from './routes/signalRoutes';
import authRoutes from './routes/authRoutes';
import watchlistRoutes from './routes/watchlistRoutes';
import chatRoutes from './routes/chatRoutes';
import type { WsEvent } from '@crypto-saas/shared';
import { verifyToken } from './services/authService';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','),
  credentials: true,
}));
app.use(express.json());
app.use(rateLimiter(120));

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
app.use('/api/agents', optionalAuth, agentRoutes);
app.use('/api/signals', signalRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/chat', optionalAuth, chatRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });
const wsClients = new Set<WebSocket>();

wss.on('connection', (ws, req) => {
  // Optional auth via query param
  const url = new URL(req.url || '', `http://localhost`);
  const token = url.searchParams.get('token');
  if (token) {
    try { verifyToken(token); } catch { /* allow unauthenticated connections */ }
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
