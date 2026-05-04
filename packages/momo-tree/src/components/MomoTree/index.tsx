import { MoreOutlined } from '@ant-design/icons';
import type { MenuProps, TreeDataNode } from 'antd';
import { App, Button, Dropdown, Empty, Input, Modal, Tree, TreeSelect } from 'antd';
import { FileTextIcon, FolderIcon } from 'lucide-react';
import type { ChangeEvent, Key, MouseEvent, ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type {
  EMomoTreeNodeKind,
  IMomoTreeAdapter,
  IMomoTreeLabels,
  IMomoTreeNode,
} from '../../types';
import { hasDuplicateSiblingName } from '../../utils/create-name';
import { renderHighlightedText } from '../../utils/highlight';
import { buildMoveTargetTreeData, findTreeNode } from '../../utils/tree';
import styles from './index.module.less';

const DEFAULT_LABELS: IMomoTreeLabels = {
  createFolder: 'New folder',
  createNote: 'New note',
  copy: 'Copy',
  move: 'Move',
  delete: 'Delete',
  rename: 'Rename',
  deleteConfirmTitle: 'Confirm delete',
  deleteConfirmContent: 'This cannot be undone. Continue?',
  renameTitle: 'Rename',
  renamePlaceholder: 'Enter a new name',
  moveTitle: 'Move to',
  movePlaceholder: 'Select target folder',
  confirm: 'OK',
  cancel: 'Cancel',
};

export interface IProps {
  treeData: IMomoTreeNode[];
  selectedId: string | null;
  expandedKeys: string[];
  onExpandedChange: (keys: string[]) => void;
  onSelectFolder: (nodeId: string) => void;
  onSelectFile: (nodeId: string) => void;
  adapter: IMomoTreeAdapter;
  labels?: Partial<IMomoTreeLabels>;
  rootId?: string;
  rootLabel?: string;
  /** 侧栏搜索关键词，匹配部分在节点标题红色高亮 */
  searchQuery?: string;
  /** 移动弹窗专用树数据（未过滤），不传则使用 treeData */
  moveTreeData?: IMomoTreeNode[];
  /** 树为空时的提示文案 */
  emptyDescription?: string;
  /** 树为空时的操作区（如新建按钮） */
  emptyAction?: ReactNode;
}

function mapToAntdNodes(nodes: IMomoTreeNode[]): TreeDataNode[] {
  return nodes.map((node) => ({
    key: node.id,
    isLeaf: node.kind === 'file',
    children: node.children?.length ? mapToAntdNodes(node.children) : undefined,
  }));
}

export function MomoTree({
  treeData,
  selectedId,
  expandedKeys,
  onExpandedChange,
  onSelectFolder,
  onSelectFile,
  adapter,
  labels: labelOverrides,
  rootId = '__root__',
  rootLabel = 'Root',
  searchQuery = '',
  moveTreeData,
  emptyDescription,
  emptyAction,
}: IProps) {
  const { modal, message } = App.useApp();
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const [openMenuNodeId, setOpenMenuNodeId] = useState<string | null>(null);
  const [renameNodeId, setRenameNodeId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [moveNodeId, setMoveNodeId] = useState<string | null>(null);
  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);
  const [createKind, setCreateKind] = useState<EMomoTreeNodeKind | null>(null);
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [createNameValue, setCreateNameValue] = useState('');

  const antdTreeData = useMemo(() => mapToAntdNodes(treeData), [treeData]);
  const selectedKeys = useMemo(() => (selectedId ? [selectedId] : []), [selectedId]);

  const nodeById = useCallback((nodeId: string) => findTreeNode(treeData, nodeId), [treeData]);

  const openCreateDialog = useCallback((kind: EMomoTreeNodeKind, parentId: string | null) => {
    setCreateKind(kind);
    setCreateParentId(parentId);
    setCreateNameValue('');
  }, []);

  const confirmDeleteNode = useCallback(
    (node: IMomoTreeNode) => {
      const runDelete = async () => {
        try {
          await adapter.onDelete(node.id);
        } catch (error) {
          message.error(error instanceof Error ? error.message : '删除失败');
          throw error;
        }
      };

      if (node.kind === 'folder') {
        const fileCount = adapter.countNonFolderDescendants?.(node.id) ?? 0;
        if (fileCount > 0) {
          const confirmWord = labels.deleteFolderTypedConfirmWord ?? '删除';
          let typedValue = '';
          modal.confirm({
            title: labels.deleteConfirmTitle,
            content: (
              <div className='space-y-2'>
                <div>
                  {labels.deleteFolderTypedConfirmHint ??
                    `目录下存在 ${fileCount} 条记录，请输入「${confirmWord}」以确认删除`}
                </div>
                <Input
                  placeholder={`请输入「${confirmWord}」`}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    typedValue = e.target.value;
                  }}
                />
              </div>
            ),
            okText: labels.confirm,
            cancelText: labels.cancel,
            okButtonProps: { danger: true },
            onOk: async () => {
              if (typedValue.trim() !== confirmWord) {
                message.error(`请输入「${confirmWord}」以确认删除`);
                return Promise.reject(new Error('confirm word mismatch'));
              }
              await runDelete();
            },
          });
          return;
        }
      }

      modal.confirm({
        title: labels.deleteConfirmTitle,
        content: labels.deleteConfirmContent,
        okText: labels.confirm,
        cancelText: labels.cancel,
        okButtonProps: { danger: true },
        onOk: runDelete,
      });
    },
    [adapter, labels, message, modal],
  );

  const buildFolderMenuItems = useCallback(
    (node: IMomoTreeNode): MenuProps['items'] => {
      const parentId = node.kind === 'folder' ? node.id : null;
      return [
        {
          key: 'create-folder',
          label: labels.createFolder,
          onClick: () => openCreateDialog('folder', parentId),
        },
        {
          key: 'create-note',
          label: labels.createNote,
          onClick: () => openCreateDialog('file', parentId),
        },
        { type: 'divider' },
        {
          key: 'rename',
          label: labels.rename,
          onClick: () => {
            setRenameNodeId(node.id);
            setRenameValue(node.name);
          },
        },
        {
          key: 'move',
          label: labels.move,
          onClick: () => {
            setMoveNodeId(node.id);
            setMoveTargetId(rootId);
          },
        },
        {
          key: 'delete',
          label: labels.delete,
          danger: true,
          onClick: () => confirmDeleteNode(node),
        },
      ];
    },
    [confirmDeleteNode, labels, openCreateDialog, rootId],
  );

  const buildFileMenuItems = useCallback(
    (node: IMomoTreeNode): MenuProps['items'] => {
      const items: MenuProps['items'] = [
        {
          key: 'rename',
          label: labels.rename,
          onClick: () => {
            setRenameNodeId(node.id);
            setRenameValue(node.name.replace(/\.md$/i, ''));
          },
        },
      ];
      if (adapter.onCopy && labels.copy) {
        items.push({
          key: 'copy',
          label: labels.copy,
          onClick: () => void adapter.onCopy?.(node.id),
        });
      }
      items.push(
        {
          key: 'move',
          label: labels.move,
          onClick: () => {
            setMoveNodeId(node.id);
            setMoveTargetId(rootId);
          },
        },
        { type: 'divider' },
        {
          key: 'delete',
          label: labels.delete,
          danger: true,
          onClick: () => confirmDeleteNode(node),
        },
      );
      return items;
    },
    [adapter, confirmDeleteNode, labels, rootId],
  );

  const moveTargetTreeData = useMemo(() => {
    if (!moveNodeId) {
      return [];
    }
    const sourceTree = moveTreeData ?? treeData;
    return buildMoveTargetTreeData(sourceTree, moveNodeId, rootId, rootLabel);
  }, [moveNodeId, moveTreeData, rootId, rootLabel, treeData]);

  const titleRender = useCallback(
    (nodeData: TreeDataNode) => {
      const node = nodeById(String(nodeData.key));
      if (!node) {
        return null;
      }

      const menuItems =
        node.kind === 'folder' ? buildFolderMenuItems(node) : buildFileMenuItems(node);
      const isMenuOpen = openMenuNodeId === node.id;

      return (
        <div className={styles['momo-tree-row']}>
          <span className={styles['momo-tree-row-icon']}>
            {node.kind === 'folder' ? (
              <FolderIcon className='h-4 w-4' />
            ) : (
              <FileTextIcon className='h-4 w-4' />
            )}
          </span>
          <span className={styles['momo-tree-row-title']} title={node.name}>
            {renderHighlightedText(node.name, searchQuery, styles['momo-tree-highlight'])}
          </span>
          <span
            className={`${styles['momo-tree-row-actions']} ${isMenuOpen ? styles['momo-tree-row-actions-open'] : ''}`}
            onClick={(e: MouseEvent<HTMLSpanElement>) => e.stopPropagation()}>
            <Dropdown
              menu={{ items: menuItems }}
              trigger={['hover']}
              open={isMenuOpen}
              onOpenChange={(open: boolean) => setOpenMenuNodeId(open ? node.id : null)}>
              <Button
                type='text'
                size='small'
                className={styles['momo-tree-action-btn']}
                aria-label='更多操作'
                icon={<MoreOutlined style={{ fontSize: 14 }} />}
                onClick={(e: MouseEvent<HTMLElement>) => e.stopPropagation()}
              />
            </Dropdown>
          </span>
        </div>
      );
    },
    [buildFileMenuItems, buildFolderMenuItems, nodeById, openMenuNodeId, searchQuery],
  );

  const handleSelect = useCallback(
    (keys: Key[]) => {
      const key = String(keys[0] ?? '');
      if (!key) {
        return;
      }
      const node = nodeById(key);
      if (!node) {
        return;
      }
      if (node.kind === 'folder') {
        onSelectFolder(key);
      } else {
        onSelectFile(key);
      }
    },
    [nodeById, onSelectFile, onSelectFolder],
  );

  const handleExpand = useCallback(
    (keys: Key[]) => {
      onExpandedChange(keys.map(String));
    },
    [onExpandedChange],
  );

  const handleRenameOk = async () => {
    if (!renameNodeId || !renameValue.trim()) {
      setRenameNodeId(null);
      return;
    }
    try {
      await adapter.onRename(renameNodeId, renameValue.trim());
      setRenameNodeId(null);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '重命名失败');
    }
  };

  const handleMoveOk = async () => {
    if (!moveNodeId) {
      return;
    }
    const targetParentId = moveTargetId === rootId ? null : moveTargetId;
    try {
      await adapter.onMove(moveNodeId, targetParentId);
      setMoveNodeId(null);
      setMoveTargetId(null);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '移动失败');
    }
  };

  const handleCreateOk = async () => {
    if (!createKind) {
      return;
    }
    const trimmed = createNameValue.trim();
    if (!trimmed) {
      message.warning(labels.emptyNameError || 'Name is required');
      return;
    }
    if (hasDuplicateSiblingName(treeData, createParentId, trimmed, createKind)) {
      message.error(labels.duplicateNameError || 'Name already exists at this level');
      return;
    }
    if (createKind === 'folder') {
      await adapter.onCreateFolder(createParentId, trimmed);
    } else {
      await adapter.onCreateNote(createParentId, trimmed);
    }
    setCreateKind(null);
    setCreateParentId(null);
    setCreateNameValue('');
  };

  const createModalTitle =
    createKind === 'folder'
      ? labels.createFolderTitle || labels.createFolder
      : labels.createNoteTitle || labels.createNote;

  return (
    <div className={styles['momo-tree']}>
      {treeData.length === 0 ? (
        <div className={styles['momo-tree-empty']}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={emptyDescription ?? '暂无数据'}
          />
          {emptyAction ? (
            <div className={styles['momo-tree-empty-action']}>{emptyAction}</div>
          ) : null}
        </div>
      ) : (
        <Tree
          blockNode
          showIcon={false}
          treeData={antdTreeData}
          selectedKeys={selectedKeys}
          expandedKeys={expandedKeys}
          onExpand={handleExpand}
          onSelect={handleSelect}
          titleRender={titleRender}
        />
      )}

      <Modal
        title={labels.renameTitle}
        open={renameNodeId !== null}
        onOk={() => void handleRenameOk()}
        onCancel={() => setRenameNodeId(null)}
        okText={labels.confirm}
        cancelText={labels.cancel}
        destroyOnHidden>
        <Input
          value={renameValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setRenameValue(e.target.value)}
          placeholder={labels.renamePlaceholder}
          onPressEnter={() => void handleRenameOk()}
        />
      </Modal>

      <Modal
        title={createModalTitle}
        open={createKind !== null}
        onOk={() => void handleCreateOk()}
        onCancel={() => {
          setCreateKind(null);
          setCreateParentId(null);
          setCreateNameValue('');
        }}
        okText={labels.confirm}
        cancelText={labels.cancel}
        destroyOnHidden>
        <Input
          value={createNameValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setCreateNameValue(e.target.value)}
          placeholder={labels.createNamePlaceholder || labels.renamePlaceholder}
          onPressEnter={() => void handleCreateOk()}
        />
      </Modal>

      <Modal
        title={labels.moveTitle}
        open={moveNodeId !== null}
        onOk={() => void handleMoveOk()}
        onCancel={() => {
          setMoveNodeId(null);
          setMoveTargetId(null);
        }}
        okText={labels.confirm}
        cancelText={labels.cancel}
        destroyOnHidden>
        <TreeSelect
          className='w-full'
          value={moveTargetId ?? rootId}
          placeholder={labels.movePlaceholder}
          treeData={moveTargetTreeData}
          fieldNames={{ label: 'title', value: 'value', children: 'children' }}
          treeDefaultExpandAll
          treeLine
          treeNodeLabelProp='title'
          onChange={(value) => setMoveTargetId(value == null ? rootId : String(value))}
        />
      </Modal>
    </div>
  );
}
