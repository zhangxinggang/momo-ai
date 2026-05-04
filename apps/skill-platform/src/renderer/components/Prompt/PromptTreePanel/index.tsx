import {
  MomoTree,
  countNonFolderDescendants,
  findTreeNode,
  type IMomoTreeAdapter,
} from '@momo/tree';
import { buildPromptTree } from '@renderer/services/prompt/tree';
import { useFolderStore, usePromptStore } from '@renderer/store';
import { getAllDescendantIds, getFolderDepth } from '@renderer/utils/folder/tree';
import { useCallback, useMemo } from 'react';
export function PromptTreePanel() {
  const treeData = usePromptStore((state) => state.treeData);
  const treeSearchQuery = usePromptStore((state) => state.treeSearchQuery);
  const folders = useFolderStore((state) => state.folders);
  const prompts = usePromptStore((state) => state.prompts);
  const selectedId = usePromptStore((state) => state.selectedId);
  const expandedKeys = usePromptStore((state) => state.expandedKeys);
  const setExpandedKeys = usePromptStore((state) => state.setExpandedKeys);
  const openEditEditor = usePromptStore((state) => state.openEditEditor);
  const createPrompt = usePromptStore((state) => state.createPrompt);
  const updatePrompt = usePromptStore((state) => state.updatePrompt);
  const deletePrompt = usePromptStore((state) => state.deletePrompt);
  const duplicatePrompt = usePromptStore((state) => state.duplicatePrompt);
  const refreshTree = usePromptStore((state) => state.refreshTree);
  const createFolder = useFolderStore((state) => state.createFolder);
  const updateFolder = useFolderStore((state) => state.updateFolder);
  const deleteFolder = useFolderStore((state) => state.deleteFolder);
  const moveFolder = useFolderStore((state) => state.moveFolder);
  const fetchFolders = useFolderStore((state) => state.fetchFolders);
  const fetchPrompts = usePromptStore((state) => state.fetchPrompts);

  const moveTreeData = useMemo(() => buildPromptTree(folders, prompts), [folders, prompts]);

  const findNode = useCallback((nodeId: string) => findTreeNode(treeData, nodeId), [treeData]);

  const adapter = useMemo<IMomoTreeAdapter>(
    () => ({
      onCreateFolder: async (parentId, name) => {
        await createFolder({
          name,
          parentId: parentId ?? undefined,
        });
        refreshTree();
      },
      onCreateNote: async (parentId, name) => {
        const created = await createPrompt({
          title: name,
          userPrompt: '',
          tags: [],
          folderId: parentId ?? undefined,
        });
        openEditEditor(created.id);
        refreshTree();
      },
      onRename: async (nodeId, newName) => {
        const node = findNode(nodeId);
        if (!node) {
          return;
        }
        if (node.kind === 'folder') {
          await updateFolder(nodeId, { name: newName });
        } else {
          await updatePrompt(nodeId, { title: newName });
        }
        refreshTree();
      },
      onDelete: async (nodeId) => {
        const node = findNode(nodeId);
        if (!node) {
          return;
        }
        if (node.kind === 'folder') {
          const currentFolders = useFolderStore.getState().folders;
          const currentPrompts = usePromptStore.getState().prompts;
          const descendantFolderIds = getAllDescendantIds(currentFolders, nodeId);
          const folderIdsToDelete = new Set([nodeId, ...descendantFolderIds]);
          const promptsToDelete = currentPrompts.filter(
            (prompt) => prompt.folderId && folderIdsToDelete.has(prompt.folderId),
          );

          for (const prompt of promptsToDelete) {
            await deletePrompt(prompt.id);
          }

          const sortedFolderIds = [...folderIdsToDelete].sort(
            (left, right) => getFolderDepth(currentFolders, right) - getFolderDepth(currentFolders, left),
          );
          for (const folderId of sortedFolderIds) {
            await deleteFolder(folderId);
          }

          await fetchFolders();
          await fetchPrompts();
        } else {
          await deletePrompt(nodeId);
        }
        refreshTree();
      },
      onMove: async (nodeId, targetParentId) => {
        const node = findNode(nodeId);
        if (!node) {
          return;
        }
        if (node.kind === 'folder') {
          const currentFolders = useFolderStore.getState().folders;
          const siblings = currentFolders.filter((f) => (f.parentId ?? null) === targetParentId);
          await moveFolder(nodeId, targetParentId, siblings.length);
        } else {
          await updatePrompt(nodeId, { folderId: targetParentId ?? undefined });
        }
        if (targetParentId) {
          const expandedKeys = usePromptStore.getState().expandedKeys;
          if (!expandedKeys.includes(targetParentId)) {
            usePromptStore.getState().setExpandedKeys([...expandedKeys, targetParentId]);
          }
        }
        refreshTree();
      },
      onCopy: async (nodeId) => {
        const node = findNode(nodeId);
        if (node?.kind === 'file') {
          await duplicatePrompt(nodeId);
        }
      },
      countNonFolderDescendants: (folderId) =>
        countNonFolderDescendants(moveTreeData, folderId),
    }),
    [
      createFolder,
      createPrompt,
      deleteFolder,
      deletePrompt,
      duplicatePrompt,
      fetchFolders,
      fetchPrompts,
      findNode,
      moveFolder,
      moveTreeData,
      openEditEditor,
      refreshTree,
      updateFolder,
      updatePrompt,
    ],
  );

  const handleSelectFolder = useCallback(
    (folderId: string) => {
      const keys = expandedKeys.includes(folderId)
        ? expandedKeys.filter((id) => id !== folderId)
        : [...expandedKeys, folderId];
      setExpandedKeys(keys);
    },
    [expandedKeys, setExpandedKeys],
  );

  const handleSelectFile = useCallback(
    (fileId: string) => {
      openEditEditor(fileId);
    },
    [openEditEditor],
  );

  return (
    <MomoTree
      treeData={treeData}
      moveTreeData={moveTreeData}
      selectedId={selectedId}
      expandedKeys={expandedKeys}
      onExpandedChange={setExpandedKeys}
      onSelectFolder={handleSelectFolder}
      onSelectFile={handleSelectFile}
      adapter={adapter}
      labels={{
        createFolder: '新建目录',
        createNote: '新建提示词',
        copy: '复制',
        move: '移动',
        delete: '删除',
        rename: '重命名',
        deleteConfirmTitle: '确认删除',
        deleteConfirmContent: '删除后无法恢复，确定继续吗？',
        deleteFolderTypedConfirmWord: '删除',
        deleteFolderTypedConfirmHint: '目录下存在提示词或子目录内容，请输入「删除」以确认删除',
        renameTitle: '重命名',
        renamePlaceholder: '请输入新名称',
        moveTitle: '移动到',
        movePlaceholder: '选择目标目录',
        confirm: '确定',
        cancel: '取消',
        createFolderTitle: '新建目录',
        createNoteTitle: '新建提示词',
        createNamePlaceholder: '请输入名称',
        duplicateNameError: '同级下已存在相同名称',
        emptyNameError: '名称不能为空',
      }}
      rootLabel='根目录'
      searchQuery={treeSearchQuery}
      emptyDescription='暂无提示词，请新建目录或提示词'
    />
  );
}
