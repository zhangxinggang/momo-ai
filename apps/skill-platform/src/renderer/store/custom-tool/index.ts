import type {
  ECustomToolViewKind,
  ICustomToolComponentConfig,
  ICustomToolDocument,
  ICustomToolTreeNode,
} from '@/types/modules';
import { collectFirstLevelFolderIds, type IMomoTreeNode } from '@momo/tree';
import {
  createCustomTool,
  createCustomToolFolder,
  deleteCustomTool,
  listCustomToolTree,
  moveCustomTool,
  readCustomTool,
  renameCustomTool,
  saveCustomTool,
} from '@renderer/services/custom-tool/api';
import { collectNoteFolderIds, filterNoteTreeByQuery } from '@renderer/services/note/tree-filter';
import { create } from 'zustand';

function mapToMomoNodes(nodes: ICustomToolTreeNode[]): IMomoTreeNode[] {
  return nodes.map((node) => ({
    id: node.id,
    name: node.name,
    kind: node.kind === 'tool' ? 'file' : 'folder',
    children: node.children?.length ? mapToMomoNodes(node.children) : undefined,
  }));
}

function containsToolNode(nodes: IMomoTreeNode[], nodeId: string): boolean {
  return nodes.some(
    (node) =>
      (node.id === nodeId && node.kind === 'file') ||
      Boolean(node.children?.length && containsToolNode(node.children, nodeId)),
  );
}

function serializeDocument(document: ICustomToolDocument | null): string {
  return document
    ? JSON.stringify({
        kind: document.kind,
        content: document.content,
        components: document.components,
      })
    : '';
}

function isPathInside(selectedId: string | null, nodeId: string): selectedId is string {
  return selectedId === nodeId || Boolean(selectedId?.startsWith(`${nodeId}/`));
}

export function getCustomToolDisplayName(toolPath: string | null | undefined): string {
  return toolPath?.split('/').pop() ?? 'tool';
}

export interface ICustomToolGenerationTask {
  id: number;
  status: 'generating' | 'done' | 'stopped' | 'error';
  mode: ECustomToolViewKind;
  errorMessage: string;
}

interface ICustomToolState {
  rawTree: IMomoTreeNode[];
  treeData: IMomoTreeNode[];
  treeSearchQuery: string;
  selectedId: string | null;
  expandedKeys: string[];
  document: ICustomToolDocument | null;
  savedSnapshot: string;
  isEditing: boolean;
  isLoadingTree: boolean;
  isLoadingFile: boolean;
  isSaving: boolean;
  selectedComponentId: string | null;
  generationTasks: Record<string, ICustomToolGenerationTask>;
  setTreeSearchQuery: (query: string) => void;
  loadTree: () => Promise<void>;
  setExpandedKeys: (keys: string[]) => void;
  selectFolder: (folderId: string) => void;
  selectFile: (fileId: string) => Promise<void>;
  clearSelection: () => void;
  enterEditMode: () => void;
  exitEditMode: () => void;
  setDocumentContent: (content: string, kind?: ECustomToolViewKind) => void;
  setComponentConfig: (id: string, config: ICustomToolComponentConfig) => void;
  selectComponent: (id: string | null) => void;
  saveCurrent: () => Promise<void>;
  createRootFolder: (name: string) => Promise<void>;
  createFolder: (parentId: string | null, name: string) => Promise<void>;
  createTool: (parentId: string | null, name: string) => Promise<void>;
  renameNode: (nodeId: string, newName: string) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  moveNode: (nodeId: string, targetParentId: string | null) => Promise<void>;
  setGenerationTask: (toolPath: string, task: ICustomToolGenerationTask | null) => void;
}

const emptySelection = {
  selectedId: null,
  document: null,
  savedSnapshot: '',
  isEditing: false,
  isLoadingFile: false,
  selectedComponentId: null,
} as const;

let selectionRequest = 0;

export const useCustomToolStore = create<ICustomToolState>((set, get) => ({
  rawTree: [],
  treeData: [],
  treeSearchQuery: '',
  selectedId: null,
  expandedKeys: [],
  document: null,
  savedSnapshot: '',
  isEditing: false,
  isLoadingTree: false,
  isLoadingFile: false,
  isSaving: false,
  selectedComponentId: null,
  generationTasks: {},

  setTreeSearchQuery: (treeSearchQuery) => {
    const treeData = filterNoteTreeByQuery(get().rawTree, treeSearchQuery);
    set({
      treeSearchQuery,
      treeData,
      expandedKeys: treeSearchQuery.trim()
        ? collectNoteFolderIds(treeData)
        : get().expandedKeys.length
          ? get().expandedKeys
          : collectFirstLevelFolderIds(treeData),
    });
  },

  loadTree: async () => {
    set({ isLoadingTree: true });
    try {
      const rawTree = mapToMomoNodes(await listCustomToolTree());
      const treeData = filterNoteTreeByQuery(rawTree, get().treeSearchQuery);
      const selectedId = get().selectedId;
      set({
        rawTree,
        treeData,
        expandedKeys: get().treeSearchQuery.trim()
          ? collectNoteFolderIds(treeData)
          : get().expandedKeys.length
            ? get().expandedKeys
            : collectFirstLevelFolderIds(treeData),
        ...(selectedId && !containsToolNode(rawTree, selectedId) ? emptySelection : {}),
      });
    } finally {
      set({ isLoadingTree: false });
    }
  },

  setExpandedKeys: (expandedKeys) => set({ expandedKeys }),
  selectFolder: (folderId) => {
    const expanded = get().expandedKeys;
    set({
      expandedKeys: expanded.includes(folderId)
        ? expanded.filter((id) => id !== folderId)
        : [...expanded, folderId],
    });
  },

  clearSelection: () => {
    selectionRequest += 1;
    set(emptySelection);
  },
  enterEditMode: () => set({ isEditing: true }),
  exitEditMode: () => set({ isEditing: false, selectedComponentId: null }),

  selectFile: async (fileId) => {
    const requestId = ++selectionRequest;
    const previous = get();
    if (
      previous.selectedId &&
      previous.document &&
      serializeDocument(previous.document) !== previous.savedSnapshot &&
      previous.generationTasks[previous.selectedId]?.status !== 'generating'
    ) {
      await saveCustomTool(previous.selectedId, previous.document).catch((error) =>
        console.error('[custom-tool] 自动保存失败', error),
      );
    }
    set({
      selectedId: fileId,
      document: null,
      savedSnapshot: '',
      isEditing: false,
      isLoadingFile: true,
      selectedComponentId: null,
    });
    try {
      const document = await readCustomTool(fileId);
      if (requestId !== selectionRequest || get().selectedId !== fileId) return;
      set({ document, savedSnapshot: serializeDocument(document) });
    } finally {
      if (requestId === selectionRequest) set({ isLoadingFile: false });
    }
  },

  setDocumentContent: (content, kind) =>
    set((state) => ({
      document: state.document
        ? { ...state.document, content, kind: kind ?? state.document.kind }
        : null,
      selectedComponentId: kind && kind !== state.document?.kind ? null : state.selectedComponentId,
    })),

  setComponentConfig: (id, config) =>
    set((state) => ({
      document: state.document
        ? { ...state.document, components: { ...state.document.components, [id]: config } }
        : null,
    })),
  selectComponent: (selectedComponentId) => set({ selectedComponentId }),

  saveCurrent: async () => {
    const { selectedId, document } = get();
    if (!selectedId || !document) return;
    set({ isSaving: true });
    try {
      const saved = await saveCustomTool(selectedId, document);
      set({ document: saved, savedSnapshot: serializeDocument(saved) });
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
    if (parentId && !get().expandedKeys.includes(parentId)) {
      set({ expandedKeys: [...get().expandedKeys, parentId] });
    }
    await get().loadTree();
  },
  createTool: async (parentId, name) => {
    const created = await createCustomTool(parentId, name);
    if (parentId && !get().expandedKeys.includes(parentId)) {
      set({ expandedKeys: [...get().expandedKeys, parentId] });
    }
    await get().loadTree();
    await get().selectFile(created.id);
    set({ isEditing: true });
  },

  renameNode: async (nodeId, newName) => {
    const before = get();
    if (
      before.document &&
      isPathInside(before.selectedId, nodeId) &&
      serializeDocument(before.document) !== before.savedSnapshot
    ) {
      await before.saveCurrent();
    }
    const renamed = await renameCustomTool(nodeId, newName);
    if (isPathInside(get().selectedId, nodeId)) {
      const selected = get().selectedId!;
      set({ selectedId: null });
      await get().selectFile(`${renamed.id}${selected.slice(nodeId.length)}`);
    }
    await get().loadTree();
  },

  deleteNode: async (nodeId) => {
    await deleteCustomTool(nodeId);
    if (isPathInside(get().selectedId, nodeId)) {
      selectionRequest += 1;
      set(emptySelection);
    }
    await get().loadTree();
  },

  moveNode: async (nodeId, targetParentId) => {
    const before = get();
    if (
      before.document &&
      isPathInside(before.selectedId, nodeId) &&
      serializeDocument(before.document) !== before.savedSnapshot
    ) {
      await before.saveCurrent();
    }
    const moved = await moveCustomTool(nodeId, targetParentId);
    if (isPathInside(get().selectedId, nodeId)) {
      const selected = get().selectedId!;
      set({ selectedId: null });
      await get().selectFile(`${moved.id}${selected.slice(nodeId.length)}`);
    }
    if (targetParentId && !get().expandedKeys.includes(targetParentId)) {
      set({ expandedKeys: [...get().expandedKeys, targetParentId] });
    }
    await get().loadTree();
  },

  setGenerationTask: (toolPath, task) =>
    set((state) => {
      const generationTasks = { ...state.generationTasks };
      if (task) generationTasks[toolPath] = task;
      else delete generationTasks[toolPath];
      return { generationTasks };
    }),
}));

export function isCustomToolDirty(state = useCustomToolStore.getState()): boolean {
  return serializeDocument(state.document) !== state.savedSnapshot;
}
