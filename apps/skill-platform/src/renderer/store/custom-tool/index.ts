import type { ICustomToolTreeNode } from '@/types/modules';
import { collectFirstLevelFolderIds, type IMomoTreeNode } from '@momo/tree';
import {
  createCustomToolFile,
  createCustomToolFolder,
  deleteCustomTool,
  listCustomToolTree,
  moveCustomTool,
  readCustomToolFile,
  renameCustomTool,
  writeCustomToolFile,
} from '@renderer/services/custom-tool/api';
import { collectNoteFolderIds, filterNoteTreeByQuery } from '@renderer/services/note/tree-filter';
import { create } from 'zustand';

function mapToMomoNodes(nodes: ICustomToolTreeNode[]): IMomoTreeNode[] {
  return nodes.map((node) => ({
    id: node.id,
    name: node.name,
    // momo-tree 仅支持 folder|file；工具包映射为 file 以保持叶子交互
    kind: node.kind === 'tool' ? 'file' : 'folder',
    children: node.children?.length ? mapToMomoNodes(node.children) : undefined,
  }));
}

/** 工具展示名（文件夹名） */
export function getCustomToolDisplayName(toolPath: string | null | undefined): string {
  return toolPath?.split('/').pop() ?? 'tool';
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

/** 是否有可展示的工具 HTML */
export function hasToolHtmlContent(content: string): boolean {
  return Boolean(content.trim());
}

interface ICustomToolState {
  rawTree: IMomoTreeNode[];
  treeData: IMomoTreeNode[];
  treeSearchQuery: string;
  selectedId: string | null;
  expandedKeys: string[];
  editorContent: string;
  savedContent: string;
  isEditing: boolean;
  isLoadingTree: boolean;
  isLoadingFile: boolean;
  isSaving: boolean;
  setTreeSearchQuery: (query: string) => void;
  loadTree: () => Promise<void>;
  setExpandedKeys: (keys: string[]) => void;
  selectFolder: (folderId: string) => void;
  selectFile: (fileId: string) => Promise<void>;
  clearSelection: () => void;
  enterEditMode: () => void;
  exitEditMode: () => void;
  setEditorContent: (content: string) => void;
  saveCurrentFile: () => Promise<void>;
  createRootFolder: (name: string) => Promise<void>;
  createFolder: (parentId: string | null, name: string) => Promise<void>;
  createTool: (parentId: string | null, name: string) => Promise<void>;
  renameNode: (nodeId: string, newName: string) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  moveNode: (nodeId: string, targetParentId: string | null) => Promise<void>;
}

export const useCustomToolStore = create<ICustomToolState>((set, get) => ({
  rawTree: [],
  treeData: [],
  treeSearchQuery: '',
  selectedId: null,
  expandedKeys: [],
  editorContent: '',
  savedContent: '',
  isEditing: false,
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
      const nodes = mapToMomoNodes(await listCustomToolTree());
      const { treeSearchQuery } = get();
      const treeData = buildVisibleTree(nodes, treeSearchQuery);
      const expandedKeys = resolveExpandedKeys(treeData, treeSearchQuery, get().expandedKeys);
      set({ rawTree: nodes, treeData, expandedKeys });
    } finally {
      set({ isLoadingTree: false });
    }
  },

  setExpandedKeys: (keys) => set({ expandedKeys: keys }),

  selectFolder: (folderId) => {
    const { expandedKeys } = get();
    const next = expandedKeys.includes(folderId)
      ? expandedKeys.filter((id) => id !== folderId)
      : [...expandedKeys, folderId];
    set({ expandedKeys: next });
  },

  clearSelection: () => {
    set({
      selectedId: null,
      editorContent: '',
      savedContent: '',
      isEditing: false,
    });
  },

  enterEditMode: () => set({ isEditing: true }),

  exitEditMode: () => set({ isEditing: false }),

  selectFile: async (fileId) => {
    const { selectedId, editorContent, savedContent, isEditing } = get();
    // 先占住选中态，避免清空系统选中后自动回选系统工具
    set({ selectedId: fileId, isLoadingFile: true, isEditing: false });

    if (selectedId && selectedId !== fileId && isEditing && editorContent !== savedContent) {
      try {
        await writeCustomToolFile(selectedId, editorContent);
        // 仅当仍停留在目标文件时更新 saved 快照
        if (get().selectedId === fileId) {
          // 旧文件已保存，当前文件尚未读入
        }
      } catch (err) {
        console.error('[custom-tool] auto-save previous failed:', err);
      }
    }

    try {
      const result = await readCustomToolFile(fileId);
      if (get().selectedId !== fileId) {
        return;
      }
      const content = result.content ?? '';
      set({
        editorContent: content,
        savedContent: content,
      });
    } catch (err) {
      console.error('[custom-tool] readFile failed:', err);
      if (get().selectedId === fileId) {
        set({ selectedId: null, editorContent: '', savedContent: '', isEditing: false });
      }
    } finally {
      if (get().selectedId === fileId) {
        set({ isLoadingFile: false });
      }
    }
  },

  setEditorContent: (content) => set({ editorContent: content }),

  saveCurrentFile: async () => {
    const { selectedId, editorContent, savedContent } = get();
    if (!selectedId || editorContent === savedContent) {
      return;
    }
    set({ isSaving: true });
    try {
      await writeCustomToolFile(selectedId, editorContent);
      set({ savedContent: editorContent });
    } finally {
      set({ isSaving: false });
    }
  },

  createRootFolder: async (name) => {
    await createCustomToolFolder(null, name);
    await get().loadTree();
  },

  createFolder: async (parentId, name) => {
    await createCustomToolFolder(parentId, name);
    if (parentId) {
      const { expandedKeys } = get();
      if (!expandedKeys.includes(parentId)) {
        set({ expandedKeys: [...expandedKeys, parentId] });
      }
    }
    await get().loadTree();
  },

  createTool: async (parentId, name) => {
    const created = await createCustomToolFile(parentId, name);
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
    const renamed = await renameCustomTool(nodeId, newName);
    const { selectedId } = get();
    if (selectedId === nodeId && renamed.kind === 'tool') {
      set({ selectedId: renamed.id });
    }
    await get().loadTree();
  },

  deleteNode: async (nodeId) => {
    await deleteCustomTool(nodeId);
    const { selectedId } = get();
    if (selectedId === nodeId || selectedId?.startsWith(`${nodeId}/`)) {
      set({ selectedId: null, editorContent: '', savedContent: '', isEditing: false });
    }
    await get().loadTree();
  },

  moveNode: async (nodeId, targetParentId) => {
    const moved = await moveCustomTool(nodeId, targetParentId);
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
}));
