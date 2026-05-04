import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IChatWorkspaceState {
  /** 工作区是否启用 */
  workspaceEnabled: boolean;
  /** 当前选中的工作区目录，未选择时为 null */
  workspacePath: string | null;
  setWorkspaceEnabled: (enabled: boolean) => void;
  setWorkspacePath: (path: string | null) => void;
}

export const useChatWorkspaceStore = create<IChatWorkspaceState>()(
  persist(
    (set) => ({
      workspaceEnabled: false,
      workspacePath: null,
      setWorkspaceEnabled: (enabled) =>
        set((state) => ({
          workspaceEnabled: enabled,
          workspacePath: enabled ? state.workspacePath : null,
        })),
      setWorkspacePath: (path) => set({ workspacePath: path }),
    }),
    {
      name: 'chat-workspace-storage',
      partialize: (state) => ({
        workspaceEnabled: state.workspaceEnabled,
        workspacePath: state.workspacePath,
      }),
    },
  ),
);
