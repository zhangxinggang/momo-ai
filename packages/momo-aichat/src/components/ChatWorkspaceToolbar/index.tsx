import { CloseOutlined, FolderAddOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { Button, Input, type InputRef, Switch, Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';

import type { IChatWorkspaceConfig, IChatWorkspacePreset } from '../../types/workspace';
import { formatWorkspaceDisplayPath } from '../../utils/workspace-display';
import styles from './index.module.less';

interface IProps {
  workspace: IChatWorkspaceConfig;
}

/** 工作区下拉面板内容：启用开关、常用预设、目录列表 */
export function ChatWorkspaceToolbar({ workspace }: IProps) {
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [presetNameDraft, setPresetNameDraft] = useState('');
  const [renamingPresetId, setRenamingPresetId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const createInputRef = useRef<InputRef>(null);
  const renameInputRef = useRef<InputRef>(null);

  const presets = workspace.presets ?? [];
  const activePresetId = workspace.activePresetId ?? null;
  const activePreset = presets.find((item) => item.id === activePresetId);
  const listPaths = activePreset?.paths ?? workspace.paths;
  const canManagePresets = Boolean(workspace.onPresetSave);

  useEffect(() => {
    if (isCreatingPreset) {
      createInputRef.current?.focus();
    }
  }, [isCreatingPreset]);

  useEffect(() => {
    if (renamingPresetId) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renamingPresetId]);

  const handleStartCreatePreset = () => {
    if (workspace.paths.length === 0) {
      return;
    }
    setIsCreatingPreset(true);
    setPresetNameDraft('');
  };

  const handleCreatePresetBlur = () => {
    const name = presetNameDraft.trim();
    if (name && workspace.paths.length > 0) {
      workspace.onPresetSave?.(name, [...workspace.paths]);
    }
    setPresetNameDraft('');
    setIsCreatingPreset(false);
  };

  const handleRenameBlur = (preset: IChatWorkspacePreset) => {
    const name = renameDraft.trim();
    if (name && name !== preset.name) {
      workspace.onPresetRename?.(preset.id, name);
    }
    setRenamingPresetId(null);
    setRenameDraft('');
  };

  const renderPresetButton = (preset: IChatWorkspacePreset) => {
    if (renamingPresetId === preset.id) {
      return (
        <Input
          ref={renameInputRef}
          className={styles['chat-workspace-preset-input']}
          size='small'
          value={renameDraft}
          onBlur={() => handleRenameBlur(preset)}
          onChange={(event) => setRenameDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur();
            }
            if (event.key === 'Escape') {
              setRenamingPresetId(null);
              setRenameDraft('');
            }
          }}
        />
      );
    }

    return (
      <div className={styles['chat-workspace-preset']}>
        <Tooltip title={preset.name}>
          <button
            className={`${styles['chat-workspace-preset-btn']} ${
              activePresetId === preset.id ? styles['chat-workspace-preset-btn--active'] : ''
            }`}
            onClick={() => workspace.onPresetSelect?.(preset.id)}
            onDoubleClick={() => {
              setRenamingPresetId(preset.id);
              setRenameDraft(preset.name);
            }}
            type='button'>
            <StarFilled style={{ fontSize: 12 }} />
            <span className={styles['chat-workspace-preset-label']}>{preset.name}</span>
          </button>
        </Tooltip>
        <Tooltip title='删除常用'>
          <button
            aria-label='删除常用'
            className={styles['chat-workspace-preset-delete']}
            onClick={(event) => {
              event.stopPropagation();
              workspace.onPresetDelete?.(preset.id);
            }}
            type='button'>
            <CloseOutlined />
          </button>
        </Tooltip>
      </div>
    );
  };

  return (
    <div className={styles['chat-workspace']}>
      <div className={styles['chat-workspace-row']}>
        <Tooltip title='启用后选择的目录作为上下文'>
          <div className={styles['chat-workspace-toggle']}>
            <Switch checked={workspace.enabled} onChange={workspace.onEnabledChange} size='small' />
            <span>{workspace.enabled ? '启用' : '禁用'}</span>
          </div>
        </Tooltip>

        {workspace.enabled ? (
          <div className={styles['chat-workspace-actions']}>
            {presets.map((preset) => (
              <span key={preset.id}>{renderPresetButton(preset)}</span>
            ))}

            {isCreatingPreset ? (
              <Input
                ref={createInputRef}
                className={styles['chat-workspace-preset-input']}
                placeholder='名称'
                size='small'
                value={presetNameDraft}
                onBlur={handleCreatePresetBlur}
                onChange={(event) => setPresetNameDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.currentTarget.blur();
                  }
                  if (event.key === 'Escape') {
                    setPresetNameDraft('');
                    setIsCreatingPreset(false);
                  }
                }}
              />
            ) : null}

            {canManagePresets ? (
              <Tooltip title='设置为常用'>
                <Button
                  className={styles['chat-workspace-action-btn']}
                  disabled={workspace.paths.length === 0}
                  icon={<StarOutlined />}
                  onClick={handleStartCreatePreset}
                  size='small'
                  type='text'
                />
              </Tooltip>
            ) : null}

            <Tooltip title='添加目录'>
              <Button
                className={styles['chat-workspace-action-btn']}
                icon={<FolderAddOutlined />}
                onClick={workspace.onAddFolder}
                size='small'
                type='text'
              />
            </Tooltip>
          </div>
        ) : null}
      </div>

      {workspace.enabled && listPaths.length > 0 ? (
        <ul className={styles['chat-workspace-path-list']}>
          {listPaths.map((folderPath) => (
            <li className={styles['chat-workspace-path-item']} key={folderPath}>
              <span className={styles['chat-workspace-path-text']} title={folderPath}>
                {formatWorkspaceDisplayPath(folderPath)}
              </span>
              {!activePreset ? (
                <button
                  aria-label='移除目录'
                  className={styles['chat-workspace-path-remove']}
                  onClick={() => workspace.onRemoveFolder(folderPath)}
                  type='button'>
                  <CloseOutlined style={{ fontSize: 10 }} />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
