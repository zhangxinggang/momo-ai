import { validateToolIdentifier } from '@/shared/custom-tool-plugin';
import { ApiOutlined, IeOutlined, LayoutOutlined, LoadingOutlined } from '@ant-design/icons';
import {
  MomoTree,
  countNonFolderDescendants,
  type IMomoTreeAdapter,
  type IMomoTreeNode,
} from '@momo/tree';
import { useConfirmLeaveAiChat } from '@renderer/hooks/useConfirmLeaveAiChat';
import { useSidebarTreeOrder } from '@renderer/hooks/useSidebarOrder';
import {
  checkCustomToolIdentifier,
  openCustomToolDirectory,
  readCustomTool,
  saveCustomTool,
} from '@renderer/services/custom-tool/api';
import { useCustomToolStore, useUIStore } from '@renderer/store';
import { App, Input, Modal, Radio } from 'antd';
import { useCallback, useMemo, useState } from 'react';

type ECreateToolType = 'view' | 'ai' | 'web';

function validateWebUrl(value: string): string | null {
  const url = value.trim();
  if (!url) return '请输入网页地址';
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '网页地址仅支持 http:// 或 https://';
    }
  } catch {
    return '请输入有效的网页地址';
  }
  return null;
}

/** 自定义工具树（对齐笔记树交互） */
export function CustomToolTreePanel() {
  const { message } = App.useApp();
  const [createToolType, setCreateToolType] = useState<ECreateToolType>('view');
  const [createIdentifier, setCreateIdentifier] = useState('');
  const [createWebUrl, setCreateWebUrl] = useState('');
  const [editingWebToolId, setEditingWebToolId] = useState<string | null>(null);
  const [editingWebUrl, setEditingWebUrl] = useState('');
  const [isSavingWebUrl, setIsSavingWebUrl] = useState(false);
  const confirmLeaveAiChat = useConfirmLeaveAiChat();
  const treeData = useCustomToolStore((state) => state.treeData);
  const rawTree = useCustomToolStore((state) => state.rawTree);
  const ordering = useSidebarTreeOrder('custom-tools', treeData, rawTree);
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
  const generationTasks = useCustomToolStore((state) => state.generationTasks);
  const setActiveToolboxToolKey = useUIStore((state) => state.setActiveToolboxToolKey);

  const clearSystemSelection = useCallback(() => {
    setActiveToolboxToolKey('');
  }, [setActiveToolboxToolKey]);

  const confirmCurrentToolLeave = useCallback(
    (nextId: string) => {
      if (!selectedId || selectedId === nextId) {
        return Promise.resolve(true);
      }
      return confirmLeaveAiChat({
        scope: 'toolbox',
        isGenerating: generationTasks[selectedId]?.status === 'generating',
      });
    },
    [confirmLeaveAiChat, generationTasks, selectedId],
  );

  const renderNodeExtra = useCallback(
    (node: IMomoTreeNode) =>
      generationTasks[node.id]?.status === 'generating' ? (
        <LoadingOutlined spin title='正在生成' aria-label='正在生成' />
      ) : null,
    [generationTasks],
  );

  const adapter = useMemo<IMomoTreeAdapter>(
    () => ({
      onCreateFolder: (parentId, name) => createFolder(parentId, name),
      onCreateNote: async (parentId, name) => {
        if (createToolType === 'ai') await checkCustomToolIdentifier(createIdentifier.trim());
        await createTool(
          parentId,
          name,
          createToolType === 'web'
            ? { kind: 'web', url: createWebUrl.trim() }
            : createToolType === 'ai'
              ? { kind: 'plugin', identifier: createIdentifier.trim() }
              : { kind: 'openui' },
        );
        clearSystemSelection();
      },
      onRename: (nodeId, newName) => renameNode(nodeId, newName),
      onDelete: (nodeId) => deleteNode(nodeId),
      onMove: (nodeId, targetParentId) => moveNode(nodeId, targetParentId),
      onOpenInFileSystem: (nodeId) => openCustomToolDirectory(nodeId),
      onEdit: async (nodeId) => {
        const tool = await readCustomTool(nodeId);
        if (tool.kind === 'web') {
          setEditingWebToolId(nodeId);
          setEditingWebUrl(tool.content);
          return;
        }
        if (!(await confirmCurrentToolLeave(nodeId))) {
          return;
        }
        clearSystemSelection();
        await selectFile(nodeId);
        enterEditMode();
      },
      countNonFolderDescendants: (folderId) => countNonFolderDescendants(treeData, folderId),
    }),
    [
      clearSystemSelection,
      confirmCurrentToolLeave,
      createFolder,
      createTool,
      createToolType,
      createIdentifier,
      createWebUrl,
      deleteNode,
      enterEditMode,
      moveNode,
      renameNode,
      selectFile,
      treeData,
    ],
  );

  const saveWebUrl = useCallback(async () => {
    if (!editingWebToolId) return;
    const validationMessage = validateWebUrl(editingWebUrl);
    if (validationMessage) {
      message.warning(validationMessage);
      return;
    }
    setIsSavingWebUrl(true);
    try {
      const current = await readCustomTool(editingWebToolId);
      await saveCustomTool(editingWebToolId, { ...current, content: editingWebUrl.trim() });
      await useCustomToolStore.getState().loadTree();
      if (selectedId === editingWebToolId) {
        await selectFile(editingWebToolId);
      }
      setEditingWebToolId(null);
      message.success('网页地址已更新');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '网页地址保存失败');
    } finally {
      setIsSavingWebUrl(false);
    }
  }, [editingWebToolId, editingWebUrl, message, selectFile, selectedId]);

  return (
    <>
      <MomoTree
        {...ordering}
        selectedId={selectedId}
        expandedKeys={expandedKeys}
        onExpandedChange={setExpandedKeys}
        onSelectFolder={selectFolder}
        onSelectFile={(fileId) => {
          void (async () => {
            if (!(await confirmCurrentToolLeave(fileId))) {
              return;
            }
            clearSystemSelection();
            await selectFile(fileId);
          })();
        }}
        adapter={adapter}
        createNoteExtra={
          <>
            <Radio.Group
              value={createToolType}
              onChange={(event) => setCreateToolType(event.target.value as ECreateToolType)}>
              <Radio value='view'>
                <LayoutOutlined /> 界面显示
              </Radio>
              <Radio value='ai'>
                <ApiOutlined /> AI 工具
              </Radio>
              <Radio value='web'>
                <IeOutlined /> 网页
              </Radio>
            </Radio.Group>
            <p style={{ color: 'var(--ant-color-text-secondary)', margin: '8px 0' }}>
              {createToolType === 'view'
                ? 'AI 生成需求界面'
                : createToolType === 'ai'
                  ? '工具将会录入系统，供后续 AI 对话调用'
                  : '网页快捷入口记录'}
            </p>
            {createToolType === 'ai' ? (
              <div>
                <label htmlFor='custom-tool-identifier'>工具标识</label>
                <Input
                  id='custom-tool-identifier'
                  value={createIdentifier}
                  maxLength={64}
                  placeholder='例如 text-analyzer（全局唯一）'
                  onChange={(event) => setCreateIdentifier(event.target.value)}
                />
                <small>英文字母开头，仅支持英文字母、下划线和连字符，创建后不可更改。</small>
              </div>
            ) : null}
            {createToolType === 'web' ? (
              <Input
                value={createWebUrl}
                placeholder='请输入网页地址，例如 https://example.com'
                onChange={(event) => setCreateWebUrl(event.target.value)}
              />
            ) : null}
          </>
        }
        validateCreateNote={() =>
          createToolType === 'web'
            ? validateWebUrl(createWebUrl)
            : createToolType === 'ai'
              ? validateToolIdentifier(createIdentifier.trim())
              : null
        }
        onCreateNoteDialogOpenChange={(open) => {
          if (open) {
            setCreateToolType('view');
            setCreateIdentifier('');
            setCreateWebUrl('');
          }
        }}
        labels={{
          createFolder: '新增目录',
          createNote: '新增工具',
          openInFileSystem: '在文件系统打开',
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
        renderNodeExtra={renderNodeExtra}
        renderNodeIcon={(node) =>
          node.webUrl ? (
            <IeOutlined className='text-base' />
          ) : node.toolIdentifier ? (
            <ApiOutlined className='text-base' />
          ) : null
        }
      />
      <Modal
        title='编辑网页工具'
        open={editingWebToolId !== null}
        confirmLoading={isSavingWebUrl}
        okText='保存'
        cancelText='取消'
        onOk={() => void saveWebUrl()}
        onCancel={() => setEditingWebToolId(null)}
        destroyOnHidden>
        <Input
          value={editingWebUrl}
          placeholder='请输入网页地址，例如 https://example.com'
          onChange={(event) => setEditingWebUrl(event.target.value)}
          onPressEnter={() => void saveWebUrl()}
        />
      </Modal>
    </>
  );
}
