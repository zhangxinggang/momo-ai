import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { SidebarEmptyState } from '@renderer/components/ui/SidebarEmptyState';
import {
  kbCreateCollection,
  kbDeleteCollection,
  kbListCollections,
  kbUpdateCollection,
} from '@renderer/services/kb';
import { useKbStore } from '@renderer/store';
import { App, Button, Input, Modal, Popconfirm, Tooltip } from 'antd';
import { clsx } from 'clsx';
import { DatabaseIcon, PlusIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './index.module.less';

const KB_UPDATED_EVENT = 'kb:collections-updated';

function isDuplicateName(
  list: { id: number; name: string }[],
  name: string,
  excludeId?: number,
): boolean {
  const normalized = name.trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  return list.some((c) => c.id !== excludeId && c.name.trim().toLowerCase() === normalized);
}

interface IProps {
  /** embedded：旧版嵌在笔记侧栏；module：独立知识库模块侧栏 */
  layout?: 'embedded' | 'module';
  /** 侧栏收起时不显示头部「新建」按钮 */
  collapsed?: boolean;
  /** module 布局且侧栏已有 MomoTreeToolbar 时隐藏标题行 */
  hideHeader?: boolean;
}

export function KnowledgePanel({
  layout = 'module',
  collapsed = false,
  hideHeader = false,
}: IProps) {
  const { message } = App.useApp();
  const activeCollectionId = useKbStore((s) => s.activeCollectionId);
  const setActiveCollectionId = useKbStore((s) => s.setActiveCollectionId);
  const listSearchQuery = useKbStore((s) => s.listSearchQuery);
  const isCreateModalOpen = useKbStore((s) => s.isCreateModalOpen);
  const setCreateModalOpen = useKbStore((s) => s.setCreateModalOpen);

  const [list, setList] = useState<{ id: number; name: string }[]>([]);

  const [createName, setCreateName] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [renameTarget, setRenameTarget] = useState<{ id: number; name: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameSubmitting, setRenameSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const items = await kbListCollections();
      setList(items);
      return items;
    } catch (e: unknown) {
      const err = e as Error;
      message.error(err?.message || '加载知识库失败');
      return [];
    }
  }, [message]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handleUpdate = () => void load();
    window.addEventListener(KB_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(KB_UPDATED_EVENT, handleUpdate);
  }, [load]);

  useEffect(() => {
    if (list.length === 0) {
      if (activeCollectionId) {
        setActiveCollectionId(undefined);
      }
      return;
    }
    const exists = list.some((c) => c.id === activeCollectionId);
    if (!activeCollectionId || !exists) {
      setActiveCollectionId(list[0].id);
    }
  }, [list, activeCollectionId, setActiveCollectionId]);

  const normalizedSearchQuery = listSearchQuery.trim().toLowerCase();
  const filteredList = useMemo(() => {
    if (!normalizedSearchQuery) {
      return list;
    }
    return list.filter((c) => c.name.toLowerCase().includes(normalizedSearchQuery));
  }, [list, normalizedSearchQuery]);

  const openCreateModal = () => {
    setCreateName('');
    setCreateModalOpen(true);
  };

  const notifyUpdated = () => {
    window.dispatchEvent(new CustomEvent(KB_UPDATED_EVENT));
  };

  const onCreate = async () => {
    const trimmed = createName.trim();
    if (!trimmed) {
      message.warning('名称不能为空');
      return;
    }
    if (isDuplicateName(list, trimmed)) {
      message.warning('知识库名称已存在');
      return;
    }
    try {
      setCreateSubmitting(true);
      const c = await kbCreateCollection(trimmed);
      setCreateName('');
      setCreateModalOpen(false);
      await load();
      setActiveCollectionId(c.id);
      message.success('已创建知识库');
      notifyUpdated();
    } catch (e: unknown) {
      message.error((e as Error)?.message || '创建失败');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const onRename = async () => {
    if (!renameTarget) {
      return;
    }
    const trimmed = renameValue.trim();
    if (!trimmed) {
      message.warning('名称不能为空');
      return;
    }
    if (isDuplicateName(list, trimmed, renameTarget.id)) {
      message.warning('知识库名称已存在');
      return;
    }
    try {
      setRenameSubmitting(true);
      await kbUpdateCollection(renameTarget.id, { name: trimmed });
      setRenameTarget(null);
      await load();
      message.success('已重命名');
      notifyUpdated();
    } catch (e: unknown) {
      message.error((e as Error)?.message || '更新失败');
    } finally {
      setRenameSubmitting(false);
    }
  };

  const deleteCollection = async (cId: number) => {
    try {
      await kbDeleteCollection(cId);
      const items = (await load()) || [];
      if (activeCollectionId === cId) {
        setActiveCollectionId(items[0]?.id);
      }
      message.success('已删除');
      notifyUpdated();
    } catch (e: unknown) {
      message.error((e as Error)?.message || '删除失败');
    }
  };

  const rootClass = clsx(styles.knowledge, {
    [styles['knowledge--embedded']]: layout === 'embedded',
  });

  return (
    <div className={rootClass}>
      {!hideHeader && (
        <div className={styles['knowledge-header']}>
          <div className={styles['knowledge-header-row']}>
            <div className={styles['knowledge-section-label']}>
              <DatabaseIcon className={styles['knowledge-section-icon']} aria-hidden />
              {'知识库'}
            </div>
            {!collapsed && (
              <Button className={styles['knowledge-create-btn']} onClick={openCreateModal}>
                <PlusIcon size={14} aria-hidden />
                {'新建'}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className={styles['knowledge-list']}>
        {list.length === 0 ? (
          <SidebarEmptyState description='暂无知识库，创建第一个开始管理文档' />
        ) : filteredList.length === 0 ? (
          <SidebarEmptyState description='未找到匹配的知识库' />
        ) : (
          filteredList.map((c) => {
            const isActive = activeCollectionId === c.id;
            return (
              <div
                key={c.id}
                className={clsx(styles['knowledge-card'], {
                  [styles['knowledge-card--active']]: isActive,
                })}>
                <div
                  className={styles['knowledge-card-header']}
                  onClick={() => setActiveCollectionId(c.id)}
                  title={c.name}>
                  <span className={styles['knowledge-card-icon']} aria-hidden>
                    <DatabaseIcon />
                  </span>
                  <span className={styles['knowledge-card-body']}>
                    <span className={styles['knowledge-card-name']}>{c.name}</span>
                  </span>
                  <div
                    className={styles['knowledge-card-actions']}
                    onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={'重命名'}>
                      <span
                        role='button'
                        tabIndex={0}
                        className={styles['knowledge-icon-btn']}
                        aria-label={'重命名'}
                        onClick={() => {
                          setRenameTarget(c);
                          setRenameValue(c.name);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setRenameTarget(c);
                            setRenameValue(c.name);
                          }
                        }}>
                        <EditOutlined />
                      </span>
                    </Tooltip>
                    <Popconfirm
                      title={'删除知识库'}
                      description={'将删除该库及全部文档'}
                      okText={'删除'}
                      cancelText={'取消'}
                      okButtonProps={{ danger: true }}
                      onConfirm={() => void deleteCollection(c.id)}>
                      <Tooltip title={'删除知识库'}>
                        <span
                          role='button'
                          tabIndex={0}
                          className={clsx(
                            styles['knowledge-icon-btn'],
                            styles['knowledge-icon-btn--danger'],
                          )}
                          aria-label={'删除知识库'}>
                          <DeleteOutlined />
                        </span>
                      </Tooltip>
                    </Popconfirm>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal
        title={'新建知识库'}
        open={isCreateModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={() => void onCreate()}
        okText={'创建'}
        cancelText={'取消'}
        confirmLoading={createSubmitting}
        destroyOnHidden>
        <Input
          placeholder={'知识库名称'}
          value={createName}
          onChange={(e) => setCreateName(e.target.value)}
          onPressEnter={() => void onCreate()}
          maxLength={30}
          showCount
          autoFocus
          allowClear
        />
      </Modal>

      <Modal
        title={'重命名知识库'}
        open={!!renameTarget}
        onCancel={() => setRenameTarget(null)}
        onOk={() => void onRename()}
        okText={'确定'}
        cancelText={'取消'}
        confirmLoading={renameSubmitting}
        destroyOnHidden>
        <Input
          placeholder={'知识库名称'}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onPressEnter={() => void onRename()}
          maxLength={30}
          showCount
          autoFocus
          allowClear
        />
      </Modal>
    </div>
  );
}
