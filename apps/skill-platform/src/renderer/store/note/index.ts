import type { INoteTreeNode } from '@/types/modules';
import { collectFirstLevelFolderIds, type IMomoTreeNode } from '@momo/tree';
import {
  bootstrapCursorRules,
  copyNoteFile,
  createNoteFile,
  createNoteFolder,
  deleteNote,
  listNoteTree,
  moveNote,
  readNoteFile,
  renameNote,
  writeNoteFile,
} from '@renderer/services/note/api';
import { collectNoteFolderIds, filterNoteTreeByQuery } from '@renderer/services/note/tree-filter';
import { create } from 'zustand';

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
    set({ isLoadingTree: true });
    try {
      await bootstrapCursorRules();
      const nodes = mapToMomoNodes(await listNoteTree());
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
    const { selectedId, editorContent, savedContent } = get();
    if (selectedId && selectedId !== fileId && editorContent !== savedContent) {
      await get().saveCurrentFile();
    }

    set({ isLoadingFile: true, selectedId: fileId });
    try {
      const result = await readNoteFile(fileId);
      const content = typeof result === 'string' ? result : (result?.content ?? '');
      set({
        editorContent: content,
        savedContent: content,
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
    const { selectedId, editorContent, savedContent } = get();
    if (!selectedId || editorContent === savedContent) {
      return;
    }
    set({ isSaving: true });
    try {
      await writeNoteFile(selectedId, editorContent);
      set({ savedContent: editorContent });
    } finally {
      set({ isSaving: false });
    }
  },

  createRootFolder: async (name) => {
    await createNoteFolder(null, name);
    await get().loadTree();
  },

  createFolder: async (parentId, name) => {
    await createNoteFolder(parentId, name);
    if (parentId) {
      const { expandedKeys } = get();
      if (!expandedKeys.includes(parentId)) {
        set({ expandedKeys: [...expandedKeys, parentId] });
      }
    }
    await get().loadTree();
  },

  createNote: async (parentId, name) => {
    const created = await createNoteFile(parentId, name);
    const createdId = typeof created === 'string' ? created : created.id;
    if (parentId) {
      const { expandedKeys } = get();
      if (!expandedKeys.includes(parentId)) {
        set({ expandedKeys: [...expandedKeys, parentId] });
      }
    }
    await get().loadTree();
    await get().selectFile(createdId);
  },

  renameNode: async (nodeId, newName) => {
    const renamed = await renameNote(nodeId, newName);
    const { selectedId } = get();
    if (selectedId === nodeId && renamed.kind === 'file') {
      set({ selectedId: renamed.id });
    }
    await get().loadTree();
  },

  deleteNode: async (nodeId) => {
    await deleteNote(nodeId);
    const { selectedId } = get();
    if (selectedId === nodeId || selectedId?.startsWith(`${nodeId}/`)) {
      set({ selectedId: null, editorContent: '', savedContent: '' });
    }
    await get().loadTree();
  },

  moveNode: async (nodeId, targetParentId) => {
    const moved = await moveNote(nodeId, targetParentId);
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
    const copied = await copyNoteFile(fileId);
    await get().loadTree();
    await get().selectFile(copied.id);
  },
}));
