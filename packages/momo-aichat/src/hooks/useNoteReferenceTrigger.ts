import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';

import type { INoteReferenceNode, INoteReferencesConfig } from '../types/note-reference';
import {
  buildNoteMentionToken,
  extractAtQuery,
  findMentionAtCursor,
  replaceAtQueryWithMention,
  replaceMentionToken,
  type IAtQueryContext,
  type INoteMentionMatch,
} from '../utils/note-mention';

interface IFlatNoteItem {
  id: string;
  name: string;
  path: string[];
}

interface IUseNoteReferenceTriggerOptions {
  value: string;
  onChange: (value: string) => void;
  noteReferences?: INoteReferencesConfig;
  selectionStart: number;
  onSelectionChange?: (next: number) => void;
}

function flattenNoteFiles(nodes: INoteReferenceNode[], path: string[] = []): IFlatNoteItem[] {
  const items: IFlatNoteItem[] = [];
  for (const node of nodes) {
    const nextPath = [...path, node.name];
    if (node.kind === 'file') {
      items.push({ id: node.id, name: node.name, path: nextPath });
    }
    if (node.children?.length) {
      items.push(...flattenNoteFiles(node.children, nextPath));
    }
  }
  return items;
}

function filterTree(nodes: INoteReferenceNode[], query: string): INoteReferenceNode[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return nodes;
  }

  const walk = (items: INoteReferenceNode[]): INoteReferenceNode[] => {
    const result: INoteReferenceNode[] = [];
    for (const node of items) {
      const children = node.children ? walk(node.children) : [];
      const selfMatch = node.name.toLowerCase().includes(normalized);
      if (selfMatch || children.length > 0) {
        result.push({
          ...node,
          children: children.length > 0 ? children : node.children,
        });
      }
    }
    return result;
  };

  return walk(nodes);
}

function collectSelectableFileIds(nodes: INoteReferenceNode[]): string[] {
  const ids: string[] = [];
  const walk = (items: INoteReferenceNode[]) => {
    for (const node of items) {
      if (node.kind === 'file') {
        ids.push(node.id);
      }
      if (node.children?.length) {
        walk(node.children);
      }
    }
  };
  walk(nodes);
  return ids;
}

function collectFolderIds(nodes: INoteReferenceNode[]): string[] {
  return nodes.flatMap((node) =>
    node.kind === 'folder'
      ? [node.id, ...(node.children ? collectFolderIds(node.children) : [])]
      : [],
  );
}

/** Expand only structural roots so each resource group initially shows one real directory level. */
function collectInitialExpandedKeys(nodes: INoteReferenceNode[]): string[] {
  const keys: string[] = [];
  for (const node of nodes) {
    if (node.kind !== 'folder') {
      continue;
    }
    keys.push(node.id);
    if (node.id === 'reference-category:workspace') {
      for (const child of node.children ?? []) {
        if (child.kind === 'folder') {
          keys.push(child.id);
        }
      }
    }
  }
  return keys;
}

function findNode(nodes: INoteReferenceNode[], targetId: string): INoteReferenceNode | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return node;
    }
    const nested = node.children ? findNode(node.children, targetId) : null;
    if (nested) {
      return nested;
    }
  }
  return null;
}

function replaceNodeChildren(
  nodes: INoteReferenceNode[],
  targetId: string,
  children: INoteReferenceNode[],
): INoteReferenceNode[] {
  return nodes.map((node) => {
    if (node.id === targetId) {
      return { ...node, children };
    }
    if (!node.children) {
      return node;
    }
    return { ...node, children: replaceNodeChildren(node.children, targetId, children) };
  });
}

export function useNoteReferenceTrigger(options: IUseNoteReferenceTriggerOptions) {
  const { value, onChange, noteReferences, selectionStart, onSelectionChange } = options;

  const [open, setOpen] = useState(false);
  const [tree, setTree] = useState<INoteReferenceNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFolderIds, setLoadingFolderIds] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [replaceTarget, setReplaceTarget] = useState<INoteMentionMatch | null>(null);
  const [panelDismissed, setPanelDismissed] = useState(false);
  const atContextRef = useRef<IAtQueryContext | null>(null);
  const replaceTargetRef = useRef<INoteMentionMatch | null>(null);
  const requestIdRef = useRef(0);
  const folderRequestsRef = useRef(new Map<string, Promise<void>>());
  const previousQueryRef = useRef('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const prevValueLengthRef = useRef(value.length);

  const isEnabled = Boolean(noteReferences);
  const isReplaceMode = replaceTarget !== null;

  const atContext = useMemo(
    () => (isEnabled && !isReplaceMode ? extractAtQuery(value, selectionStart) : null),
    [isEnabled, isReplaceMode, value, selectionStart],
  );

  const menuVisible = (Boolean(atContext) || isReplaceMode) && !panelDismissed;

  const filteredTree = useMemo(() => {
    if (isReplaceMode) {
      return tree;
    }
    return atContext ? filterTree(tree, atContext.query) : [];
  }, [atContext, isReplaceMode, tree]);
  const activeQuery = isReplaceMode ? '' : (atContext?.query.trim() ?? '');

  const selectableIds = useMemo(() => collectSelectableFileIds(filteredTree), [filteredTree]);

  const loadTree = useCallback(async () => {
    if (!noteReferences) {
      setTree([]);
      setExpandedKeys([]);
      return;
    }
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    try {
      const nodes = await noteReferences.listTree();
      if (requestIdRef.current !== requestId) {
        return;
      }
      const nextTree = Array.isArray(nodes) ? nodes : [];
      setTree(nextTree);
      setExpandedKeys(collectInitialExpandedKeys(nextTree));
      folderRequestsRef.current.clear();
      setLoadingFolderIds([]);
    } catch {
      if (requestIdRef.current !== requestId) {
        return;
      }
      setTree([]);
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [noteReferences]);

  useEffect(() => {
    replaceTargetRef.current = replaceTarget;
  }, [replaceTarget]);

  useEffect(() => {
    if (!atContext && !isReplaceMode) {
      setPanelDismissed(false);
    }
  }, [atContext, isReplaceMode]);

  useEffect(() => {
    if (!menuVisible) {
      setOpen(false);
      atContextRef.current = null;
      previousQueryRef.current = '';
      return;
    }
    setOpen(true);
    setSelectedIndex(0);
    void loadTree();
  }, [loadTree, menuVisible]);

  useEffect(() => {
    if (menuVisible) {
      atContextRef.current = atContext;
    }
  }, [atContext, menuVisible]);

  useEffect(() => {
    if (!menuVisible || loading) {
      return;
    }
    const previousQuery = previousQueryRef.current;
    previousQueryRef.current = activeQuery;
    if (activeQuery) {
      setExpandedKeys(collectFolderIds(filteredTree));
    } else if (previousQuery) {
      setExpandedKeys(collectInitialExpandedKeys(tree));
    }
  }, [activeQuery, filteredTree, loading, menuVisible, tree]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setReplaceTarget(null);
    replaceTargetRef.current = null;
  }, []);

  useEffect(() => {
    if (menuVisible && value.length < prevValueLengthRef.current) {
      setPanelDismissed(true);
      closeMenu();
    }
    prevValueLengthRef.current = value.length;
  }, [closeMenu, menuVisible, value]);

  useEffect(() => {
    if (!open || !menuVisible) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target)) {
        return;
      }
      closeMenu();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [closeMenu, menuVisible, open]);

  const openReplaceMenu = useCallback(
    (cursorPos: number) => {
      const mention = findMentionAtCursor(value, cursorPos);
      if (!mention) {
        return;
      }
      setReplaceTarget(mention);
      replaceTargetRef.current = mention;
      setPanelDismissed(false);
      setOpen(true);
    },
    [value],
  );

  const applySelection = useCallback(
    (node: INoteReferenceNode) => {
      if (node.kind !== 'file') {
        return;
      }

      const replacing = replaceTargetRef.current;
      if (replacing) {
        const nextValue = replaceMentionToken(value, replacing, node.id);
        onChange(nextValue);
        const nextCursor = replacing.start + buildNoteMentionToken(node.id).length;
        onSelectionChange?.(nextCursor);
        closeMenu();
        return;
      }

      const ctx = atContextRef.current;
      if (!ctx) {
        return;
      }
      const nextValue = replaceAtQueryWithMention(value, ctx.atIndex, selectionStart, node.id);
      onChange(nextValue);
      const nextCursor = ctx.atIndex + `${buildNoteMentionToken(node.id)} `.length;
      onSelectionChange?.(nextCursor);
      closeMenu();
    },
    [closeMenu, onChange, onSelectionChange, selectionStart, value],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!open || selectableIds.length === 0) {
        return false;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % selectableIds.length);
        return true;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + selectableIds.length) % selectableIds.length);
        return true;
      }
      if ((event.key === 'Enter' && !event.shiftKey) || event.key === 'Tab') {
        event.preventDefault();
        const targetId = selectableIds[selectedIndex];
        const flat = flattenNoteFiles(filteredTree);
        const node = flat.find((item) => item.id === targetId);
        if (node) {
          applySelection({ id: node.id, name: node.name, kind: 'file' });
        }
        return true;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return true;
      }
      return false;
    },
    [applySelection, closeMenu, filteredTree, open, selectableIds, selectedIndex],
  );

  const handleSelectFile = useCallback(
    (node: INoteReferenceNode) => {
      applySelection(node);
    },
    [applySelection],
  );

  const loadFolderChildren = useCallback(
    (folderId: string): Promise<void> => {
      if (!noteReferences?.loadChildren) {
        return Promise.resolve();
      }
      const folder = findNode(tree, folderId);
      if (!folder || folder.kind !== 'folder' || folder.children !== undefined) {
        return Promise.resolve();
      }
      const existingRequest = folderRequestsRef.current.get(folderId);
      if (existingRequest) {
        return existingRequest;
      }

      const treeRequestId = requestIdRef.current;
      setLoadingFolderIds((current) => [...new Set([...current, folderId])]);
      const request = noteReferences
        .loadChildren(folder)
        .then((children) => {
          if (requestIdRef.current === treeRequestId) {
            setTree((current) =>
              replaceNodeChildren(current, folderId, Array.isArray(children) ? children : []),
            );
          }
        })
        .catch(() => {
          if (requestIdRef.current === treeRequestId) {
            setTree((current) => replaceNodeChildren(current, folderId, []));
          }
        })
        .finally(() => {
          folderRequestsRef.current.delete(folderId);
          setLoadingFolderIds((current) => current.filter((id) => id !== folderId));
        });
      folderRequestsRef.current.set(folderId, request);
      return request;
    },
    [noteReferences, tree],
  );

  const toggleFolder = useCallback(
    (folderId: string) => {
      if (expandedKeys.includes(folderId)) {
        setExpandedKeys((current) => current.filter((id) => id !== folderId));
        return;
      }
      setExpandedKeys((current) => [...current, folderId]);
      void loadFolderChildren(folderId);
    },
    [expandedKeys, loadFolderChildren],
  );

  return {
    open: open && menuVisible,
    tree: filteredTree,
    loading,
    loadingFolderIds,
    selectedFileId: selectableIds[selectedIndex],
    expandedKeys,
    popoverRef,
    toggleFolder,
    handleKeyDown,
    handleSelectFile,
    openReplaceMenu,
    close: closeMenu,
  };
}
