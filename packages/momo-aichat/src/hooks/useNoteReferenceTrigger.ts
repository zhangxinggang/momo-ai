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

export function useNoteReferenceTrigger(options: IUseNoteReferenceTriggerOptions) {
  const { value, onChange, noteReferences, selectionStart, onSelectionChange } = options;

  const [open, setOpen] = useState(false);
  const [tree, setTree] = useState<INoteReferenceNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [replaceTarget, setReplaceTarget] = useState<INoteMentionMatch | null>(null);
  const [panelDismissed, setPanelDismissed] = useState(false);
  const atContextRef = useRef<IAtQueryContext | null>(null);
  const replaceTargetRef = useRef<INoteMentionMatch | null>(null);
  const requestIdRef = useRef(0);
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

  const selectableIds = useMemo(() => collectSelectableFileIds(filteredTree), [filteredTree]);

  const loadTree = useCallback(async () => {
    if (!noteReferences) {
      setTree([]);
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
      setTree(Array.isArray(nodes) ? nodes : []);
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
      return;
    }
    atContextRef.current = atContext;
    setOpen(true);
    setSelectedIndex(0);
    void loadTree();
  }, [menuVisible, atContext, loadTree]);

  useEffect(() => {
    if (!menuVisible) {
      return;
    }
    const collectFolderIds = (nodes: INoteReferenceNode[]): string[] =>
      nodes.flatMap((node) =>
        node.kind === 'folder'
          ? [node.id, ...(node.children ? collectFolderIds(node.children) : [])]
          : [],
      );
    setExpandedKeys(collectFolderIds(tree));
  }, [menuVisible, tree]);

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
      void loadTree();
    },
    [loadTree, value],
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

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedKeys((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId],
    );
  }, []);

  return {
    open: open && menuVisible,
    tree: filteredTree,
    loading,
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
