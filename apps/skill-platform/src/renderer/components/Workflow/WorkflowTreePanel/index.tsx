import {
  MomoTree,
  countNonFolderDescendants,
  findTreeNode,
  type IMomoTreeAdapter,
} from '@momo/tree';
import { useCallback, useEffect, useMemo } from 'react';

import { renameWorkflowAgentDir } from '@renderer/services/workflow/agent-files';
import { deleteWorkflowWithCleanup } from '@renderer/services/workflow/delete-workflow';
import { buildWorkflowTree, toFolderLikeList } from '@renderer/services/workflow/tree';
import { useUIStore, useWorkflowStore } from '@renderer/store';
import { getAllDescendantIds, getFolderDepth } from '@renderer/utils/folder/tree';

/** 工作流侧栏树：目录 + 工作流，交互对齐提示词模块 */
export function WorkflowTreePanel() {
  const treeData = useWorkflowStore((state) => state.treeData);
  const treeSearchQuery = useWorkflowStore((state) => state.treeSearchQuery);
  const folders = useWorkflowStore((state) => state.folders);
  const workflows = useWorkflowStore((state) => state.workflows);
  const selectedWorkflowId = useWorkflowStore((state) => state.selectedWorkflowId);
  const expandedKeys = useWorkflowStore((state) => state.expandedKeys);
  const setExpandedKeys = useWorkflowStore((state) => state.setExpandedKeys);
  const fetchWorkflows = useWorkflowStore((state) => state.fetchWorkflows);
  const fetchFolders = useWorkflowStore((state) => state.fetchFolders);
  const refreshTree = useWorkflowStore((state) => state.refreshTree);
  const selectWorkflow = useWorkflowStore((state) => state.selectWorkflow);
  const createFolder = useWorkflowStore((state) => state.createFolder);
  const updateFolder = useWorkflowStore((state) => state.updateFolder);
  const deleteFolder = useWorkflowStore((state) => state.deleteFolder);
  const moveFolder = useWorkflowStore((state) => state.moveFolder);
  const createWorkflowAndOpenStudio = useWorkflowStore(
    (state) => state.createWorkflowAndOpenStudio,
  );
  const updateWorkflow = useWorkflowStore((state) => state.updateWorkflow);
  const duplicateWorkflow = useWorkflowStore((state) => state.duplicateWorkflow);
  const openWorkflowStudio = useUIStore((state) => state.openWorkflowStudio);

  useEffect(() => {
    void fetchFolders();
    void fetchWorkflows();
  }, [fetchFolders, fetchWorkflows]);

  const moveTreeData = useMemo(() => buildWorkflowTree(folders, workflows), [folders, workflows]);

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
        await createWorkflowAndOpenStudio(name, parentId ?? undefined);
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
          const workflow = useWorkflowStore.getState().workflows.find((item) => item.id === nodeId);
          if (!workflow) {
            return;
          }
          const trimmed = newName.trim();
          if (workflow.name !== trimmed) {
            await updateWorkflow(nodeId, { name: trimmed });
            if (workflow.name.trim()) {
              await renameWorkflowAgentDir(workflow.name, trimmed);
            }
          }
        }
        refreshTree();
      },
      onDelete: async (nodeId) => {
        const node = findNode(nodeId);
        if (!node) {
          return;
        }
        if (node.kind === 'folder') {
          const currentFolders = useWorkflowStore.getState().folders;
          const currentWorkflows = useWorkflowStore.getState().workflows;
          const folderLikeList = toFolderLikeList(currentFolders);
          const descendantFolderIds = getAllDescendantIds(folderLikeList, nodeId);
          const folderIdsToDelete = new Set([nodeId, ...descendantFolderIds]);
          const workflowsToDelete = currentWorkflows.filter(
            (workflow) => workflow.folderId && folderIdsToDelete.has(workflow.folderId),
          );

          for (const workflow of workflowsToDelete) {
            await deleteWorkflowWithCleanup(workflow);
          }
          if (
            selectedWorkflowId &&
            workflowsToDelete.some((item) => item.id === selectedWorkflowId)
          ) {
            selectWorkflow(null);
          }

          const sortedFolderIds = [...folderIdsToDelete].sort(
            (left, right) =>
              getFolderDepth(folderLikeList, right) - getFolderDepth(folderLikeList, left),
          );
          for (const folderId of sortedFolderIds) {
            await deleteFolder(folderId);
          }

          await fetchFolders();
          await fetchWorkflows();
        } else {
          const workflow = useWorkflowStore.getState().workflows.find((item) => item.id === nodeId);
          if (!workflow) {
            return;
          }
          await deleteWorkflowWithCleanup(workflow);
          if (selectedWorkflowId === nodeId) {
            selectWorkflow(null);
          }
          await fetchWorkflows();
        }
        refreshTree();
      },
      onMove: async (nodeId, targetParentId) => {
        const node = findNode(nodeId);
        if (!node) {
          return;
        }
        if (node.kind === 'folder') {
          const currentFolders = useWorkflowStore.getState().folders;
          const siblings = currentFolders.filter(
            (folder) => (folder.parentId ?? null) === targetParentId,
          );
          await moveFolder(nodeId, targetParentId, siblings.length);
        } else {
          await updateWorkflow(nodeId, { folderId: targetParentId ?? null });
        }
        if (targetParentId) {
          const keys = useWorkflowStore.getState().expandedKeys;
          if (!keys.includes(targetParentId)) {
            useWorkflowStore.getState().setExpandedKeys([...keys, targetParentId]);
          }
        }
        refreshTree();
      },
      onEdit: async (nodeId) => {
        openWorkflowStudio(nodeId);
      },
      onCopy: async (nodeId) => {
        await duplicateWorkflow(nodeId);
        refreshTree();
      },
      countNonFolderDescendants: (folderId) => countNonFolderDescendants(moveTreeData, folderId),
    }),
    [
      createFolder,
      createWorkflowAndOpenStudio,
      deleteFolder,
      duplicateWorkflow,
      fetchFolders,
      fetchWorkflows,
      findNode,
      moveFolder,
      moveTreeData,
      openWorkflowStudio,
      refreshTree,
      selectWorkflow,
      selectedWorkflowId,
      updateFolder,
      updateWorkflow,
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
    (workflowId: string) => {
      selectWorkflow(workflowId);
      useUIStore.getState().closeWorkflowBusinessWork();
    },
    [selectWorkflow],
  );

  if (!window.api?.workflow) {
    return null;
  }

  return (
    <MomoTree
      adapter={adapter}
      emptyDescription='暂无工作流，请新建目录或工作流'
      expandedKeys={expandedKeys}
      hideFileRename
      labels={{
        createFolder: '新建目录',
        createNote: '新建工作流',
        edit: '编辑',
        copy: '复制',
        move: '移动',
        delete: '删除',
        rename: '重命名',
        deleteConfirmTitle: '确认删除',
        deleteConfirmContent: '删除后无法恢复，确定继续吗？',
        deleteFolderTypedConfirmWord: '删除',
        deleteFolderTypedConfirmHint: '目录下存在工作流或子目录内容，请输入「删除」以确认删除',
        renameTitle: '重命名',
        renamePlaceholder: '请输入新名称',
        moveTitle: '移动到',
        movePlaceholder: '选择目标目录',
        confirm: '确定',
        cancel: '取消',
        createFolderTitle: '新建目录',
        createNoteTitle: '新建工作流',
        createNamePlaceholder: '请输入名称',
        duplicateNameError: '同级下已存在相同名称',
        emptyNameError: '名称不能为空',
      }}
      moveTreeData={moveTreeData}
      onExpandedChange={setExpandedKeys}
      onSelectFile={handleSelectFile}
      onSelectFolder={handleSelectFolder}
      rootLabel='根目录'
      searchQuery={treeSearchQuery}
      selectedId={selectedWorkflowId}
      treeData={treeData}
    />
  );
}
