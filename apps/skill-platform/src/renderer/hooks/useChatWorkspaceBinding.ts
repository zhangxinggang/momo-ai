import { buildChatWorkspaceConfig, type IChatWorkspaceConfig } from '@momo/aichat';
import { useCallback, useMemo } from 'react';

import { useChatWorkspaceStore } from '@renderer/store/chat';

/** 绑定桌面端目录选择与持久化 store，供各 AI 对话场景复用 */
export function useChatWorkspaceBinding(): IChatWorkspaceConfig {
  const workspaceEnabled = useChatWorkspaceStore((s) => s.workspaceEnabled);
  const workspacePaths = useChatWorkspaceStore((s) => s.workspacePaths);
  const workspacePresets = useChatWorkspaceStore((s) => s.workspacePresets);
  const activePresetId = useChatWorkspaceStore((s) => s.activePresetId);
  const setWorkspaceEnabled = useChatWorkspaceStore((s) => s.setWorkspaceEnabled);
  const addWorkspacePath = useChatWorkspaceStore((s) => s.addWorkspacePath);
  const removeWorkspacePath = useChatWorkspaceStore((s) => s.removeWorkspacePath);
  const selectWorkspacePreset = useChatWorkspaceStore((s) => s.selectWorkspacePreset);
  const saveWorkspacePreset = useChatWorkspaceStore((s) => s.saveWorkspacePreset);
  const renameWorkspacePreset = useChatWorkspaceStore((s) => s.renameWorkspacePreset);
  const deleteWorkspacePreset = useChatWorkspaceStore((s) => s.deleteWorkspacePreset);

  const handleAddWorkspaceFolder = useCallback(async () => {
    const selectedList = await window.electron?.selectFolders?.();
    if (selectedList?.length) {
      for (const selected of selectedList) {
        if (selected?.trim()) {
          addWorkspacePath(selected);
        }
      }
      return;
    }
    const selected = await window.electron?.selectFolder?.();
    if (selected) {
      addWorkspacePath(selected);
    }
  }, [addWorkspacePath]);

  const handleOpenFolderPath = useCallback(async (folderPath: string) => {
    const exists = await window.electron?.pathExists?.(folderPath);
    if (!exists) {
      return;
    }
    await window.electron?.openPath?.(folderPath);
  }, []);

  const checkPathExists = useCallback(async (folderPath: string) => {
    if (!window.electron?.pathExists) {
      return true;
    }
    return window.electron.pathExists(folderPath);
  }, []);

  return useMemo(
    () =>
      buildChatWorkspaceConfig({
        enabled: workspaceEnabled,
        paths: workspacePaths,
        presets: workspacePresets,
        activePresetId,
        onEnabledChange: setWorkspaceEnabled,
        onAddFolder: () => {
          void handleAddWorkspaceFolder();
        },
        onRemoveFolder: removeWorkspacePath,
        onPresetSelect: selectWorkspacePreset,
        onPresetSave: saveWorkspacePreset,
        onPresetRename: renameWorkspacePreset,
        onPresetDelete: deleteWorkspacePreset,
        onOpenFolderPath: (folderPath) => {
          void handleOpenFolderPath(folderPath);
        },
        checkPathExists,
      }),
    [
      activePresetId,
      checkPathExists,
      deleteWorkspacePreset,
      handleAddWorkspaceFolder,
      handleOpenFolderPath,
      removeWorkspacePath,
      renameWorkspacePreset,
      saveWorkspacePreset,
      selectWorkspacePreset,
      setWorkspaceEnabled,
      workspaceEnabled,
      workspacePaths,
      workspacePresets,
    ],
  );
}
