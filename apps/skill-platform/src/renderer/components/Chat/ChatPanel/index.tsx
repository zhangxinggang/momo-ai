import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  formatRelativeCompact,
  getChatProjectDisplayName,
  useChatContext,
  type IChatProject,
  type IChatSession,
} from '@momo/aichat';
import { Button, Dropdown, Input, Modal, type MenuProps } from 'antd';
import { clsx } from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';

import { SidebarEmptyState } from '@renderer/components/ui/SidebarEmptyState';
import { useChatProjectStore, useUIStore } from '@renderer/store';
import { ChatErrorBoundary } from '../ChatErrorBoundary';
import { ChatProjectModal } from '../ChatProjectModal';
import styles from './index.module.less';

interface IProps {
  collapsed?: boolean;
}

interface IProjectTreeNode {
  project: IChatProject;
  sessions: IChatSession[];
}

function ChatPanelContent({ collapsed = false }: IProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingProjectId, setEditingProjectId] = useState<string | undefined>();
  const [removingProjectId, setRemovingProjectId] = useState<string | null>(null);
  const hasInitExpandRef = useRef(false);

  const {
    sessions,
    currentSessionId,
    switchToSession,
    deleteSession,
    deleteSessionsByProjectId,
    updateSessionTitle,
    handleNewChatInProject,
    isSessionGenerating,
    stopGeneration,
    refreshSessionsFromStorage,
  } = useChatContext();

  const projects = useChatProjectStore((s) => s.projects);
  const removeProject = useChatProjectStore((s) => s.removeProject);

  const viewMode = useUIStore((s) => s.viewMode);
  const refreshSessionsRef = useRef(refreshSessionsFromStorage);
  refreshSessionsRef.current = refreshSessionsFromStorage;

  useEffect(() => {
    if (viewMode === 'chat') {
      refreshSessionsRef.current();
    }
  }, [viewMode]);

  useEffect(() => {
    if (hasInitExpandRef.current || projects.length === 0) {
      return;
    }
    hasInitExpandRef.current = true;
    setExpandedIds(new Set(projects.map((item) => item.id)));
  }, [projects]);

  const treeNodes = useMemo((): IProjectTreeNode[] => {
    const keyword = searchQuery.trim().toLowerCase();
    return projects
      .map((project) => {
        const projectSessions = sessions
          .filter((session) => session.projectId === project.id)
          .filter((session) =>
            (session.messages ?? []).some(
              (message) => message.role === 'user' || message.role === 'assistant',
            ),
          )
          .filter((session) =>
            keyword ? session.title.toLowerCase().includes(keyword) : true,
          )
          .sort((a, b) => b.updatedAt - a.updatedAt);
        return { project, sessions: projectSessions };
      })
      .filter((node) => (keyword ? node.sessions.length > 0 : true));
  }, [projects, searchQuery, sessions]);

  const handleToggleExpand = (projectId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    if (isSessionGenerating(sessionId)) {
      stopGeneration(sessionId);
    }
    deleteSession(sessionId);
  };

  const handleRemoveProject = (projectId: string) => {
    setRemovingProjectId(projectId);
  };

  const handleConfirmRemoveProject = () => {
    if (!removingProjectId) {
      return;
    }
    const projectId = removingProjectId;
    deleteSessionsByProjectId(projectId);
    removeProject(projectId);
    setRemovingProjectId(null);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(projectId);
      return next;
    });
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingProjectId(undefined);
    setModalOpen(true);
  };

  const handleOpenEditModal = (projectId: string) => {
    setModalMode('edit');
    setEditingProjectId(projectId);
    setModalOpen(true);
  };

  const buildProjectMenu = (projectId: string): MenuProps => ({
    items: [
      {
        key: 'edit',
        label: '编辑项目',
      },
      {
        key: 'remove',
        label: '移出项目',
        danger: true,
      },
    ],
    onClick: ({ key, domEvent }) => {
      domEvent.stopPropagation();
      if (key === 'edit') {
        handleOpenEditModal(projectId);
      }
      if (key === 'remove') {
        handleRemoveProject(projectId);
      }
    },
  });

  const buildSessionMenu = (session: IChatSession): MenuProps => ({
    items: [
      {
        key: 'rename',
        icon: <EditOutlined />,
        label: '编辑',
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除',
        danger: true,
      },
    ],
    onClick: ({ key, domEvent }) => {
      domEvent.stopPropagation();
      if (key === 'rename') {
        setEditingSessionId(session.id);
        setEditingTitle(session.title);
      }
      if (key === 'delete') {
        handleDeleteSession(session.id);
      }
    },
  });

  if (collapsed) {
    return null;
  }

  return (
    <div className={styles['chat-panel']}>
      <div className={styles['chat-panel-header']}>
        <div className={styles['chat-panel-header-row']}>
          <div className={styles['chat-panel-section-label']}>工作区</div>
          <Button
            type='text'
            size='small'
            icon={<PlusOutlined />}
            className={styles['chat-panel-header-add']}
            onClick={handleOpenCreateModal}
            title='创建项目'
          />
        </div>
      </div>

      <div className={styles['chat-panel-search']}>
        <Input
          allowClear
          placeholder='搜索对话'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles['chat-panel-list']}>
        {treeNodes.length === 0 ? (
          <SidebarEmptyState description={searchQuery.trim() ? '无匹配对话' : '暂无项目，点击上方添加'} />
        ) : (
          treeNodes.map(({ project, sessions: projectSessions }) => {
            const isExpanded = expandedIds.has(project.id);
            const displayName = getChatProjectDisplayName(project);
            return (
              <div key={project.id} className={styles['chat-panel-project']}>
                <div
                  className={styles['chat-panel-project-row']}
                  onClick={() => handleToggleExpand(project.id)}>
                  <span className={styles['chat-panel-project-name']} title={displayName}>
                    {displayName}
                  </span>
                  <div
                    className={styles['chat-panel-project-actions']}
                    onClick={(e) => e.stopPropagation()}>
                    <Dropdown
                      menu={buildProjectMenu(project.id)}
                      trigger={['hover']}
                      placement='bottomRight'>
                      <Button
                        type='text'
                        size='small'
                        icon={<EllipsisOutlined />}
                        className={styles['chat-panel-action-btn']}
                      />
                    </Dropdown>
                    <Button
                      type='text'
                      size='small'
                      icon={<PlusOutlined />}
                      className={styles['chat-panel-action-btn']}
                      title='新建对话'
                      onClick={() => {
                        handleNewChatInProject(project.id);
                        setExpandedIds((prev) => new Set(prev).add(project.id));
                      }}
                    />
                  </div>
                </div>

                {isExpanded
                  ? projectSessions.map((session) => {
                      const isActive = session.id === currentSessionId;
                      const isEditing = editingSessionId === session.id;
                      return (
                        <div
                          key={session.id}
                          className={clsx(styles['chat-panel-session-row'], {
                            [styles['chat-panel-session-row--active']]: isActive,
                          })}
                          onClick={() => {
                            if (!isEditing) {
                              switchToSession(session.id);
                            }
                          }}
                          title={session.title}>
                          <div className={styles['chat-panel-session-main']}>
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
                              <span className={styles['chat-panel-session-title']}>
                                {session.title}
                              </span>
                            )}
                          </div>
                          {!isEditing ? (
                            <div
                              className={styles['chat-panel-session-meta']}
                              onClick={(e) => e.stopPropagation()}>
                              <Dropdown
                                menu={buildSessionMenu(session)}
                                trigger={['hover']}
                                placement='bottomRight'>
                                <Button
                                  type='text'
                                  size='small'
                                  icon={<EllipsisOutlined />}
                                  className={styles['chat-panel-session-more']}
                                />
                              </Dropdown>
                              <span className={styles['chat-panel-session-time']}>
                                {formatRelativeCompact(session.updatedAt)}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  : null}
              </div>
            );
          })
        )}
      </div>

      <ChatProjectModal
        open={modalOpen}
        mode={modalMode}
        projectId={editingProjectId}
        onClose={() => setModalOpen(false)}
        onSuccess={(id) => {
          setExpandedIds((prev) => new Set(prev).add(id));
          handleNewChatInProject(id);
        }}
      />

      <Modal
        title='移出项目'
        open={removingProjectId !== null}
        onCancel={() => setRemovingProjectId(null)}
        onOk={handleConfirmRemoveProject}
        okText='移出'
        cancelText='取消'
        okButtonProps={{ danger: true }}
        destroyOnHidden>
        <p>将删除该项目下全部对话，且无法恢复</p>
      </Modal>
    </div>
  );
}

/** 对话历史侧栏：项目树、搜索与会话操作 */
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
