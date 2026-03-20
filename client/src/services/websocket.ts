import type { WsEvent, WsEventType } from '@crypto-saas/shared';

type Handler = (payload: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers = new Map<WsEventType, Set<Handler>>();
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private shouldReconnect = true;

  connect() {
    const token = localStorage.getItem('token') || '';
    const apiUrl = import.meta.env.VITE_API_URL;
    let url: string;
    if (apiUrl) {
      // Production: derive WS URL from the API URL
      const wsBase = apiUrl.replace(/^http/, 'ws').replace(/\/api$/, '');
      url = `${wsBase}/ws?token=${token}`;
    } else if (window.location.hostname !== 'localhost') {
      // Deployed: connect to Railway WebSocket
      url = `wss://crypto-saasserver-production.up.railway.app/ws?token=${token}`;
    } else {
      // Dev: same host
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      url = `${protocol}//${window.location.host}/ws?token=${token}`;
    }

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('[WS] Connected');
      this.reconnectDelay = 1000;
    };

    this.ws.onmessage = (event) => {
      try {
        const data: WsEvent = JSON.parse(event.data);
        const handlers = this.handlers.get(data.type);
        if (handlers) {
          for (const handler of handlers) handler(data.payload);
        }
      } catch { /* ignore bad messages */ }
    };

    this.ws.onclose = () => {
      if (this.shouldReconnect) {
        setTimeout(() => this.connect(), this.reconnectDelay);
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
      }
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  on(type: WsEventType, handler: Handler) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }

  disconnect() {
    this.shouldReconnect = false;
    this.ws?.close();
  }
}

export const wsClient = new WebSocketClient();
