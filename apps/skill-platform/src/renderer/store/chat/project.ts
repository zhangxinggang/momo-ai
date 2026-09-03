import { buildChatProjectUniqueKey, normalizeFolderPaths, type IChatProject } from '@momo/aichat';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const UNCATEGORIZED_NAME = '自由对话';
const RECENT_VISIBLE_LIMIT = 8;

type TProjectSaveResult =
  | { ok: true; project: IChatProject }
  | { ok: false; reason: 'duplicate' | 'empty-name' };

type TProjectUpdateResult =
  | { ok: true }
  | { ok: false; reason: 'duplicate' | 'empty-name' | 'not-found' };

interface IChatProjectState {
  projects: IChatProject[];
  recentFolderPaths: string[];
  /** 当前会话所属项目的文件夹，供上下文注入（不持久化） */
  activeFolderPaths: string[];
  /** 当前会话所属项目的 Agent 应用（不持久化） */
  activeAgentAppId: string | null;
  ensureUncategorizedProject: () => string;
  createProject: (
    name: string,
    folderPaths: string[],
    agentAppId?: string | null,
  ) => TProjectSaveResult;
  updateProject: (
    id: string,
    name: string,
    folderPaths: string[],
    agentAppId?: string | null,
  ) => TProjectUpdateResult;
  removeProject: (id: string) => void;
  setActiveFolderPaths: (paths: string[]) => void;
  setActiveAgentAppId: (agentAppId: string | null) => void;
  pushRecentFolders: (paths: string[]) => void;
  removeRecentFolder: (path: string) => void;
  getVisibleRecentFolders: () => string[];
}

function createProjectId(): string {
  return `chat-project-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeAgentAppId(agentAppId?: string | null): string | null {
  if (typeof agentAppId !== 'string') {
    return null;
  }
  const trimmed = agentAppId.trim();
  return trimmed || null;
}

function findConflict(
  projects: IChatProject[],
  name: string,
  folderPaths: string[],
  excludeId?: string,
): boolean {
  const key = buildChatProjectUniqueKey(name, folderPaths);
  return projects.some(
    (item) =>
      item.id !== excludeId && buildChatProjectUniqueKey(item.name, item.folderPaths) === key,
  );
}

function migrateProject(raw: unknown): IChatProject | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const item = raw as Partial<IChatProject>;
  if (typeof item.id !== 'string' || typeof item.name !== 'string') {
    return null;
  }
  return {
    id: item.id,
    name: item.name,
    folderPaths: Array.isArray(item.folderPaths)
      ? item.folderPaths.filter((path): path is string => typeof path === 'string')
      : [],
    agentAppId: normalizeAgentAppId(item.agentAppId),
    createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
    updatedAt: typeof item.updatedAt === 'number' ? item.updatedAt : Date.now(),
  };
}

export const useChatProjectStore = create<IChatProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      recentFolderPaths: [],
      activeFolderPaths: [],
      activeAgentAppId: null,
      ensureUncategorizedProject: () => {
        const key = buildChatProjectUniqueKey(UNCATEGORIZED_NAME, []);
        const existing = get().projects.find(
          (item) => buildChatProjectUniqueKey(item.name, item.folderPaths) === key,
        );
        if (existing) {
          return existing.id;
        }
        const now = Date.now();
        const project: IChatProject = {
          id: createProjectId(),
          name: UNCATEGORIZED_NAME,
          folderPaths: [],
          agentAppId: null,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          projects: [...state.projects, project],
        }));
        return project.id;
      },
      createProject: (name, folderPaths, agentAppId) => {
        const trimmedName = name.trim();
        if (!trimmedName) {
          return { ok: false, reason: 'empty-name' };
        }
        const paths = normalizeFolderPaths(folderPaths);
        if (findConflict(get().projects, trimmedName, paths)) {
          return { ok: false, reason: 'duplicate' };
        }
        const now = Date.now();
        const project: IChatProject = {
          id: createProjectId(),
          name: trimmedName,
          folderPaths: paths,
          agentAppId: normalizeAgentAppId(agentAppId),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          projects: [...state.projects, project],
        }));
        return { ok: true, project };
      },
      updateProject: (id, name, folderPaths, agentAppId) => {
        const trimmedName = name.trim();
        if (!trimmedName) {
          return { ok: false, reason: 'empty-name' };
        }
        const paths = normalizeFolderPaths(folderPaths);
        const current = get().projects.find((item) => item.id === id);
        if (!current) {
          return { ok: false, reason: 'not-found' };
        }
        if (findConflict(get().projects, trimmedName, paths, id)) {
          return { ok: false, reason: 'duplicate' };
        }
        set((state) => ({
          projects: state.projects.map((item) =>
            item.id === id
              ? {
                  ...item,
                  name: trimmedName,
                  folderPaths: paths,
                  agentAppId: normalizeAgentAppId(agentAppId),
                  updatedAt: Date.now(),
                }
              : item,
          ),
        }));
        return { ok: true };
      },
      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((item) => item.id !== id),
        })),
      setActiveFolderPaths: (paths) =>
        set({
          activeFolderPaths: normalizeFolderPaths(paths),
        }),
      setActiveAgentAppId: (agentAppId) =>
        set({
          activeAgentAppId: normalizeAgentAppId(agentAppId),
        }),
      pushRecentFolders: (paths) =>
        set((state) => {
          let next = [...state.recentFolderPaths];
          for (const raw of paths) {
            const trimmed = raw.trim();
            if (!trimmed) {
              continue;
            }
            next = [trimmed, ...next.filter((item) => item !== trimmed)];
          }
          return { recentFolderPaths: next };
        }),
      removeRecentFolder: (path) =>
        set((state) => ({
          recentFolderPaths: state.recentFolderPaths.filter((item) => item !== path),
        })),
      getVisibleRecentFolders: () => get().recentFolderPaths.slice(0, RECENT_VISIBLE_LIMIT),
    }),
    {
      name: 'chat-project-storage',
      version: 2,
      partialize: (state) => ({
        projects: state.projects,
        recentFolderPaths: state.recentFolderPaths,
      }),
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as {
          projects?: unknown[];
          recentFolderPaths?: string[];
        };
        const projects = Array.isArray(state.projects)
          ? state.projects.map(migrateProject).filter((item): item is IChatProject => Boolean(item))
          : [];
        if (version < 2) {
          // v1 → v2：补齐 agentAppId
        }
        return {
          projects,
          recentFolderPaths: Array.isArray(state.recentFolderPaths)
            ? state.recentFolderPaths.filter((item): item is string => typeof item === 'string')
            : [],
        };
      },
    },
  ),
);
