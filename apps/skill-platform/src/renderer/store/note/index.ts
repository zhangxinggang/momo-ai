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
import {
  clearNoteAiWritingStorage,
  collectNoteIdsFromTree,
} from '@renderer/services/note/note-ai-storage';
import { collectNoteFolderIds, filterNoteTreeByQuery } from '@renderer/services/note/tree-filter';
import { create } from 'zustand';

function mapToMomoNodes(nodes: INoteTreeNode[]): IMomoTreeNode[] {
  return nodes.map((node) => ({
    id: node.id,
    name: node.name,
    kind: node.kind,
    noteType: node.noteType,
    noteId: node.noteId,
    children: node.children?.length ? mapToMomoNodes(node.children) : undefined,
  }));
}

function findNoteIdInTree(nodes: IMomoTreeNode[], fileId: string): string | null {
  for (const node of nodes) {
    if (node.id === fileId) {
      return node.noteId ?? null;
    }
    if (node.children?.length) {
      const found = findNoteIdInTree(node.children, fileId);
      if (found) {
        return found;
      }
    }
  }
  return null;
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

const NOTE_IPC_ATTEMPTS = 2;

let treeRequestId = 0;
let fileRequestId = 0;
let saveRequestId = 0;

async function retryTransientNoteRequest<T>(request: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < NOTE_IPC_ATTEMPTS; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

interface INoteState {
  rawTree: IMomoTreeNode[];
  treeData: IMomoTreeNode[];
  treeSearchQuery: string;
  selectedId: string | null;
  selectedNoteId: string | null;
  expandedKeys: string[];
  editorContent: string;
  savedContent: string;
  isLoadingTree: boolean;
  isLoadingFile: boolean;
  isSaving: boolean;
  treeLoadError: string | null;
  fileLoadError: string | null;
  setTreeSearchQuery: (query: string) => void;
  loadTree: () => Promise<void>;
  setExpandedKeys: (keys: string[]) => void;
  toggleExpand: (folderId: string) => void;
  selectFolder: (folderId: string) => void;
  selectFile: (fileId: string) => Promise<void>;
  /** 当前选中笔记缺少 noteId 时，从树或 readFile 补全 */
  ensureSelectedNoteId: () => Promise<string | null>;
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
  selectedNoteId: null,
  expandedKeys: [],
  editorContent: '',
  savedContent: '',
  isLoadingTree: false,
  isLoadingFile: false,
  isSaving: false,
  treeLoadError: null,
  fileLoadError: null,

  setTreeSearchQuery: (query) => {
    const { rawTree } = get();
    const treeData = buildVisibleTree(rawTree, query);
    const expandedKeys = resolveExpandedKeys(treeData, query, get().expandedKeys);
    set({ treeSearchQuery: query, treeData, expandedKeys });
  },

  loadTree: async () => {
    const requestId = ++treeRequestId;
    set({ isLoadingTree: true, treeLoadError: null });
    try {
      try {
        await bootstrapCursorRules();
      } catch (error) {
        // 规则目录初始化只是兼容性导入，失败不应阻断用户已有笔记的加载。
        console.warn('[note] bootstrap cursor rules failed:', error);
      }

      const nodes = mapToMomoNodes(await retryTransientNoteRequest(() => listNoteTree()));
      if (requestId !== treeRequestId) {
        return;
      }
      const { treeSearchQuery, selectedId } = get();
      const treeData = buildVisibleTree(nodes, treeSearchQuery);
      const expandedKeys = resolveExpandedKeys(treeData, treeSearchQuery, get().expandedKeys);
      const treeNoteId = selectedId ? findNoteIdInTree(nodes, selectedId) : null;
      const { selectedNoteId: prevNoteId, selectedId: prevSelectedId } = get();
      const selectedNoteId =
        treeNoteId ?? (selectedId && prevSelectedId === selectedId ? prevNoteId : null);
      set({ rawTree: nodes, treeData, expandedKeys, selectedNoteId, treeLoadError: null });
    } catch (error) {
      console.error('[note] loadTree failed:', error);
      if (requestId === treeRequestId) {
        set({ treeLoadError: getErrorMessage(error, '笔记列表加载失败') });
      }
    } finally {
      if (requestId === treeRequestId) {
        set({ isLoadingTree: false });
      }
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

  ensureSelectedNoteId: async () => {
    const { selectedId, selectedNoteId, rawTree } = get();
    if (!selectedId) {
      return null;
    }
    if (selectedNoteId) {
      return selectedNoteId;
    }

    let noteId = findNoteIdInTree(rawTree, selectedId);
    if (!noteId) {
      await get().loadTree();
      noteId = findNoteIdInTree(get().rawTree, selectedId);
    }
    if (!noteId) {
      try {
        const result = await readNoteFile(selectedId);
        if (typeof result !== 'string' && result.noteId) {
          noteId = result.noteId;
        }
      } catch (err) {
        console.error('[note] ensureSelectedNoteId readFile failed:', err);
      }
    }

    if (noteId) {
      set({ selectedNoteId: noteId });
    }
    return noteId;
  },

  selectFile: async (fileId) => {
    const requestId = ++fileRequestId;
    const { selectedId, editorContent, savedContent } = get();
    if (selectedId && selectedId !== fileId && editorContent !== savedContent) {
      try {
        await get().saveCurrentFile();
      } catch (error) {
        console.error('[note] save before selection failed:', error);
        return;
      }
    }
    if (requestId !== fileRequestId) {
      return;
    }

    set({
      isLoadingFile: true,
      selectedId: fileId,
      selectedNoteId: findNoteIdInTree(get().rawTree, fileId),
      editorContent: '',
      savedContent: '',
      fileLoadError: null,
    });
    try {
      const result = await retryTransientNoteRequest(() => readNoteFile(fileId));
      if (requestId !== fileRequestId || get().selectedId !== fileId) {
        return;
      }
      let content = '';
      let noteId = findNoteIdInTree(get().rawTree, fileId);
      if (typeof result === 'string') {
        content = result;
      } else {
        content = result.content ?? '';
        if (result.noteId) {
          noteId = result.noteId;
        }
      }
      set({
        editorContent: content,
        savedContent: content,
        selectedNoteId: noteId,
        fileLoadError: null,
      });
    } catch (err) {
      console.error('[note] readFile failed:', err);
      if (requestId === fileRequestId && get().selectedId === fileId) {
        // 保留用户刚刚点击的节点，让右侧展示明确错误并允许重试。
        set({
          editorContent: '',
          savedContent: '',
          fileLoadError: getErrorMessage(err, '笔记加载失败'),
        });
      }
    } finally {
      if (requestId === fileRequestId && get().selectedId === fileId) {
        set({ isLoadingFile: false });
      }
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
    const requestId = ++saveRequestId;
    const targetId = selectedId;
    const targetContent = editorContent;
    set({ isSaving: true });
    try {
      await writeNoteFile(targetId, targetContent);
      if (
        requestId === saveRequestId &&
        get().selectedId === targetId &&
        get().editorContent === targetContent
      ) {
        set({ savedContent: targetContent });
      }
    } finally {
      if (requestId === saveRequestId) {
        set({ isSaving: false });
      }
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
    const { rawTree } = get();
    const noteIds = collectNoteIdsFromTree(rawTree, nodeId);
    await deleteNote(nodeId);
    for (const id of noteIds) {
      clearNoteAiWritingStorage(id);
    }
    const { selectedId } = get();
    if (selectedId === nodeId || selectedId?.startsWith(`${nodeId}/`)) {
      set({ selectedId: null, selectedNoteId: null, editorContent: '', savedContent: '' });
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
