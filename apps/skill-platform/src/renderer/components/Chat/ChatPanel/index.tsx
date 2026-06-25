import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useChatContext } from '@momo/aichat';
import { Button, Input, Popconfirm } from 'antd';
import { clsx } from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';

import { SidebarEmptyState } from '@renderer/components/ui/SidebarEmptyState';
import { useUIStore } from '@renderer/store';
import { ChatErrorBoundary } from '../ChatErrorBoundary';
import styles from './index.module.less';

interface IProps {
  collapsed?: boolean;
}

function ChatPanelContent({ collapsed = false }: IProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    sessions,
    currentSessionId,
    switchToSession,
    deleteSession,
    updateSessionTitle,
    handleNewChat,
    isSessionGenerating,
    stopGeneration,
    refreshSessionsFromStorage,
  } = useChatContext();

  const viewMode = useUIStore((s) => s.viewMode);
  const refreshSessionsRef = useRef(refreshSessionsFromStorage);
  refreshSessionsRef.current = refreshSessionsFromStorage;

  useEffect(() => {
    if (viewMode === 'chat') {
      refreshSessionsRef.current();
    }
  }, [viewMode]);

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredSessions = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    const sorted = [...sessions].sort((a, b) => b.createdAt - a.createdAt);
    if (!keyword) {
      return sorted;
    }
    return sorted.filter((session) => session.title.toLowerCase().includes(keyword));
  }, [searchQuery, sessions]);

  const handleDelete = (sessionId: string) => {
    if (isSessionGenerating(sessionId)) {
      stopGeneration(sessionId);
    }
    deleteSession(sessionId);
  };

  if (collapsed) {
    return null;
  }

  return (
    <div className={styles['chat-panel']}>
      <div className={styles['chat-panel-header']}>
        <div className={styles['chat-panel-header-row']}>
          <div className={styles['chat-panel-section-label']}>{'对话历史'}</div>
          <Button type='text' size='small' icon={<PlusCircleOutlined />} onClick={handleNewChat}>
            {'新建对话'}
          </Button>
        </div>
      </div>

      <div className={styles['chat-panel-search']}>
        <Input
          allowClear
          placeholder={'搜索对话'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles['chat-panel-list']}>
        {filteredSessions.length === 0 ? (
          <SidebarEmptyState description='暂无对话记录' />
        ) : (
          filteredSessions.map((session) => {
            const isActive = session.id === currentSessionId;
            const isEditing = editingSessionId === session.id;
            return (
              <div
                key={session.id}
                className={clsx(styles['chat-panel-row'], {
                  [styles['chat-panel-row--active']]: isActive,
                })}
                onClick={() => {
                  if (!isEditing) {
                    switchToSession(session.id);
                  }
                }}
                title={session.title}>
                <div className={styles['chat-panel-row-main']}>
                  {isEditing ? (
                    <Input
                      size='small'
                      value={editingTitle}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onPressEnter={() => {
                        const next = editingTitle.trim();
                        if (next) {
                          updateSessionTitle(session.id, next);
                        }
                        setEditingSessionId(null);
                      }}
                      onBlur={() => {
                        const next = editingTitle.trim();
                        if (next) {
                          updateSessionTitle(session.id, next);
                        }
                        setEditingSessionId(null);
                      }}
                    />
                  ) : (
                    <>
                      <span className={styles['chat-panel-row-title']}>{session.title}</span>
                      <span className={styles['chat-panel-row-time']}>
                        {new Date(session.createdAt).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
                <div className={styles['chat-panel-row-actions']}>
                  {!isEditing ? (
                    <Button
                      type='text'
                      size='small'
                      icon={<EditOutlined />}
                      className={styles['chat-panel-row-edit']}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSessionId(session.id);
                        setEditingTitle(session.title);
                      }}
                    />
                  ) : null}
                  <Popconfirm
                    title={'删除对话'}
                    description={'删除后无法恢复'}
                    okText={'删除'}
                    cancelText={'取消'}
                    okButtonProps={{ danger: true }}
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDelete(session.id);
                    }}
                    onCancel={(e) => e?.stopPropagation()}>
                    <Button
                      type='text'
                      size='small'
                      danger
                      icon={<DeleteOutlined />}
                      className={styles['chat-panel-row-delete']}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/** 对话历史侧栏：搜索、新建、列表与删除 */
export function ChatPanel(props: IProps) {
  const viewMode = useUIStore((s) => s.viewMode);
  if (viewMode !== 'chat') {
    return null;
  }
  return (
    <ChatErrorBoundary>
      <ChatPanelContent {...props} />
    </ChatErrorBoundary>
  );
}
