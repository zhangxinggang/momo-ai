import { DeleteOutlined, FolderAddOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Radio } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

import { SKILL_PLATFORMS } from '@/types/constants/platforms';
import type { DAgentAppDetectionItem } from '@/types/modules/agent-app';
import { PlatformIcon } from '@renderer/components/ui/PlatformIcon';
import { useToast } from '@renderer/components/ui/Toast';
import { detectAgentApps } from '@renderer/services/agent-app/api';
import { pickFolders } from '@renderer/services/desktop';
import { useSettingsStore } from '@renderer/store';
import { useChatProjectStore } from '@renderer/store/chat';
import { sortSkillPlatformsByPreference } from '@renderer/utils/skill/platform-sort';
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
  const projects = useChatProjectStore((state) => state.projects);
  const recentFolderPaths = useChatProjectStore((state) => state.recentFolderPaths);
  const createProject = useChatProjectStore((state) => state.createProject);
  const updateProject = useChatProjectStore((state) => state.updateProject);
  const pushRecentFolders = useChatProjectStore((state) => state.pushRecentFolders);
  const removeRecentFolder = useChatProjectStore((state) => state.removeRecentFolder);
  const skillPlatformOrder = useSettingsStore((state) => state.skillPlatformOrder);

  const [name, setName] = useState('');
  const [folderPaths, setFolderPaths] = useState<string[]>([]);
  const [agentAppId, setAgentAppId] = useState<string | null>(null);
  const [detectedItems, setDetectedItems] = useState<DAgentAppDetectionItem[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const detectSeqRef = useRef(0);

  const editingProject = useMemo(
    () => (mode === 'edit' && projectId ? projects.find((item) => item.id === projectId) : null),
    [mode, projectId, projects],
  );

  const orderedPlatforms = useMemo(
    () => sortSkillPlatformsByPreference(SKILL_PLATFORMS, skillPlatformOrder ?? []),
    [skillPlatformOrder],
  );

  const visibleDetectedPlatforms = useMemo(() => {
    const ids = new Set(detectedItems.map((item) => item.platformId));
    return orderedPlatforms.filter((platform) => ids.has(platform.id));
  }, [detectedItems, orderedPlatforms]);

  const visibleRecentFolders = useMemo(() => recentFolderPaths.slice(0, 8), [recentFolderPaths]);

  useEffect(() => {
    detectSeqRef.current += 1;
    if (!open) {
      return;
    }
    setDetectedItems([]);
    setDetectError('');
    setIsDetecting(false);
    if (mode === 'edit' && editingProject) {
      setName(editingProject.name);
      setFolderPaths([...editingProject.folderPaths]);
      setAgentAppId(editingProject.agentAppId ?? null);
      return;
    }
    setName('');
    setFolderPaths([]);
    setAgentAppId(null);
  }, [open, mode, editingProject]);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (folderPaths.length === 0) {
      detectSeqRef.current += 1;
      setDetectedItems([]);
      setAgentAppId(null);
      setDetectError('');
      setIsDetecting(false);
      return;
    }

    const seq = ++detectSeqRef.current;
    const requestKey = String(seq) + ':' + folderPaths.map((item) => item.trim()).join('|');
    setDetectedItems([]);
    setDetectError('');
    setIsDetecting(true);

    const timer = window.setTimeout(() => {
      void detectAgentApps({ requestKey, folderPaths })
        .then((result) => {
          if (seq !== detectSeqRef.current || result.requestKey !== requestKey) {
            return;
          }
          setDetectedItems(result.items);
          const resultIds = new Set(result.items.map((item) => item.platformId));
          const orderedResultIds = orderedPlatforms
            .filter((item) => resultIds.has(item.id))
            .map((item) => item.id);
          setAgentAppId((current) =>
            current && resultIds.has(current) ? current : (orderedResultIds[0] ?? null),
          );
          if (result.errors.length > 0 && result.items.length === 0) {
            setDetectError('部分目录无法读取，请检查目录是否仍然存在');
          }
        })
        .catch(() => {
          if (seq !== detectSeqRef.current) {
            return;
          }
          setDetectedItems([]);
          setAgentAppId(null);
          setDetectError('Agent 识别失败，请重试');
        })
        .finally(() => {
          if (seq === detectSeqRef.current) {
            setIsDetecting(false);
          }
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [folderPaths, open, orderedPlatforms]);

  const handleAddFolders = async () => {
    const selected = await pickFolders();
    if (selected.length === 0) {
      return;
    }
    setFolderPaths((previous) => {
      const next = [...previous];
      for (const folderPath of selected) {
        const trimmed = folderPath.trim();
        if (trimmed && !next.includes(trimmed)) {
          next.push(trimmed);
        }
      }
      return next;
    });
    pushRecentFolders(selected);
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      if (mode === 'create') {
        const result = createProject(name, folderPaths, agentAppId);
        if (result.ok === true) {
          onSuccess?.(result.project.id);
          onClose();
        } else if (result.ok === false) {
          showToast(SAVE_ERROR_TEXT[result.reason], 'error');
        }
        return;
      }
      if (!projectId) {
        showToast(SAVE_ERROR_TEXT['not-found'], 'error');
        return;
      }
      const result = updateProject(projectId, name, folderPaths, agentAppId);
      if (result.ok === true) {
        onSuccess?.(projectId);
        onClose();
      } else if (result.ok === false) {
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
      okButtonProps={{ disabled: isDetecting }}
      okText='确定'
      cancelText='取消'
      destroyOnHidden
      width={520}>
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
              onClick={() => void handleAddFolders()}>
              添加文件夹
            </Button>
          </div>
          {folderPaths.length === 0 ? (
            <div className={styles['chat-project-modal-hint']}>
              可不选；选择后将识别目录中的 Agent 配置
            </div>
          ) : (
            <ul className={styles['chat-project-modal-path-list']}>
              {folderPaths.map((folderPath) => (
                <li key={folderPath} className={styles['chat-project-modal-path-item']}>
                  <span className={styles['chat-project-modal-path-text']} title={folderPath}>
                    {folderPath}
                  </span>
                  <Button
                    type='text'
                    size='small'
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      setFolderPaths((previous) => previous.filter((item) => item !== folderPath))
                    }
                  />
                </li>
              ))}
            </ul>
          )}
          {isDetecting ? (
            <div className={styles['chat-project-modal-hint']}>正在识别 Agent…</div>
          ) : detectError ? (
            <div className={styles['chat-project-modal-error']}>{detectError}</div>
          ) : null}
        </div>

        {visibleDetectedPlatforms.length > 0 ? (
          <div className={styles['chat-project-modal-field']}>
            <div className={styles['chat-project-modal-label']}>Agent 应用</div>
            <div className={styles['chat-project-modal-hint']}>仅显示所选目录中检测到的 Agent</div>
            <Radio.Group
              value={agentAppId ?? ''}
              onChange={(event) => setAgentAppId(String(event.target.value))}
              className={styles['chat-project-modal-agent-group']}>
              {visibleDetectedPlatforms.map((platform) => (
                <Radio
                  key={platform.id}
                  value={platform.id}
                  className={styles['chat-project-modal-agent-item']}>
                  <span className={styles['chat-project-modal-agent-content']}>
                    <PlatformIcon platformId={platform.id} size={18} />
                    <span className={styles['chat-project-modal-agent-name']}>{platform.name}</span>
                  </span>
                </Radio>
              ))}
            </Radio.Group>
          </div>
        ) : null}

        <div className={styles['chat-project-modal-field']}>
          <div className={styles['chat-project-modal-label']}>最近选择的目录</div>
          {visibleRecentFolders.length === 0 ? (
            <div className={styles['chat-project-modal-hint']}>暂无最近目录</div>
          ) : (
            <ul className={styles['chat-project-modal-recent-list']}>
              {visibleRecentFolders.map((folderPath) => (
                <li key={folderPath} className={styles['chat-project-modal-recent-item']}>
                  <button
                    type='button'
                    className={styles['chat-project-modal-recent-btn']}
                    title={folderPath}
                    onClick={() =>
                      setFolderPaths((previous) =>
                        previous.includes(folderPath) ? previous : [...previous, folderPath],
                      )
                    }>
                    <PlusOutlined />
                    <span>{folderPath}</span>
                  </button>
                  <Button
                    type='text'
                    size='small'
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeRecentFolder(folderPath)}
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
