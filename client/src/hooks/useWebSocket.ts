import { useEffect } from 'react';
import { wsClient } from '../services/websocket';
import type { WsEventType } from '@crypto-saas/shared';

export function useWebSocket(type: WsEventType, handler: (payload: any) => void) {
  useEffect(() => {
    const unsub = wsClient.on(type, handler);
    return unsub;
  }, [type, handler]);
}
