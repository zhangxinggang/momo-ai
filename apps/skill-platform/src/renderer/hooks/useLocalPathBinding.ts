import type { ILocalPathConfig } from '@momo/aichat';
import { useCallback, useMemo } from 'react';

import { isAbsoluteLocalPath, joinLocalPath } from '@momo/aichat';
import { checkPathExists, openPath } from '@renderer/services/desktop';
import { useChatProjectStore } from '@renderer/store/chat';

/** 绑定桌面端本地路径解析与打开能力，供 AI 对话消息内路径点击复用 */
export function useLocalPathBinding(): ILocalPathConfig {
  const activeFolderPaths = useChatProjectStore((s) => s.activeFolderPaths);

  const resolveLocalPath = useCallback(
    (rawPath: string): string | null => {
      const trimmed = rawPath.trim();
      if (!trimmed) {
        return null;
      }
      if (isAbsoluteLocalPath(trimmed)) {
        return trimmed;
      }
      if (activeFolderPaths.length === 0) {
        return trimmed;
      }
      return joinLocalPath(activeFolderPaths[0], trimmed);
    },
    [activeFolderPaths],
  );

  const handleOpenLocalPath = useCallback(async (absolutePath: string) => {
    await openPath(absolutePath);
  }, []);

  return useMemo(
    () => ({
      resolveLocalPath,
      onOpenLocalPath: handleOpenLocalPath,
      checkPathExists,
    }),
    [handleOpenLocalPath, resolveLocalPath],
  );
}
