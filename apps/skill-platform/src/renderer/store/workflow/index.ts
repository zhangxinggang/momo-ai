import type { DCreateWorkflow, DUpdateWorkflow, IWorkflow, IWorkflowFolder } from '@/types/modules';
import { collectFirstLevelFolderIds, type IMomoTreeNode } from '@momo/tree';
import { create } from 'zustand';

import {
  createWorkflowFolder,
  createWorkflow as createWorkflowRecord,
  deleteWorkflowFolder,
  listWorkflowFolders,
  listWorkflows,
  updateWorkflowFolder,
  updateWorkflowFolderOrders,
  updateWorkflow as updateWorkflowRecord,
} from '@renderer/services/workflow/api';
import {
  buildWorkflowTree,
  collectWorkflowFolderIds,
  filterWorkflowTreeByQuery,
  toFolderLikeList,
} from '@renderer/services/workflow/tree';
import { useUIStore } from '@renderer/store/ui';
import { canSetParent } from '@renderer/utils/folder/tree';

interface IWorkflowState {
  workflows: IWorkflow[];
  folders: IWorkflowFolder[];
  selectedWorkflowId: string | null;
  treeData: IMomoTreeNode[];
  treeSearchQuery: string;
  expandedKeys: string[];
  isLoading: boolean;
  fetchWorkflows: () => Promise<void>;
  fetchFolders: () => Promise<void>;
  refreshTree: () => void;
  selectWorkflow: (id: string | null) => void;
  setTreeSearchQuery: (query: string) => void;
  setExpandedKeys: (keys: string[]) => void;
  createFolder: (data: { name: string; parentId?: string }) => Promise<IWorkflowFolder>;
  updateFolder: (id: string, data: { name?: string; parentId?: string }) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  moveFolder: (id: string, newParentId: string | null, newIndex: number) => Promise<void>;
  createWorkflow: (data: DCreateWorkflow) => Promise<IWorkflow>;
  createWorkflowAndOpenStudio: (name: string, folderId?: string) => Promise<IWorkflow>;
  duplicateWorkflow: (id: string) => Promise<IWorkflow>;
  updateWorkflow: (id: string, data: DUpdateWorkflow) => Promise<void>;
}

export const useWorkflowStore = create<IWorkflowState>()((set, get) => ({
  workflows: [],
  folders: [],
  selectedWorkflowId: null,
  treeData: [],
  treeSearchQuery: '',
  expandedKeys: [],
  isLoading: false,

  refreshTree: () => {
    const { workflows, folders, treeSearchQuery, expandedKeys: currentExpandedKeys } = get();
    const rawTree = buildWorkflowTree(folders, workflows);
    const treeData = filterWorkflowTreeByQuery(rawTree, treeSearchQuery);
    const expandedKeys = treeSearchQuery.trim()
      ? collectWorkflowFolderIds(treeData)
      : currentExpandedKeys.length > 0
        ? currentExpandedKeys
        : collectFirstLevelFolderIds(treeData);
    set({ treeData, expandedKeys });
  },

  fetchFolders: async () => {
    try {
      const folders = await listWorkflowFolders();
      set({ folders });
      get().refreshTree();
    } catch {
      set({ folders: [] });
      get().refreshTree();
    }
  },

  fetchWorkflows: async () => {
    set({ isLoading: true });
    try {
      const list = await listWorkflows();
      set({ workflows: list, isLoading: false });
    } catch {
      set({ workflows: [], isLoading: false });
    }
    get().refreshTree();
  },

  selectWorkflow: (id) => set({ selectedWorkflowId: id }),

  setTreeSearchQuery: (query) => {
    set({ treeSearchQuery: query });
    get().refreshTree();
  },

  setExpandedKeys: (keys) => set({ expandedKeys: keys }),

  createFolder: async (data) => {
    const folder = await createWorkflowFolder({
      name: data.name,
      parentId: data.parentId,
    });
    set((state) => ({ folders: [...state.folders, folder] }));
    get().refreshTree();
    return folder;
  },

  updateFolder: async (id, data) => {
    const updated = await updateWorkflowFolder(id, data);
    set((state) => ({
      folders: state.folders.map((folder) => (folder.id === id ? updated : folder)),
    }));
    get().refreshTree();
  },

  deleteFolder: async (id) => {
    await deleteWorkflowFolder(id);
    set((state) => ({
      folders: state.folders.filter((folder) => folder.id !== id),
    }));
    get().refreshTree();
  },

  moveFolder: async (id, newParentId, newIndex) => {
    const { folders } = get();
    const folderToMove = folders.find((folder) => folder.id === id);
    if (!folderToMove) {
      return;
    }

    const folderLikeList = toFolderLikeList(folders);
    if (newParentId && !canSetParent(folderLikeList, id, newParentId)) {
      return;
    }

    const now = Date.now();
    const nextFolder: IWorkflowFolder = {
      ...folderToMove,
      parentId: newParentId || undefined,
      order: newIndex,
      updatedAt: now,
    };

    const otherFolders = folders.filter((folder) => folder.id !== id);
    const newSiblings = otherFolders
      .filter((folder) => (newParentId ? folder.parentId === newParentId : !folder.parentId))
      .sort((left, right) => left.order - right.order);
    newSiblings.splice(newIndex, 0, nextFolder);

    const orderUpdates = newSiblings.map((folder, index) => ({
      id: folder.id,
      order: index,
    }));

    const previousFolders = folders;
    set((state) => ({
      folders: state.folders.map((folder) => {
        if (folder.id === id) {
          return nextFolder;
        }
        const update = orderUpdates.find((item) => item.id === folder.id);
        return update ? { ...folder, order: update.order } : folder;
      }),
    }));

    try {
      await updateWorkflowFolder(id, { parentId: newParentId || undefined });
      await updateWorkflowFolderOrders(orderUpdates);
      get().refreshTree();
    } catch (error) {
      console.error('移动工作流目录失败:', error);
      set({ folders: previousFolders });
      get().refreshTree();
    }
  },

  createWorkflow: async (data) => {
    const created = await createWorkflowRecord(data);
    set((state) => ({ workflows: [created, ...state.workflows] }));
    get().refreshTree();
    return created;
  },

  createWorkflowAndOpenStudio: async (name, folderId) => {
    const created = await get().createWorkflow({
      name,
      folderId: folderId ?? undefined,
    });
    useUIStore.getState().closeWorkflowBusinessWork();
    get().selectWorkflow(created.id);
    useUIStore.getState().openWorkflowStudio(created.id);
    return created;
  },

  duplicateWorkflow: async (id) => {
    const source = get().workflows.find((workflow) => workflow.id === id);
    if (!source) {
      throw new Error('工作流不存在');
    }
    const copyName = `${source.name} (副本)`;
    const created = await get().createWorkflow({
      name: copyName,
      graphJson: source.graphJson,
      folderId: source.folderId ?? undefined,
    });
    get().selectWorkflow(created.id);
    useUIStore.getState().openWorkflowStudio(created.id);
    return created;
  },

  updateWorkflow: async (id, data) => {
    const updated = await updateWorkflowRecord(id, data);
    set((state) => ({
      workflows: state.workflows.map((workflow) => (workflow.id === id ? updated : workflow)),
    }));
    get().refreshTree();
  },
}));
