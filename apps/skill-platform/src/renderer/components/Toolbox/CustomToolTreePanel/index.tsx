import { MomoTree, countNonFolderDescendants, type IMomoTreeAdapter } from '@momo/tree';
import { useCustomToolStore, useUIStore } from '@renderer/store';
import { useCallback, useMemo } from 'react';

/** 自定义工具树（对齐笔记树交互） */
export function CustomToolTreePanel() {
  const treeData = useCustomToolStore((state) => state.treeData);
  const treeSearchQuery = useCustomToolStore((state) => state.treeSearchQuery);
  const selectedId = useCustomToolStore((state) => state.selectedId);
  const expandedKeys = useCustomToolStore((state) => state.expandedKeys);
  const setExpandedKeys = useCustomToolStore((state) => state.setExpandedKeys);
  const selectFolder = useCustomToolStore((state) => state.selectFolder);
  const selectFile = useCustomToolStore((state) => state.selectFile);
  const createFolder = useCustomToolStore((state) => state.createFolder);
  const createTool = useCustomToolStore((state) => state.createTool);
  const renameNode = useCustomToolStore((state) => state.renameNode);
  const deleteNode = useCustomToolStore((state) => state.deleteNode);
  const moveNode = useCustomToolStore((state) => state.moveNode);
  const enterEditMode = useCustomToolStore((state) => state.enterEditMode);
  const setActiveToolboxToolKey = useUIStore((state) => state.setActiveToolboxToolKey);

  const clearSystemSelection = useCallback(() => {
    setActiveToolboxToolKey('');
  }, [setActiveToolboxToolKey]);

  const adapter = useMemo<IMomoTreeAdapter>(
    () => ({
      onCreateFolder: (parentId, name) => createFolder(parentId, name),
      onCreateNote: (parentId, name) => createTool(parentId, name),
      onRename: (nodeId, newName) => renameNode(nodeId, newName),
      onDelete: (nodeId) => deleteNode(nodeId),
      onMove: (nodeId, targetParentId) => moveNode(nodeId, targetParentId),
      onEdit: async (nodeId) => {
        clearSystemSelection();
        await selectFile(nodeId);
        enterEditMode();
      },
      countNonFolderDescendants: (folderId) => countNonFolderDescendants(treeData, folderId),
    }),
    [
      clearSystemSelection,
      createFolder,
      createTool,
      deleteNode,
      enterEditMode,
      moveNode,
      renameNode,
      selectFile,
      treeData,
    ],
  );

  return (
    <MomoTree
      treeData={treeData}
      selectedId={selectedId}
      expandedKeys={expandedKeys}
      onExpandedChange={setExpandedKeys}
      onSelectFolder={selectFolder}
      onSelectFile={(fileId) => {
        clearSystemSelection();
        void selectFile(fileId);
      }}
      adapter={adapter}
      labels={{
        createFolder: '新增目录',
        createNote: '新增工具',
        edit: '编辑',
        move: '移动',
        delete: '删除',
        rename: '重命名',
        deleteConfirmTitle: '确认删除',
        deleteFolderTypedConfirmWord: '删除',
        deleteFolderTypedConfirmHint: '目录下存在工具或子目录内容，请输入「删除」以确认删除',
        deleteConfirmContent: '删除后无法恢复，确定继续吗？',
        renameTitle: '重命名',
        renamePlaceholder: '请输入新名称',
        moveTitle: '移动到',
        movePlaceholder: '选择目标文件夹',
        confirm: '确定',
        cancel: '取消',
        createFolderTitle: '新增目录',
        createNoteTitle: '新增工具',
        createNamePlaceholder: '请输入名称',
        duplicateNameError: '同级下已存在相同名称',
        emptyNameError: '名称不能为空',
      }}
      rootLabel='根目录'
      searchQuery={treeSearchQuery}
      emptyDescription='暂无自定义工具，请新建目录或工具'
    />
  );
}
