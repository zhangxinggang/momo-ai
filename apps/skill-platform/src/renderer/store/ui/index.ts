import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ViewMode = 'skill' | 'kb' | 'note' | 'chat' | 'toolbox';

export type EAppModule = ViewMode;

interface IUIState {
  viewMode: ViewMode;
  appModule: EAppModule;
  setViewMode: (mode: ViewMode) => void;
  setAppModule: (mode: EAppModule) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  /** 工具箱：当前选中的二级菜单 key */
  activeToolboxToolKey: string;
  /** 工具箱：三级分支或卡片 key */
  activeToolboxBranchKey: string;
  /** 工具箱：当前 Tab key */
  activeToolboxTabKey: string;
  /** 工具箱：侧栏树形展开的二级菜单 keys */
  expandedToolboxToolKeys: string[];
  setActiveToolboxToolKey: (key: string) => void;
  setActiveToolboxBranchKey: (key: string) => void;
  setActiveToolboxTabKey: (key: string) => void;
  toggleToolboxToolExpanded: (key: string) => void;
  ensureToolboxToolExpanded: (key: string) => void;
  setExpandedToolboxToolKeys: (keys: string[]) => void;
  clearActiveToolboxBranch: () => void;
  resetToolboxSelection: () => void;
}

export const useUIStore = create<IUIState>()(
  persist(
    (set): IUIState => ({
      viewMode: 'chat',
      appModule: 'chat',
      setViewMode: (mode) => set({ viewMode: mode, appModule: mode }),
      setAppModule: (mode) => {
        set({
          appModule: mode,
          viewMode: mode,
        });
      },
      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      activeToolboxToolKey: '',
      activeToolboxBranchKey: '',
      activeToolboxTabKey: '',
      expandedToolboxToolKeys: [],
      setActiveToolboxToolKey: (key) =>
        set((state) => {
          if (state.activeToolboxToolKey === key) {
            return state;
          }
          return {
            activeToolboxToolKey: key,
            activeToolboxBranchKey: '',
            activeToolboxTabKey: '',
          };
        }),
      setActiveToolboxBranchKey: (key) =>
        set((state) => {
          if (state.activeToolboxBranchKey === key) {
            return state;
          }
          return {
            activeToolboxBranchKey: key,
            activeToolboxTabKey: '',
          };
        }),
      setActiveToolboxTabKey: (key) =>
        set((state) => {
          if (state.activeToolboxTabKey === key) {
            return state;
          }
          return { activeToolboxTabKey: key };
        }),
      toggleToolboxToolExpanded: (key) =>
        set((state) => {
          const expanded = state.expandedToolboxToolKeys.includes(key)
            ? state.expandedToolboxToolKeys.filter((item) => item !== key)
            : [...state.expandedToolboxToolKeys, key];
          return { expandedToolboxToolKeys: expanded };
        }),
      ensureToolboxToolExpanded: (key) =>
        set((state) => {
          if (state.expandedToolboxToolKeys.includes(key)) {
            return state;
          }
          return { expandedToolboxToolKeys: [...state.expandedToolboxToolKeys, key] };
        }),
      setExpandedToolboxToolKeys: (keys) =>
        set((state) => {
          const nextKeys = [...keys];
          if (
            nextKeys.length === state.expandedToolboxToolKeys.length &&
            nextKeys.every((key, index) => key === state.expandedToolboxToolKeys[index])
          ) {
            return state;
          }
          return { expandedToolboxToolKeys: nextKeys };
        }),
      clearActiveToolboxBranch: () =>
        set((state) => {
          if (!state.activeToolboxBranchKey) {
            return state;
          }
          return {
            activeToolboxBranchKey: '',
            activeToolboxTabKey: '',
          };
        }),
      resetToolboxSelection: () =>
        set({
          activeToolboxToolKey: '',
          activeToolboxBranchKey: '',
          activeToolboxTabKey: '',
          expandedToolboxToolKeys: [],
        }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    },
  ),
);
