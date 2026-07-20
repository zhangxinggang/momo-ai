import { buildReadonlyChatWorkspaceConfig, type IChatWorkspaceConfig } from '@momo/aichat';
import { useCallback, useMemo } from 'react';

import { checkPathExists, openFolderPath } from '@renderer/services/desktop';
import { useChatProjectStore } from '@renderer/store/chat';

/** 绑定当前对话项目的只读工作区路径，供主 AI 对话使用 */
export function useChatWorkspaceBinding(): IChatWorkspaceConfig {
  const activeFolderPaths = useChatProjectStore((s) => s.activeFolderPaths);

  const handleOpenFolderPath = useCallback(async (folderPath: string) => {
    await openFolderPath(folderPath);
  }, []);

  return useMemo(
    () =>
      buildReadonlyChatWorkspaceConfig({
        paths: activeFolderPaths,
        onOpenFolderPath: (folderPath) => {
          void handleOpenFolderPath(folderPath);
        },
        checkPathExists,
      }),
    [activeFolderPaths, handleOpenFolderPath],
  );
}
