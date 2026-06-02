import type { IChatWorkspacePreset } from '@momo/aichat';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IChatWorkspaceState {
  workspaceEnabled: boolean;
  workspacePaths: string[];
  workspacePresets: IChatWorkspacePreset[];
  activePresetId: string | null;
  setWorkspaceEnabled: (enabled: boolean) => void;
  addWorkspacePath: (path: string) => void;
  removeWorkspacePath: (path: string) => void;
  selectWorkspacePreset: (presetId: string) => void;
  saveWorkspacePreset: (name: string, paths: string[]) => void;
  renameWorkspacePreset: (presetId: string, name: string) => void;
  deleteWorkspacePreset: (presetId: string) => void;
}

function createPresetId(): string {
  return `ws-preset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useChatWorkspaceStore = create<IChatWorkspaceState>()(
  persist(
    (set) => ({
      workspaceEnabled: false,
      workspacePaths: [],
      workspacePresets: [],
      activePresetId: null,
      setWorkspaceEnabled: (enabled) =>
        set((state) => ({
          workspaceEnabled: enabled,
          workspacePaths: enabled ? state.workspacePaths : [],
          activePresetId: enabled ? state.activePresetId : null,
        })),
      addWorkspacePath: (path) =>
        set((state) => {
          const trimmed = path.trim();
          if (!trimmed || state.workspacePaths.includes(trimmed)) {
            return state;
          }
          return {
            workspacePaths: [...state.workspacePaths, trimmed],
            activePresetId: null,
          };
        }),
      removeWorkspacePath: (path) =>
        set((state) => ({
          workspacePaths: state.workspacePaths.filter((item) => item !== path),
          activePresetId: null,
        })),
      selectWorkspacePreset: (presetId) =>
        set((state) => {
          const preset = state.workspacePresets.find((item) => item.id === presetId);
          if (!preset) {
            return state;
          }
          return {
            activePresetId: presetId,
            workspaceEnabled: true,
            workspacePaths: [...preset.paths],
          };
        }),
      saveWorkspacePreset: (name, paths) =>
        set((state) => {
          const trimmedName = name.trim();
          if (!trimmedName || paths.length === 0) {
            return state;
          }
          const preset: IChatWorkspacePreset = {
            id: createPresetId(),
            name: trimmedName,
            paths: [...paths],
          };
          return {
            workspacePresets: [...state.workspacePresets, preset],
            activePresetId: preset.id,
          };
        }),
      renameWorkspacePreset: (presetId, name) =>
        set((state) => {
          const trimmedName = name.trim();
          if (!trimmedName) {
            return state;
          }
          return {
            workspacePresets: state.workspacePresets.map((item) =>
              item.id === presetId ? { ...item, name: trimmedName } : item,
            ),
          };
        }),
      deleteWorkspacePreset: (presetId) =>
        set((state) => ({
          workspacePresets: state.workspacePresets.filter((item) => item.id !== presetId),
          activePresetId: state.activePresetId === presetId ? null : state.activePresetId,
        })),
    }),
    {
      name: 'chat-workspace-storage',
      version: 3,
      migrate: (persisted, version) => {
        const state = persisted as {
          workspaceEnabled?: boolean;
          workspacePath?: string | null;
          workspacePaths?: string[];
          workspacePresets?: IChatWorkspacePreset[];
          activePresetId?: string | null;
        };
        if (version < 2) {
          const legacyPath = state.workspacePath?.trim();
          return {
            workspaceEnabled: Boolean(state.workspaceEnabled),
            workspacePaths: legacyPath ? [legacyPath] : [],
            workspacePresets: [],
            activePresetId: null,
          };
        }
        if (version < 3) {
          return {
            workspaceEnabled: Boolean(state.workspaceEnabled),
            workspacePaths: Array.isArray(state.workspacePaths) ? state.workspacePaths : [],
            workspacePresets: [],
            activePresetId: null,
          };
        }
        return persisted as IChatWorkspaceState;
      },
      partialize: (state) => ({
        workspaceEnabled: state.workspaceEnabled,
        workspacePaths: state.workspacePaths,
        workspacePresets: state.workspacePresets,
        activePresetId: state.activePresetId,
      }),
    },
  ),
);
