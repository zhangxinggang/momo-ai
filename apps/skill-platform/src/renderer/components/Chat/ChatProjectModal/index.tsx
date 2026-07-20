import { DeleteOutlined, FolderAddOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Modal } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { useToast } from '@renderer/components/ui/Toast';
import { pickFolders } from '@renderer/services/desktop';
import { useChatProjectStore } from '@renderer/store/chat';
import styles from './index.module.less';
import type { IProps } from './types';

const SAVE_ERROR_TEXT = {
  'empty-name': '名称不能为空',
  duplicate: '已存在相同名称与文件夹的项目',
  'not-found': '项目不存在',
} as const;

/** 创建 / 编辑对话项目弹框 */
export function ChatProjectModal({ open, mode, projectId, onClose, onSuccess }: IProps) {
  const { showToast } = useToast();
  const projects = useChatProjectStore((s) => s.projects);
  const recentFolderPaths = useChatProjectStore((s) => s.recentFolderPaths);
  const createProject = useChatProjectStore((s) => s.createProject);
  const updateProject = useChatProjectStore((s) => s.updateProject);
  const pushRecentFolders = useChatProjectStore((s) => s.pushRecentFolders);
  const removeRecentFolder = useChatProjectStore((s) => s.removeRecentFolder);

  const [name, setName] = useState('');
  const [folderPaths, setFolderPaths] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const editingProject = useMemo(
    () => (mode === 'edit' && projectId ? projects.find((item) => item.id === projectId) : null),
    [mode, projectId, projects],
  );

  const visibleRecentFolders = useMemo(
    () => recentFolderPaths.slice(0, 8),
    [recentFolderPaths],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    if (mode === 'edit' && editingProject) {
      setName(editingProject.name);
      setFolderPaths([...editingProject.folderPaths]);
      return;
    }
    setName('');
    setFolderPaths([]);
  }, [open, mode, editingProject]);

  const handleAddFolders = async () => {
    const selected = await pickFolders();
    if (selected.length === 0) {
      return;
    }
    setFolderPaths((prev) => {
      const next = [...prev];
      for (const path of selected) {
        const trimmed = path.trim();
        if (trimmed && !next.includes(trimmed)) {
          next.push(trimmed);
        }
      }
      return next;
    });
    pushRecentFolders(selected);
  };

  const handleRemoveFolder = (path: string) => {
    setFolderPaths((prev) => prev.filter((item) => item !== path));
  };

  const handlePickRecent = (path: string) => {
    setFolderPaths((prev) => (prev.includes(path) ? prev : [...prev, path]));
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      if (mode === 'create') {
        const result = createProject(name, folderPaths);
        if (result.ok === true) {
          onSuccess?.(result.project.id);
          onClose();
          return;
        }
        if (result.ok === false) {
          showToast(SAVE_ERROR_TEXT[result.reason], 'error');
        }
        return;
      }
      if (!projectId) {
        showToast(SAVE_ERROR_TEXT['not-found'], 'error');
        return;
      }
      const result = updateProject(projectId, name, folderPaths);
      if (result.ok === true) {
        onSuccess?.(projectId);
        onClose();
        return;
      }
      if (result.ok === false) {
        showToast(SAVE_ERROR_TEXT[result.reason], 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      title={mode === 'create' ? '创建项目' : '编辑项目'}
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      confirmLoading={isSaving}
      okText='确定'
      cancelText='取消'
      destroyOnHidden
      width={480}>
      <div className={styles['chat-project-modal']}>
        <div className={styles['chat-project-modal-field']}>
          <div className={styles['chat-project-modal-label']}>项目名称</div>
          <Input
            placeholder='请输入项目名称'
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
          />
        </div>

        <div className={styles['chat-project-modal-field']}>
          <div className={styles['chat-project-modal-label-row']}>
            <span className={styles['chat-project-modal-label']}>文件夹</span>
            <Button
              type='link'
              size='small'
              icon={<FolderAddOutlined />}
              onClick={() => {
                void handleAddFolders();
              }}>
              添加文件夹
            </Button>
          </div>
          {folderPaths.length === 0 ? (
            <div className={styles['chat-project-modal-hint']}>
              可不选；选中后用于本地路径解析，并在相关代码问题时作为上下文
            </div>
          ) : (
            <ul className={styles['chat-project-modal-path-list']}>
              {folderPaths.map((path) => (
                <li key={path} className={styles['chat-project-modal-path-item']}>
                  <span className={styles['chat-project-modal-path-text']} title={path}>
                    {path}
                  </span>
                  <Button
                    type='text'
                    size='small'
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveFolder(path)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles['chat-project-modal-field']}>
          <div className={styles['chat-project-modal-label']}>最近选择的目录</div>
          {visibleRecentFolders.length === 0 ? (
            <div className={styles['chat-project-modal-hint']}>暂无最近目录</div>
          ) : (
            <ul className={styles['chat-project-modal-recent-list']}>
              {visibleRecentFolders.map((path) => (
                <li key={path} className={styles['chat-project-modal-recent-item']}>
                  <button
                    type='button'
                    className={styles['chat-project-modal-recent-btn']}
                    title={path}
                    onClick={() => handlePickRecent(path)}>
                    <PlusOutlined />
                    <span>{path}</span>
                  </button>
                  <Button
                    type='text'
                    size='small'
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeRecentFolder(path)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
