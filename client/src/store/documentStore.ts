import { create } from 'zustand';
import { documents as docApi } from '../services/api';
import type { Document } from '@crypto-saas/shared';

interface DocumentState {
  documents: Document[];
  tags: string[];
  loading: boolean;
  error: string | null;
  fetch: (tag?: string, search?: string) => Promise<void>;
  fetchTags: () => Promise<void>;
  upload: (file: File, title: string, tags: string[]) => Promise<void>;
  update: (id: string, title?: string, tags?: string[]) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  tags: [],
  loading: false,
  error: null,

  fetch: async (tag?, search?) => {
    set({ loading: true, error: null });
    try {
      const documents = await docApi.list(tag, search);
      set({ documents, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  fetchTags: async () => {
    try {
      const tags = await docApi.getTags();
      set({ tags });
    } catch { /* ignore */ }
  },

  upload: async (file, title, tags) => {
    set({ loading: true });
    try {
      await docApi.upload(file, title, tags);
      set({ loading: false });
      get().fetch();
      get().fetchTags();
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  update: async (id, title, tags) => {
    await docApi.update(id, title, tags);
    get().fetch();
  },

  remove: async (id) => {
    await docApi.delete(id);
    get().fetch();
  },
}));
