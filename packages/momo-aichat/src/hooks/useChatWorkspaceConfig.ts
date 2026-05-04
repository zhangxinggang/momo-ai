import { useCallback, useEffect, useMemo, useState } from 'react';

import type { IChatWorkspaceConfig } from '../types/workspace';

const DEFAULT_STORAGE_KEY = 'momo-aichat-workspace';

interface IPersistedWorkspaceState {
  workspaceEnabled: boolean;
  workspacePath: string | null;
}

function readPersistedState(storageKey: string): IPersistedWorkspaceState {
  if (typeof window === 'undefined') {
    return { workspaceEnabled: false, workspacePath: null };
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return { workspaceEnabled: false, workspacePath: null };
    }
    const parsed = JSON.parse(raw) as Partial<IPersistedWorkspaceState>;
    return {
      workspaceEnabled: Boolean(parsed.workspaceEnabled),
      workspacePath: typeof parsed.workspacePath === 'string' ? parsed.workspacePath : null,
    };
  } catch {
    return { workspaceEnabled: false, workspacePath: null };
  }
}

function writePersistedState(storageKey: string, state: IPersistedWorkspaceState) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

export interface IUseChatWorkspaceConfigOptions {
  /** localStorage 键名，默认 momo-aichat-workspace */
  storageKey?: string;
  /** 宿主提供的目录选择器，返回 null 表示取消 */
  selectFolder: () => Promise<string | null | undefined>;
}

/**
 * 通用工作区状态 Hook：持久化启用状态与路径，并产出 IChatWorkspaceConfig
 */
export function useChatWorkspaceConfig(
  options: IUseChatWorkspaceConfigOptions,
): IChatWorkspaceConfig {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const [workspaceEnabled, setWorkspaceEnabledState] = useState(
    () => readPersistedState(storageKey).workspaceEnabled,
  );
  const [workspacePath, setWorkspacePathState] = useState<string | null>(
    () => readPersistedState(storageKey).workspacePath,
  );

  useEffect(() => {
    writePersistedState(storageKey, { workspaceEnabled, workspacePath });
  }, [storageKey, workspaceEnabled, workspacePath]);

  const setWorkspaceEnabled = useCallback((enabled: boolean) => {
    setWorkspaceEnabledState(enabled);
    if (!enabled) {
      setWorkspacePathState(null);
    }
  }, []);

  const setWorkspacePath = useCallback((path: string | null) => {
    setWorkspacePathState(path);
  }, []);

  const handleSelectFolder = useCallback(async () => {
    const selected = await options.selectFolder();
    if (selected) {
      setWorkspacePath(selected);
      return;
    }
    if (!workspacePath) {
      setWorkspaceEnabled(false);
    }
  }, [options, setWorkspaceEnabled, setWorkspacePath, workspacePath]);

  return useMemo(
    (): IChatWorkspaceConfig => ({
      enabled: workspaceEnabled,
      path: workspacePath,
      onEnabledChange: setWorkspaceEnabled,
      onSelectFolder: () => {
        void handleSelectFolder();
      },
    }),
    [handleSelectFolder, setWorkspaceEnabled, workspaceEnabled, workspacePath],
  );
}

/** 从外部 store 构建 IChatWorkspaceConfig（宿主已有 zustand 等状态时复用） */
export function buildChatWorkspaceConfig(input: {
  enabled: boolean;
  path: string | null;
  onEnabledChange: (enabled: boolean) => void;
  onSelectFolder: () => void;
}): IChatWorkspaceConfig {
  return {
    enabled: input.enabled,
    path: input.path,
    onEnabledChange: input.onEnabledChange,
    onSelectFolder: input.onSelectFolder,
  };
}
