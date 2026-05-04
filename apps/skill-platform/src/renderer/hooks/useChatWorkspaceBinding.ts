import { buildChatWorkspaceConfig, type IChatWorkspaceConfig } from '@momo/aichat';
import { useCallback, useMemo } from 'react';

import { useChatWorkspaceStore } from '@renderer/store/chat';

/** 绑定桌面端目录选择与持久化 store，供各 AI 对话场景复用 */
export function useChatWorkspaceBinding(): IChatWorkspaceConfig {
  const workspaceEnabled = useChatWorkspaceStore((s) => s.workspaceEnabled);
  const workspacePath = useChatWorkspaceStore((s) => s.workspacePath);
  const setWorkspaceEnabled = useChatWorkspaceStore((s) => s.setWorkspaceEnabled);
  const setWorkspacePath = useChatWorkspaceStore((s) => s.setWorkspacePath);

  const handleSelectWorkspaceFolder = useCallback(async () => {
    const selected = await window.electron?.selectFolder?.();
    if (selected) {
      setWorkspacePath(selected);
      return;
    }
    if (!useChatWorkspaceStore.getState().workspacePath) {
      setWorkspaceEnabled(false);
    }
  }, [setWorkspaceEnabled, setWorkspacePath]);

  return useMemo(
    () =>
      buildChatWorkspaceConfig({
        enabled: workspaceEnabled,
        path: workspacePath,
        onEnabledChange: setWorkspaceEnabled,
        onSelectFolder: () => {
          void handleSelectWorkspaceFolder();
        },
      }),
    [handleSelectWorkspaceFolder, setWorkspaceEnabled, workspaceEnabled, workspacePath],
  );
}
