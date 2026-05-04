import { MomoTree, countNonFolderDescendants, type IMomoTreeAdapter } from '@momo/tree';
import { useNoteStore } from '@renderer/store';
import { useMemo } from 'react';

export function NoteTreePanel() {
  const treeData = useNoteStore((state) => state.treeData);
  const treeSearchQuery = useNoteStore((state) => state.treeSearchQuery);
  const selectedId = useNoteStore((state) => state.selectedId);
  const expandedKeys = useNoteStore((state) => state.expandedKeys);
  const setExpandedKeys = useNoteStore((state) => state.setExpandedKeys);
  const selectFolder = useNoteStore((state) => state.selectFolder);
  const selectFile = useNoteStore((state) => state.selectFile);
  const createFolder = useNoteStore((state) => state.createFolder);
  const createNote = useNoteStore((state) => state.createNote);
  const renameNode = useNoteStore((state) => state.renameNode);
  const deleteNode = useNoteStore((state) => state.deleteNode);
  const moveNode = useNoteStore((state) => state.moveNode);
  const copyFile = useNoteStore((state) => state.copyFile);

  const adapter = useMemo<IMomoTreeAdapter>(
    () => ({
      onCreateFolder: (parentId, name) => createFolder(parentId, name),
      onCreateNote: (parentId, name) => createNote(parentId, name),
      onRename: (nodeId, newName) => renameNode(nodeId, newName),
      onDelete: (nodeId) => deleteNode(nodeId),
      onMove: (nodeId, targetParentId) => moveNode(nodeId, targetParentId),
      onCopy: (nodeId) => copyFile(nodeId),
      countNonFolderDescendants: (folderId) => countNonFolderDescendants(treeData, folderId),
    }),
    [copyFile, createFolder, createNote, deleteNode, moveNode, renameNode, treeData],
  );

  return (
    <MomoTree
      treeData={treeData}
      selectedId={selectedId}
      expandedKeys={expandedKeys}
      onExpandedChange={setExpandedKeys}
      onSelectFolder={selectFolder}
      onSelectFile={(fileId) => void selectFile(fileId)}
      adapter={adapter}
      labels={{
        createFolder: '新增目录',
        createNote: '新增笔记',
        move: '移动',
        delete: '删除',
        rename: '重命名',
        copy: '复制',
        deleteConfirmTitle: '确认删除',
        deleteFolderTypedConfirmWord: '删除',
        deleteFolderTypedConfirmHint: '目录下存在笔记或子目录内容，请输入「删除」以确认删除',
        deleteConfirmContent: '删除后无法恢复，确定继续吗？',
        renameTitle: '重命名',
        renamePlaceholder: '请输入新名称',
        moveTitle: '移动到',
        movePlaceholder: '选择目标文件夹',
        confirm: '确定',
        cancel: '取消',
        createFolderTitle: '新增目录',
        createNoteTitle: '新增笔记',
        createNamePlaceholder: '请输入名称',
        duplicateNameError: '同级下已存在相同名称',
        emptyNameError: '名称不能为空',
      }}
      rootLabel='根目录'
      searchQuery={treeSearchQuery}
      emptyDescription='暂无笔记，请新建目录或笔记'
    />
  );
}
