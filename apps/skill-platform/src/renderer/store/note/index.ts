import type { INoteTreeNode } from '@/types/modules';
import { collectFirstLevelFolderIds, type IMomoTreeNode } from '@momo/tree';
import { collectNoteFolderIds, filterNoteTreeByQuery } from '@renderer/services/note/tree-filter';
import { create } from 'zustand';

function getNoteApi() {
  return window.api?.note;
}

function mapToMomoNodes(nodes: INoteTreeNode[]): IMomoTreeNode[] {
  return nodes.map((node) => ({
    id: node.id,
    name: node.name,
    kind: node.kind,
    noteType: node.noteType,
    children: node.children?.length ? mapToMomoNodes(node.children) : undefined,
  }));
}

function buildVisibleTree(rawTree: IMomoTreeNode[], searchQuery: string): IMomoTreeNode[] {
  return filterNoteTreeByQuery(rawTree, searchQuery);
}

function resolveExpandedKeys(
  treeData: IMomoTreeNode[],
  searchQuery: string,
  currentExpandedKeys: string[],
): string[] {
  if (searchQuery.trim()) {
    return collectNoteFolderIds(treeData);
  }
  if (currentExpandedKeys.length > 0) {
    return currentExpandedKeys;
  }
  return collectFirstLevelFolderIds(treeData);
}

interface INoteState {
  rawTree: IMomoTreeNode[];
  treeData: IMomoTreeNode[];
  treeSearchQuery: string;
  selectedId: string | null;
  expandedKeys: string[];
  editorContent: string;
  savedContent: string;
  isLoadingTree: boolean;
  isLoadingFile: boolean;
  isSaving: boolean;
  setTreeSearchQuery: (query: string) => void;
  loadTree: () => Promise<void>;
  setExpandedKeys: (keys: string[]) => void;
  toggleExpand: (folderId: string) => void;
  selectFolder: (folderId: string) => void;
  selectFile: (fileId: string) => Promise<void>;
  setEditorContent: (content: string) => void;
  appendEditorContent: (content: string) => void;
  saveCurrentFile: () => Promise<void>;
  createRootFolder: (name: string) => Promise<void>;
  createFolder: (parentId: string | null, name: string) => Promise<void>;
  createNote: (parentId: string | null, name: string) => Promise<void>;
  renameNode: (nodeId: string, newName: string) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  moveNode: (nodeId: string, targetParentId: string | null) => Promise<void>;
  copyFile: (fileId: string) => Promise<void>;
}

export const useNoteStore = create<INoteState>((set, get) => ({
  rawTree: [],
  treeData: [],
  treeSearchQuery: '',
  selectedId: null,
  expandedKeys: [],
  editorContent: '',
  savedContent: '',
  isLoadingTree: false,
  isLoadingFile: false,
  isSaving: false,

  setTreeSearchQuery: (query) => {
    const { rawTree } = get();
    const treeData = buildVisibleTree(rawTree, query);
    const expandedKeys = resolveExpandedKeys(treeData, query, get().expandedKeys);
    set({ treeSearchQuery: query, treeData, expandedKeys });
  },

  loadTree: async () => {
    const api = getNoteApi();
    if (!api?.listTree) {
      return;
    }
    set({ isLoadingTree: true });
    try {
      const nodes = mapToMomoNodes(await api.listTree());
      const { treeSearchQuery } = get();
      const treeData = buildVisibleTree(nodes, treeSearchQuery);
      const expandedKeys = resolveExpandedKeys(treeData, treeSearchQuery, get().expandedKeys);
      set({ rawTree: nodes, treeData, expandedKeys });
    } finally {
      set({ isLoadingTree: false });
    }
  },

  setExpandedKeys: (keys) => set({ expandedKeys: keys }),

  toggleExpand: (folderId) => {
    const { expandedKeys } = get();
    const next = expandedKeys.includes(folderId)
      ? expandedKeys.filter((id) => id !== folderId)
      : [...expandedKeys, folderId];
    set({ expandedKeys: next });
  },

  selectFolder: (folderId) => {
    get().toggleExpand(folderId);
  },

  selectFile: async (fileId) => {
    const api = getNoteApi();
    if (!api?.readFile) {
      return;
    }

    const { selectedId, editorContent, savedContent } = get();
    if (selectedId && selectedId !== fileId && editorContent !== savedContent) {
      await get().saveCurrentFile();
    }

    set({ isLoadingFile: true, selectedId: fileId });
    try {
      const result = await api.readFile(fileId);
      set({
        editorContent: result.content ?? '',
        savedContent: result.content ?? '',
      });
    } catch (err) {
      console.error('[note] readFile failed:', err);
      set({ selectedId: null, editorContent: '', savedContent: '' });
    } finally {
      set({ isLoadingFile: false });
    }
  },

  setEditorContent: (content) => set({ editorContent: content }),
  appendEditorContent: (suffix) =>
    set((state) => ({
      editorContent: `${state.editorContent}${suffix}`,
    })),

  saveCurrentFile: async () => {
    const api = getNoteApi();
    const { selectedId, editorContent, savedContent } = get();
    if (!api?.writeFile || !selectedId || editorContent === savedContent) {
      return;
    }
    set({ isSaving: true });
    try {
      await api.writeFile(selectedId, editorContent);
      set({ savedContent: editorContent });
    } finally {
      set({ isSaving: false });
    }
  },

  createRootFolder: async (name) => {
    const api = getNoteApi();
    if (!api?.createFolder) {
      return;
    }
    await api.createFolder(null, name);
    await get().loadTree();
  },

  createFolder: async (parentId, name) => {
    const api = getNoteApi();
    if (!api?.createFolder) {
      return;
    }
    await api.createFolder(parentId, name);
    if (parentId) {
      const { expandedKeys } = get();
      if (!expandedKeys.includes(parentId)) {
        set({ expandedKeys: [...expandedKeys, parentId] });
      }
    }
    await get().loadTree();
  },

  createNote: async (parentId, name) => {
    const api = getNoteApi();
    if (!api?.createFile) {
      return;
    }
    const created = await api.createFile(parentId, name);
    if (parentId) {
      const { expandedKeys } = get();
      if (!expandedKeys.includes(parentId)) {
        set({ expandedKeys: [...expandedKeys, parentId] });
      }
    }
    await get().loadTree();
    await get().selectFile(created.id);
  },

  renameNode: async (nodeId, newName) => {
    const api = getNoteApi();
    if (!api?.rename) {
      return;
    }
    const renamed = await api.rename(nodeId, newName);
    const { selectedId } = get();
    if (selectedId === nodeId && renamed.kind === 'file') {
      set({ selectedId: renamed.id });
    }
    await get().loadTree();
  },

  deleteNode: async (nodeId) => {
    const api = getNoteApi();
    if (!api?.delete) {
      return;
    }
    await api.delete(nodeId);
    const { selectedId } = get();
    if (selectedId === nodeId || selectedId?.startsWith(`${nodeId}/`)) {
      set({ selectedId: null, editorContent: '', savedContent: '' });
    }
    await get().loadTree();
  },

  moveNode: async (nodeId, targetParentId) => {
    const api = getNoteApi();
    if (!api?.move) {
      return;
    }
    const moved = await api.move(nodeId, targetParentId);
    const { selectedId } = get();
    if (selectedId === nodeId) {
      set({ selectedId: moved.id });
    }
    if (targetParentId) {
      const { expandedKeys } = get();
      if (!expandedKeys.includes(targetParentId)) {
        set({ expandedKeys: [...expandedKeys, targetParentId] });
      }
    }
    await get().loadTree();
  },

  copyFile: async (fileId) => {
    const api = getNoteApi();
    if (!api?.copyFile) {
      return;
    }
    const copied = await api.copyFile(fileId);
    await get().loadTree();
    await get().selectFile(copied.id);
  },
}));
