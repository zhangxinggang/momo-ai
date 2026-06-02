import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ViewMode = 'prompt' | 'skill' | 'kb' | 'note' | 'chat' | 'toolbox' | 'workflow';

export type EAppModule = ViewMode;

type EWorkflowScreen = 'business-list' | 'studio' | 'business-work';

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
  /** 工作流业务列表 / 编辑器 / 执行页切换 */
  workflowScreen: EWorkflowScreen;
  activeWorkflowId: string | null;
  activeBusinessId: string | null;
  businessListQuery: string;
  /** 从工作流跳转编辑资源后，返回时恢复的 workflowId */
  workflowResumeStudioId: string | null;
  /** 工作流编辑器是否有未保存更改 */
  workflowEditorDirty: boolean;
  /** 工作流编辑器注册的离开确认（由 Studio 挂载） */
  workflowLeaveConfirm: (() => Promise<boolean>) | null;
  setWorkflowEditorDirty: (dirty: boolean) => void;
  registerWorkflowLeaveConfirm: (fn: (() => Promise<boolean>) | null) => void;
  confirmWorkflowLeave: () => Promise<boolean>;
  setBusinessListQuery: (query: string) => void;
  openWorkflowStudio: (workflowId: string | null) => void;
  openWorkflowBusinessWork: (workflowId: string, businessId: string) => void;
  closeWorkflowStudio: () => void;
  closeWorkflowBusinessWork: () => void;
  beginWorkflowResourceEdit: (workflowId: string) => void;
  /** 若存在待恢复的工作流，则打开 Studio 并清除标记 */
  resumeWorkflowStudioIfPending: () => boolean;
}

export const useUIStore = create<IUIState>()(
  persist(
    (set): IUIState => ({
      viewMode: 'prompt',
      appModule: 'prompt',
      setViewMode: (mode) => set({ viewMode: mode, appModule: mode }),
      setAppModule: (mode) => {
        set({
          appModule: mode,
          viewMode: mode,
        });
        if (mode === 'workflow') {
          useUIStore.getState().resumeWorkflowStudioIfPending();
        }
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
      workflowScreen: 'business-list',
      activeWorkflowId: null,
      activeBusinessId: null,
      businessListQuery: '',
      workflowResumeStudioId: null,
      workflowEditorDirty: false,
      workflowLeaveConfirm: null,
      setWorkflowEditorDirty: (dirty) => set({ workflowEditorDirty: dirty }),
      registerWorkflowLeaveConfirm: (fn) => set({ workflowLeaveConfirm: fn }),
      confirmWorkflowLeave: async () => {
        const { workflowScreen, workflowEditorDirty, workflowLeaveConfirm } = useUIStore.getState();
        if (workflowScreen !== 'studio' || !workflowEditorDirty || !workflowLeaveConfirm) {
          return true;
        }
        return workflowLeaveConfirm();
      },
      setBusinessListQuery: (query) => set({ businessListQuery: query }),
      openWorkflowStudio: (workflowId) =>
        set({
          appModule: 'workflow',
          viewMode: 'workflow',
          workflowScreen: 'studio',
          activeWorkflowId: workflowId,
          workflowResumeStudioId: null,
        }),
      openWorkflowBusinessWork: (workflowId, businessId) =>
        set({
          appModule: 'workflow',
          viewMode: 'workflow',
          workflowScreen: 'business-work',
          activeWorkflowId: workflowId,
          activeBusinessId: businessId,
        }),
      closeWorkflowStudio: () =>
        set({
          workflowScreen: 'business-list',
          workflowEditorDirty: false,
          workflowLeaveConfirm: null,
        }),
      closeWorkflowBusinessWork: () =>
        set({
          workflowScreen: 'business-list',
          activeBusinessId: null,
        }),
      beginWorkflowResourceEdit: (workflowId) => set({ workflowResumeStudioId: workflowId }),
      resumeWorkflowStudioIfPending: () => {
        const resumeId = useUIStore.getState().workflowResumeStudioId;
        if (!resumeId) {
          return false;
        }
        set({
          workflowScreen: 'studio',
          activeWorkflowId: resumeId,
          workflowResumeStudioId: null,
        });
        return true;
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    },
  ),
);
