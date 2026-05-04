import type { DCreateFolder, DUpdateFolder, IFolder } from '@/types/modules';
import * as db from '@renderer/services/database';
import { canSetParent } from '@renderer/utils/folder/tree';
import { create } from 'zustand';

interface IFolderState {
  folders: IFolder[];
  selectedFolderId: string | null;
  expandedIds: Set<string>;

  // Actions
  // 操作
  fetchFolders: () => Promise<void>;
  createFolder: (data: DCreateFolder) => Promise<IFolder>;
  updateFolder: (id: string, data: DUpdateFolder) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  selectFolder: (id: string | null) => void;
  toggleExpand: (id: string) => void;
  reorderFolders: (ids: string[]) => Promise<void>;
  moveFolder: (id: string, newParentId: string | null, newIndex: number) => Promise<void>;
}

export const useFolderStore = create<IFolderState>((set, get) => ({
  folders: [],
  selectedFolderId: null,
  expandedIds: new Set(),

  fetchFolders: async () => {
    try {
      // seedDatabase will be called in prompt store, fetch directly here
      // seedDatabase 会在 prompt 目录的 store 中调用，这里直接获取
      const folders = await db.getAllFolders();
      set({ folders });
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  },

  createFolder: async (data) => {
    const folder = await db.createFolder({
      ...data,
      order: get().folders.length,
    });
    set((state) => ({ folders: [...state.folders, folder] }));
    return folder;
  },

  updateFolder: async (id, data) => {
    try {
      const updated = await db.updateFolder(id, data);
      set((state) => ({
        folders: state.folders.map((f) => (f.id === id ? updated : f)),
      }));
    } catch (error) {
      console.error('Failed to update folder:', error);
    }
  },

  deleteFolder: async (id) => {
    await db.deleteFolder(id);
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
      selectedFolderId: state.selectedFolderId === id ? null : state.selectedFolderId,
    }));
  },

  selectFolder: (id) => set({ selectedFolderId: id }),

  toggleExpand: (id) =>
    set((state) => {
      const newExpanded = new Set(state.expandedIds);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return { expandedIds: newExpanded };
    }),

  moveFolder: async (id, newParentId, newIndex) => {
    const { folders } = get();
    const folderToMove = folders.find((f) => f.id === id);
    if (!folderToMove) return;
    if (newParentId && !canSetParent(folders, id, newParentId)) return;

    const now = new Date().toISOString();
    const nextFolder = {
      ...folderToMove,
      parentId: newParentId || undefined,
      order: newIndex,
      updatedAt: now,
    };

    // 1. Get all folders that will be siblings in the new parent
    const otherFolders = folders.filter((f) => f.id !== id);
    const newSiblings = otherFolders
      .filter((f) => (newParentId ? f.parentId === newParentId : !f.parentId))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // 2. TInsert the moved folder at the new index
    newSiblings.splice(newIndex, 0, nextFolder);

    // 3. Update orders for all siblings
    const orderUpdates = newSiblings.map((f, index) => ({
      id: f.id,
      order: index,
    }));

    // 4. Save previous state for rollback
    const previousFolders = folders;

    // 5. Optimistically update local state for smoother drag end
    set((state) => ({
      folders: state.folders.map((f) => {
        if (f.id === id) return nextFolder;
        const update = orderUpdates.find((u) => u.id === f.id);
        if (update) return { ...f, order: update.order };
        return f;
      }),
    }));

    try {
      // 6. Persist changes
      await db.updateFolder(id, { parentId: newParentId || undefined });
      await db.updateFolderOrders(orderUpdates);
    } catch (error) {
      // 7. Rollback to previous state on failure
      console.error('Failed to move folder:', error);
      set({ folders: previousFolders });
    }
  },

  reorderFolders: async (ids) => {
    try {
      const updates = ids.map((id, index) => ({ id, order: index }));
      await db.updateFolderOrders(updates);

      set((state) => {
        const orderMap = new Map(ids.map((id, index) => [id, index]));
        return {
          folders: state.folders.map((folder) => {
            const newOrder = orderMap.get(folder.id);
            return newOrder !== undefined ? { ...folder, order: newOrder } : folder;
          }),
        };
      });
    } catch (error) {
      console.error('Failed to reorder folders:', error);
    }
  },
}));

// ============================================
// 多层级文件夹工具函数 (Issue #14)
// Multi-level folder utility functions
// ============================================

export {
  buildFolderTree,
  canCreateInParent,
  canSetParent,
  getAllDescendantIds,
  getChildFolders,
  getFolderDepth,
  getFolderPath,
  getMaxDescendantDepth,
  getRootFolders,
  MAX_FOLDER_DEPTH,
} from '@renderer/utils/folder/tree';
export type { IFolderTreeNode } from '@renderer/utils/folder/tree';
