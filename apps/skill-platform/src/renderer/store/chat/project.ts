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
  ensureUncategorizedProject: () => string;
  createProject: (name: string, folderPaths: string[]) => TProjectSaveResult;
  updateProject: (id: string, name: string, folderPaths: string[]) => TProjectUpdateResult;
  removeProject: (id: string) => void;
  setActiveFolderPaths: (paths: string[]) => void;
  pushRecentFolders: (paths: string[]) => void;
  removeRecentFolder: (path: string) => void;
  getVisibleRecentFolders: () => string[];
}

function createProjectId(): string {
  return `chat-project-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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

export const useChatProjectStore = create<IChatProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      recentFolderPaths: [],
      activeFolderPaths: [],
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
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          projects: [...state.projects, project],
        }));
        return project.id;
      },
      createProject: (name, folderPaths) => {
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
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          projects: [...state.projects, project],
        }));
        return { ok: true, project };
      },
      updateProject: (id, name, folderPaths) => {
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
      version: 1,
      partialize: (state) => ({
        projects: state.projects,
        recentFolderPaths: state.recentFolderPaths,
      }),
    },
  ),
);
