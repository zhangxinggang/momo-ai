import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { IChatWorkspaceConfig } from '../types/workspace';

const DEFAULT_STORAGE_KEY = 'momo-aichat-workspace';

interface IPersistedWorkspaceState {
  workspaceEnabled: boolean;
  workspacePaths: string[];
}

function readPersistedState(storageKey: string): IPersistedWorkspaceState {
  if (typeof window === 'undefined') {
    return { workspaceEnabled: false, workspacePaths: [] };
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return { workspaceEnabled: false, workspacePaths: [] };
    }
    const parsed = JSON.parse(raw) as Partial<IPersistedWorkspaceState> & {
      workspacePath?: string | null;
    };
    const legacyPath = typeof parsed.workspacePath === 'string' ? parsed.workspacePath.trim() : '';
    const workspacePaths = Array.isArray(parsed.workspacePaths)
      ? parsed.workspacePaths.filter((item) => typeof item === 'string' && item.trim())
      : legacyPath
        ? [legacyPath]
        : [];
    return {
      workspaceEnabled: Boolean(parsed.workspaceEnabled),
      workspacePaths,
    };
  } catch {
    return { workspaceEnabled: false, workspacePaths: [] };
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
  const [workspacePaths, setWorkspacePathsState] = useState<string[]>(
    () => readPersistedState(storageKey).workspacePaths,
  );
  const skipNextPersistRef = useRef(false);

  // storageKey 变化时从对应 localStorage 重新加载，避免内存态串线
  useEffect(() => {
    const persisted = readPersistedState(storageKey);
    setWorkspaceEnabledState(persisted.workspaceEnabled);
    setWorkspacePathsState(persisted.workspacePaths);
    skipNextPersistRef.current = true;
  }, [storageKey]);

  useEffect(() => {
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }
    writePersistedState(storageKey, { workspaceEnabled, workspacePaths });
  }, [storageKey, workspaceEnabled, workspacePaths]);

  const setWorkspaceEnabled = useCallback((enabled: boolean) => {
    setWorkspaceEnabledState(enabled);
    if (!enabled) {
      setWorkspacePathsState([]);
    }
  }, []);

  const handleAddFolder = useCallback(async () => {
    const selected = await options.selectFolder();
    if (selected?.trim()) {
      setWorkspacePathsState((prev) =>
        prev.includes(selected) ? prev : [...prev, selected.trim()],
      );
    }
  }, [options]);

  const handleRemoveFolder = useCallback((folderPath: string) => {
    setWorkspacePathsState((prev) => prev.filter((item) => item !== folderPath));
  }, []);

  return useMemo(
    (): IChatWorkspaceConfig => ({
      enabled: workspaceEnabled,
      paths: workspacePaths,
      path: workspacePaths[0] ?? null,
      onEnabledChange: setWorkspaceEnabled,
      onAddFolder: () => {
        void handleAddFolder();
      },
      onRemoveFolder: handleRemoveFolder,
    }),
    [handleAddFolder, handleRemoveFolder, setWorkspaceEnabled, workspaceEnabled, workspacePaths],
  );
}

/** 从外部 store 构建 IChatWorkspaceConfig（宿主已有 zustand 等状态时复用） */
export function buildChatWorkspaceConfig(input: {
  enabled: boolean;
  paths?: string[];
  path?: string | null;
  onEnabledChange: (enabled: boolean) => void;
  onAddFolder: () => void;
  onRemoveFolder: (folderPath: string) => void;
  presets?: IChatWorkspaceConfig['presets'];
  activePresetId?: string | null;
  onPresetSelect?: IChatWorkspaceConfig['onPresetSelect'];
  onPresetSave?: IChatWorkspaceConfig['onPresetSave'];
  onPresetRename?: IChatWorkspaceConfig['onPresetRename'];
  onPresetDelete?: IChatWorkspaceConfig['onPresetDelete'];
  onOpenFolderPath?: IChatWorkspaceConfig['onOpenFolderPath'];
  checkPathExists?: IChatWorkspaceConfig['checkPathExists'];
}): IChatWorkspaceConfig {
  const paths = input.paths ?? (input.path?.trim() ? [input.path.trim()] : []);
  return {
    enabled: input.enabled,
    paths,
    path: paths[0] ?? null,
    onEnabledChange: input.onEnabledChange,
    onAddFolder: input.onAddFolder,
    onRemoveFolder: input.onRemoveFolder,
    presets: input.presets,
    activePresetId: input.activePresetId,
    onPresetSelect: input.onPresetSelect,
    onPresetSave: input.onPresetSave,
    onPresetRename: input.onPresetRename,
    onPresetDelete: input.onPresetDelete,
    onOpenFolderPath: input.onOpenFolderPath,
    checkPathExists: input.checkPathExists,
  };
}
