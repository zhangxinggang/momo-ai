import type { ILocalPathConfig } from '@momo/aichat';
import { useCallback, useMemo } from 'react';

import { isAbsoluteLocalPath, joinLocalPath } from '@momo/aichat';
import { checkPathExists, openPath } from '@renderer/services/desktop';
import { useChatProjectStore } from '@renderer/store/chat';

/** 绑定桌面端本地路径解析与打开能力，供 AI 对话消息内路径点击复用 */
export function useLocalPathBinding(
  onOpenWorkspacePath?: (path: string) => boolean,
): ILocalPathConfig {
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

  const handleOpenLocalPath = useCallback(
    async (absolutePath: string) => {
      if (onOpenWorkspacePath?.(absolutePath)) return;
      await openPath(absolutePath);
    },
    [onOpenWorkspacePath],
  );
  const resolveLocalPathForOpen = useCallback(
    async (rawPath: string) => {
      if (isAbsoluteLocalPath(rawPath)) return rawPath;
      if (rawPath.split(/[\\/]/).includes('..')) return null;
      for (const root of activeFolderPaths) {
        const target = joinLocalPath(root, rawPath);
        if (await checkPathExists(target)) return target;
      }
      return null;
    },
    [activeFolderPaths],
  );

  return useMemo(
    () => ({
      resolveLocalPath,
      resolveLocalPathForOpen: onOpenWorkspacePath ? resolveLocalPathForOpen : undefined,
      allowRelativePaths: Boolean(onOpenWorkspacePath),
      onOpenLocalPath: handleOpenLocalPath,
      checkPathExists,
    }),
    [handleOpenLocalPath, resolveLocalPath, resolveLocalPathForOpen, onOpenWorkspacePath],
  );
}
