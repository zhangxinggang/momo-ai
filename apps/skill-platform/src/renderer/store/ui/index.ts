import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ViewMode = 'prompt' | 'skill' | 'kb' | 'note' | 'chat' | 'news' | 'workflow';

export type EAppModule = ViewMode;

type EWorkflowScreen = 'list' | 'studio' | 'work';

export type ENewsSection = 'model-ranking';

interface IUIState {
  viewMode: ViewMode;
  appModule: EAppModule;
  setViewMode: (mode: ViewMode) => void;
  setAppModule: (mode: EAppModule) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  /** AI 资讯二级菜单当前选中项 */
  activeNewsSection: ENewsSection;
  setActiveNewsSection: (section: ENewsSection) => void;
  /** 工作流列表 / 编辑器切换 */
  workflowScreen: EWorkflowScreen;
  activeWorkflowId: string | null;
  workflowListQuery: string;
  /** 从工作流跳转编辑资源后，返回时恢复的 workflowId */
  workflowResumeStudioId: string | null;
  /** 工作流编辑器是否有未保存更改 */
  workflowEditorDirty: boolean;
  /** 工作流编辑器注册的离开确认（由 Studio 挂载） */
  workflowLeaveConfirm: (() => Promise<boolean>) | null;
  setWorkflowEditorDirty: (dirty: boolean) => void;
  registerWorkflowLeaveConfirm: (fn: (() => Promise<boolean>) | null) => void;
  confirmWorkflowLeave: () => Promise<boolean>;
  setWorkflowListQuery: (query: string) => void;
  openWorkflowStudio: (workflowId: string | null) => void;
  openWorkflowWork: (workflowId: string) => void;
  openWorkflowList: () => void;
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
      activeNewsSection: 'model-ranking',
      setActiveNewsSection: (section) => set({ activeNewsSection: section }),
      workflowScreen: 'list',
      activeWorkflowId: null,
      workflowListQuery: '',
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
      setWorkflowListQuery: (query) => set({ workflowListQuery: query }),
      openWorkflowStudio: (workflowId) =>
        set({
          appModule: 'workflow',
          viewMode: 'workflow',
          workflowScreen: 'studio',
          activeWorkflowId: workflowId,
          workflowResumeStudioId: null,
        }),
      openWorkflowWork: (workflowId) =>
        set({
          appModule: 'workflow',
          viewMode: 'workflow',
          workflowScreen: 'work',
          activeWorkflowId: workflowId,
        }),
      openWorkflowList: () =>
        set({
          workflowScreen: 'list',
          activeWorkflowId: null,
          workflowEditorDirty: false,
          workflowLeaveConfirm: null,
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
