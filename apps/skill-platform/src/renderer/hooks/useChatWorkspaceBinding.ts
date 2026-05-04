import { buildChatWorkspaceConfig, type IChatWorkspaceConfig } from '@momo/aichat';
import { useCallback, useMemo } from 'react';

import { useChatWorkspaceStore } from '@renderer/store/chat';

/** 绑定桌面端目录选择与持久化 store，供各 AI 对话场景复用 */
export function useChatWorkspaceBinding(): IChatWorkspaceConfig {
  const workspaceEnabled = useChatWorkspaceStore((s) => s.workspaceEnabled);
  const workspacePaths = useChatWorkspaceStore((s) => s.workspacePaths);
  const setWorkspaceEnabled = useChatWorkspaceStore((s) => s.setWorkspaceEnabled);
  const addWorkspacePath = useChatWorkspaceStore((s) => s.addWorkspacePath);
  const removeWorkspacePath = useChatWorkspaceStore((s) => s.removeWorkspacePath);

  const handleAddWorkspaceFolder = useCallback(async () => {
    const selected = await window.electron?.selectFolder?.();
    if (selected) {
      addWorkspacePath(selected);
    }
  }, [addWorkspacePath]);

  return useMemo(
    () =>
      buildChatWorkspaceConfig({
        enabled: workspaceEnabled,
        paths: workspacePaths,
        onEnabledChange: setWorkspaceEnabled,
        onAddFolder: () => {
          void handleAddWorkspaceFolder();
        },
        onRemoveFolder: removeWorkspacePath,
      }),
    [
      handleAddWorkspaceFolder,
      removeWorkspacePath,
      setWorkspaceEnabled,
      workspaceEnabled,
      workspacePaths,
    ],
  );
}
