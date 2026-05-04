import type { DCreatePrompt, DUpdatePrompt, IPrompt } from '@/types/modules';
import { collectFirstLevelFolderIds, type IMomoTreeNode } from '@momo/tree';
import * as db from '@renderer/services/database';
import {
  buildPromptTree,
  collectPromptFolderIds,
  filterPromptTreeByQuery,
} from '@renderer/services/prompt/tree';
import { useFolderStore } from '@renderer/store/folder';
import type {
  EGalleryImageSize,
  EKanbanColumns,
  EPromptEditorMode,
  EPromptSortBy,
  EPromptViewMode,
  ESortOrder,
} from '@renderer/types/prompt';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type {
  EGalleryImageSize,
  EKanbanColumns,
  EPromptEditorMode,
  EPromptSortBy,
  EPromptViewMode,
  ESortOrder,
} from '@renderer/types/prompt';

interface IPromptState {
  prompts: IPrompt[];
  selectedId: string | null;
  selectedIds: string[];
  isLoading: boolean;
  searchQuery: string;
  filterTags: string[];
  // Sort and order
  // 排序和顺序
  sortBy: EPromptSortBy;
  sortOrder: ESortOrder;
  editorMode: EPromptEditorMode;
  treeData: IMomoTreeNode[];
  treeSearchQuery: string;
  expandedKeys: string[];
  viewMode: EPromptViewMode;
  galleryImageSize: EGalleryImageSize;
  kanbanColumns: EKanbanColumns;

  // Actions
  // 操作
  fetchPrompts: () => Promise<void>;
  createPrompt: (data: DCreatePrompt) => Promise<IPrompt>;
  updatePrompt: (id: string, data: DUpdatePrompt) => Promise<void>;
  movePrompts: (ids: string[], folderId: string) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  selectPrompt: (id: string | null) => void;
  setSelectedIds: (ids: string[]) => void;
  setSearchQuery: (query: string) => void;
  toggleFilterTag: (tag: string) => void;
  clearFilterTags: () => void;
  togglePinned: (id: string) => Promise<void>;
  setSortBy: (sortBy: EPromptSortBy) => void;
  setSortOrder: (sortOrder: ESortOrder) => void;
  incrementUsageCount: (id: string) => Promise<void>;
  refreshTree: () => void;
  setTreeSearchQuery: (query: string) => void;
  setExpandedKeys: (keys: string[]) => void;
  openCreateEditor: () => void;
  openEditEditor: (id: string) => void;
  closeEditor: () => void;
  duplicatePrompt: (id: string) => Promise<IPrompt>;
  setViewMode: (mode: EPromptViewMode) => void;
  setGalleryImageSize: (size: EGalleryImageSize) => void;
  setKanbanColumns: (cols: EKanbanColumns) => void;
}

export const usePromptStore = create<IPromptState>()(
  persist(
    (set, get) => ({
      prompts: [],
      selectedId: null,
      selectedIds: [],
      isLoading: false,
      searchQuery: '',
      filterTags: [],
      sortBy: 'updatedAt' as EPromptSortBy,
      sortOrder: 'desc' as ESortOrder,
      editorMode: 'idle',
      treeData: [],
      treeSearchQuery: '',
      expandedKeys: [],
      viewMode: 'card',
      galleryImageSize: 'medium',
      kanbanColumns: 3,

      refreshTree: () => {
        const { prompts, treeSearchQuery, expandedKeys: currentExpandedKeys } = get();
        const folders = useFolderStore.getState().folders;
        const rawTree = buildPromptTree(folders, prompts);
        const treeData = filterPromptTreeByQuery(rawTree, treeSearchQuery);
        const expandedKeys = treeSearchQuery.trim()
          ? collectPromptFolderIds(treeData)
          : currentExpandedKeys.length > 0
            ? currentExpandedKeys
            : collectFirstLevelFolderIds(treeData);
        set({ treeData, expandedKeys });
      },

      setTreeSearchQuery: (query) => {
        set({ treeSearchQuery: query });
        get().refreshTree();
      },

      setExpandedKeys: (keys) => set({ expandedKeys: keys }),

      openCreateEditor: () =>
        set({
          editorMode: 'create',
          selectedId: null,
          selectedIds: [],
        }),

      openEditEditor: (id) =>
        set({
          editorMode: 'edit',
          selectedId: id,
          selectedIds: [id],
        }),

      closeEditor: () =>
        set({
          editorMode: 'idle',
        }),

      fetchPrompts: async () => {
        set({ isLoading: true });
        try {
          const prompts = await db.getAllPrompts();
          set({ prompts });
          get().refreshTree();
        } catch (error) {
          console.error('Failed to fetch prompts:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      createPrompt: async (data) => {
        const prompt = await db.createPrompt({
          ...data,
          variables: data.variables || [],
          tags: data.tags || [],
          isFavorite: false,
          isPinned: false,
          usageCount: 0,
          currentVersion: 1,
        });
        set((state) => ({ prompts: [prompt, ...state.prompts] }));
        get().refreshTree();
        return prompt;
      },

      updatePrompt: async (id, data) => {
        const updated = await db.updatePrompt(id, data);
        set((state) => ({
          prompts: state.prompts.map((p) => (p.id === id ? updated : p)),
        }));
        get().refreshTree();
      },

      movePrompts: async (ids, folderId) => {
        await db.movePrompts(ids, folderId);
        set((state) => ({
          prompts: state.prompts.map((p) =>
            ids.includes(p.id) ? { ...p, folderId, updatedAt: new Date().toISOString() } : p,
          ),
        }));
        get().refreshTree();
      },

      deletePrompt: async (id) => {
        await db.deletePrompt(id);
        set((state) => ({
          prompts: state.prompts.filter((p) => p.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
          selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id),
          editorMode: state.selectedId === id ? 'idle' : state.editorMode,
        }));
        get().refreshTree();
      },

      selectPrompt: (id) =>
        set({
          selectedId: id,
          selectedIds: id ? [id] : [],
          editorMode: id ? 'edit' : 'idle',
        }),

      setSelectedIds: (ids) =>
        set((state) => ({
          selectedIds: ids,
          // If only one is selected, update selectedId for compatibility
          // 如果只选中一个，更新 selectedId 以保持兼容性
          selectedId:
            ids.length === 1
              ? ids[0]
              : ids.includes(state.selectedId || '')
                ? state.selectedId
                : null,
        })),

      setSearchQuery: (query) => set({ searchQuery: query }),

      toggleFilterTag: (tag) =>
        set((state) => ({
          filterTags: state.filterTags.includes(tag)
            ? state.filterTags.filter((t) => t !== tag)
            : [...state.filterTags, tag],
        })),

      clearFilterTags: () => set({ filterTags: [] }),

      duplicatePrompt: async (id) => {
        const source = get().prompts.find((p) => p.id === id);
        if (!source) {
          throw new Error('IPrompt not found');
        }
        const copyTitle = `${source.title} (副本)`;
        const prompt = await get().createPrompt({
          title: copyTitle,
          systemPrompt: source.systemPrompt,
          userPrompt: source.userPrompt,
          tags: [...(source.tags || [])],
          folderId: source.folderId,
          source: source.source,
          variables: source.variables ? [...source.variables] : [],
        });
        get().openEditEditor(prompt.id);
        return prompt;
      },

      togglePinned: async (id) => {
        const prompt = get().prompts.find((p) => p.id === id);
        if (prompt) {
          const updated = await db.updatePrompt(id, {
            isPinned: !prompt.isPinned,
          });
          set((state) => ({
            prompts: state.prompts.map((p) => (p.id === id ? updated : p)),
          }));
        }
      },

      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setViewMode: (viewMode) => set({ viewMode }),
      setGalleryImageSize: (galleryImageSize) => set({ galleryImageSize }),
      setKanbanColumns: (kanbanColumns) => set({ kanbanColumns }),

      incrementUsageCount: async (id) => {
        const prompt = get().prompts.find((p) => p.id === id);
        if (prompt) {
          const updated = await db.updatePrompt(id, {
            usageCount: (prompt.usageCount || 0) + 1,
          });
          set((state) => ({
            prompts: state.prompts.map((p) => (p.id === id ? updated : p)),
          }));
        }
      },
    }),
    {
      name: 'prompt-store',
      partialize: (state) => ({
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        viewMode: state.viewMode,
        galleryImageSize: state.galleryImageSize,
        kanbanColumns: state.kanbanColumns,
      }),
    },
  ),
);
