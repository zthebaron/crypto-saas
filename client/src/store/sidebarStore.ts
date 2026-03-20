import { create } from 'zustand';

interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (v: boolean) => void;
  setMobileOpen: (v: boolean) => void;
  toggleMobileOpen: () => void;
}

const getInitialCollapsed = (): boolean => {
  const stored = localStorage.getItem('blockview-sidebar-collapsed');
  return stored === 'true';
};

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: getInitialCollapsed(),
  mobileOpen: false,
  toggleCollapsed: () =>
    set((s) => {
      const next = !s.collapsed;
      localStorage.setItem('blockview-sidebar-collapsed', String(next));
      return { collapsed: next };
    }),
  setCollapsed: (v) => {
    localStorage.setItem('blockview-sidebar-collapsed', String(v));
    set({ collapsed: v });
  },
  setMobileOpen: (v) => set({ mobileOpen: v }),
  toggleMobileOpen: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
}));
