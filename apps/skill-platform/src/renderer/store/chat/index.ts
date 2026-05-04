import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IChatWorkspaceState {
  /** 工作区是否启用 */
  workspaceEnabled: boolean;
  /** 已添加的工作区目录列表 */
  workspacePaths: string[];
  setWorkspaceEnabled: (enabled: boolean) => void;
  addWorkspacePath: (path: string) => void;
  removeWorkspacePath: (path: string) => void;
}

export const useChatWorkspaceStore = create<IChatWorkspaceState>()(
  persist(
    (set) => ({
      workspaceEnabled: false,
      workspacePaths: [],
      setWorkspaceEnabled: (enabled) =>
        set((state) => ({
          workspaceEnabled: enabled,
          workspacePaths: enabled ? state.workspacePaths : [],
        })),
      addWorkspacePath: (path) =>
        set((state) => {
          const trimmed = path.trim();
          if (!trimmed || state.workspacePaths.includes(trimmed)) {
            return state;
          }
          return { workspacePaths: [...state.workspacePaths, trimmed] };
        }),
      removeWorkspacePath: (path) =>
        set((state) => ({
          workspacePaths: state.workspacePaths.filter((item) => item !== path),
        })),
    }),
    {
      name: 'chat-workspace-storage',
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as {
          workspaceEnabled?: boolean;
          workspacePath?: string | null;
          workspacePaths?: string[];
        };
        if (version < 2) {
          const legacyPath = state.workspacePath?.trim();
          return {
            workspaceEnabled: Boolean(state.workspaceEnabled),
            workspacePaths: legacyPath ? [legacyPath] : [],
          };
        }
        return persisted as IChatWorkspaceState;
      },
      partialize: (state) => ({
        workspaceEnabled: state.workspaceEnabled,
        workspacePaths: state.workspacePaths,
      }),
    },
  ),
);
