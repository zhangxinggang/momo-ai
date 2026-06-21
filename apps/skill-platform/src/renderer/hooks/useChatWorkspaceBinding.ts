import { buildChatWorkspaceConfig, type IChatWorkspaceConfig } from '@momo/aichat';
import { useCallback, useMemo } from 'react';

import { checkPathExists, openFolderPath, pickFolders } from '@renderer/services/desktop';
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
    const paths = await pickFolders();
    for (const selected of paths) {
      addWorkspacePath(selected);
    }
  }, [addWorkspacePath]);

  const handleOpenFolderPath = useCallback(async (folderPath: string) => {
    await openFolderPath(folderPath);
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
