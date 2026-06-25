import type { ILocalPathConfig } from '@momo/aichat';
import { useCallback, useMemo } from 'react';

import { isAbsoluteLocalPath, joinLocalPath } from '@momo/aichat';
import { checkPathExists, openPath } from '@renderer/services/desktop';
import { useChatWorkspaceStore } from '@renderer/store/chat';

/** 绑定桌面端本地路径解析与打开能力，供 AI 对话消息内路径点击复用 */
export function useLocalPathBinding(): ILocalPathConfig {
  const workspaceEnabled = useChatWorkspaceStore((s) => s.workspaceEnabled);
  const workspacePaths = useChatWorkspaceStore((s) => s.workspacePaths);
  const workspacePresets = useChatWorkspaceStore((s) => s.workspacePresets);
  const activePresetId = useChatWorkspaceStore((s) => s.activePresetId);

  const effectiveWorkspacePaths = useMemo(() => {
    if (!workspaceEnabled) {
      return [];
    }
    const activePreset = workspacePresets.find((item) => item.id === activePresetId);
    return activePreset?.paths?.length ? activePreset.paths : workspacePaths;
  }, [activePresetId, workspaceEnabled, workspacePaths, workspacePresets]);

  const resolveLocalPath = useCallback(
    (rawPath: string): string | null => {
      const trimmed = rawPath.trim();
      if (!trimmed) {
        return null;
      }
      if (isAbsoluteLocalPath(trimmed)) {
        return trimmed;
      }
      if (effectiveWorkspacePaths.length === 0) {
        return trimmed;
      }
      return joinLocalPath(effectiveWorkspacePaths[0], trimmed);
    },
    [effectiveWorkspacePaths],
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
