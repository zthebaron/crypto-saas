import { create } from 'zustand';
import { chat as chatApi } from '../services/api';
import type { ChatMessage } from '@crypto-saas/shared';
import { randomUUID } from '../utils/uuid';

interface ChatState {
  messages: ChatMessage[];
  streaming: boolean;
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  clearChat: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  streaming: false,
  loading: false,
  error: null,

  sendMessage: async (content: string) => {
    const userMsg: ChatMessage = {
      id: randomUUID(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    const assistantMsg: ChatMessage = {
      id: randomUUID(),
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };

    set(state => ({
      messages: [...state.messages, userMsg, assistantMsg],
      streaming: true,
      error: null,
    }));

    try {
      for await (const data of chatApi.sendMessageStream(content)) {
        if (data.done) break;
        if (data.chunk) {
          set(state => ({
            messages: state.messages.map(m =>
              m.id === assistantMsg.id
                ? { ...m, content: m.content + data.chunk }
                : m
            ),
          }));
        }
      }
    } catch (err: any) {
      set(state => ({
        error: 'Failed to get response',
        messages: state.messages.map(m =>
          m.id === assistantMsg.id
            ? { ...m, content: 'Sorry, I encountered an error. Please try again.' }
            : m
        ),
      }));
    } finally {
      set({ streaming: false });
    }
  },

  loadHistory: async () => {
    set({ loading: true });
    try {
      const messages = await chatApi.getHistory();
      set({ messages, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  clearChat: async () => {
    try {
      await chatApi.clearHistory();
      set({ messages: [], error: null });
    } catch {
      set({ error: 'Failed to clear history' });
    }
  },
}));
