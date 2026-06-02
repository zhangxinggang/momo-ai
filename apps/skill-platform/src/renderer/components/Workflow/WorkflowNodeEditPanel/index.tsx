import type { IWorkflowResourceNodeData } from '@momo/workflow';
import type { Node } from '@xyflow/react';
import { Button, Input, Select, Typography } from 'antd';
import { XIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import type { IPrompt, ISkill } from '@/types/modules';
import { SkillContextCard } from '@renderer/components/Skill/SkillContextCard';
import { ModelSelect } from '@renderer/components/ui/ModelSelect';
import type { IAIModelConfig } from '@renderer/types/settings';
import { getSystemFileNameError } from '@renderer/utils/validation/system-name';
import styles from './index.module.less';

interface IProps {
  node: Node<IWorkflowResourceNodeData>;
  prompts: IPrompt[];
  skills: ISkill[];
  aiModels: IAIModelConfig[];
  onUpdate: (nodeId: string, data: Partial<IWorkflowResourceNodeData>) => void;
  onClose: () => void;
}

/**
 * 工作流节点编辑浮层（不挤压画布）
 */
export function WorkflowNodeEditPanel({
  node,
  prompts,
  skills,
  aiModels,
  onUpdate,
  onClose,
}: IProps) {
  const data = node.data;
  const [nodeName, setNodeName] = useState(data.nodeName || '');
  const [remark, setRemark] = useState(data.remark || '');
  const [executionModel, setExecutionModel] = useState(data.executionModel || '');
  const [kbCollectionId, setKbCollectionId] = useState<number | undefined>(data.kbCollectionId);
  const [workspacePaths, setWorkspacePaths] = useState<string[]>(data.workspacePaths ?? []);
  const [systemPrompt, setSystemPrompt] = useState(data.systemPrompt || '');
  const [userPrompt, setUserPrompt] = useState(data.userPrompt || '');
  const [showErrors, setShowErrors] = useState(false);
  const [kbOptions, setKbOptions] = useState<{ value: number; label: string }[]>([]);

  const linkedPrompt =
    data.resourceKind === 'prompt' ? prompts.find((p) => p.id === data.resourceId) : undefined;
  const linkedSkill =
    data.resourceKind === 'skill' ? skills.find((s) => s.id === data.resourceId) : undefined;

  useEffect(() => {
    setNodeName(data.nodeName || '');
    setRemark(data.remark || '');
    setExecutionModel(data.executionModel || '');
    setKbCollectionId(data.kbCollectionId);
    setWorkspacePaths(data.workspacePaths ?? []);
    setSystemPrompt(data.systemPrompt ?? linkedPrompt?.systemPrompt ?? '');
    setUserPrompt(data.userPrompt ?? linkedPrompt?.userPrompt ?? '');
    setShowErrors(false);
  }, [node.id, data, linkedPrompt, linkedPrompt?.systemPrompt, linkedPrompt?.userPrompt]);

  useEffect(() => {
    let mounted = true;
    const loadKb = async () => {
      try {
        const { kbListCollections } = await import('@renderer/services/kb/api');
        const collections = await kbListCollections();
        if (mounted) {
          setKbOptions(collections.map((item) => ({ value: item.id, label: item.name })));
        }
      } catch {
        // 忽略加载失败
      }
    };
    void loadKb();
    return () => {
      mounted = false;
    };
  }, []);

  const nameError = getSystemFileNameError(nodeName.trim());
  const systemError =
    data.resourceKind === 'prompt' && !systemPrompt.trim() ? '系统提示词不能为空' : null;
  const userError =
    data.resourceKind === 'prompt' && !userPrompt.trim() ? '用户提示词不能为空' : null;

  const commitUpdate = useCallback(
    (patch: Partial<IWorkflowResourceNodeData>) => {
      onUpdate(node.id, patch);
    },
    [node.id, onUpdate],
  );

  const handleNameBlur = () => {
    const trimmed = nodeName.trim();
    const err = getSystemFileNameError(trimmed);
    setShowErrors(true);
    if (err) {
      return;
    }
    commitUpdate({
      nodeName: trimmed,
      label: trimmed,
    });
  };

  const handleRemarkBlur = () => {
    commitUpdate({ remark: remark.trim() || undefined });
  };

  const handleExecutionModelChange = (next?: string) => {
    const value = next ?? '';
    setExecutionModel(value);
    commitUpdate({ executionModel: value.trim() || undefined });
  };

  const handleKbChange = (value: number | undefined) => {
    setKbCollectionId(value);
    commitUpdate({ kbCollectionId: value });
  };

  const handleAddWorkspacePath = async () => {
    const selectedList = await window.electron?.selectFolders?.();
    let paths: string[] = [];
    if (selectedList?.length) {
      paths = selectedList;
    } else {
      const single = await window.electron?.selectFolder?.();
      if (single?.trim()) {
        paths = [single.trim()];
      }
    }
    const merged = [...workspacePaths];
    for (const path of paths) {
      if (path?.trim() && !merged.includes(path.trim())) {
        merged.push(path.trim());
      }
    }
    setWorkspacePaths(merged);
    commitUpdate({ workspacePaths: merged.length > 0 ? merged : undefined });
  };

  const handleRemoveWorkspacePath = (folderPath: string) => {
    const next = workspacePaths.filter((item) => item !== folderPath);
    setWorkspacePaths(next);
    commitUpdate({ workspacePaths: next.length > 0 ? next : undefined });
  };

  const handleSystemPromptBlur = () => {
    if (data.resourceKind !== 'prompt') {
      return;
    }
    setShowErrors(true);
    if (!systemPrompt.trim()) {
      return;
    }
    commitUpdate({ systemPrompt });
  };

  const handleUserPromptBlur = () => {
    if (data.resourceKind !== 'prompt') {
      return;
    }
    setShowErrors(true);
    if (!userPrompt.trim()) {
      return;
    }
    commitUpdate({ userPrompt });
  };

  return (
    <aside className={styles['workflow-node-panel']}>
      <div className={styles['workflow-node-panel-header']}>
        <Typography.Text strong>{'节点属性'}</Typography.Text>
        <button
          aria-label='关闭'
          className={styles['workflow-node-panel-close']}
          onClick={onClose}
          type='button'>
          <XIcon className='h-4 w-4' />
        </button>
      </div>
      <div className={styles['workflow-node-panel-body']}>
        <div className={styles['workflow-node-panel-field']}>
          <label>{'名称'}</label>
          <Input
            status={showErrors && nameError ? 'error' : undefined}
            value={nodeName}
            onBlur={handleNameBlur}
            onChange={(e) => setNodeName(e.target.value)}
            placeholder={'节点名称'}
          />
          {showErrors && nameError ? (
            <span className={styles['workflow-node-panel-error']}>{nameError}</span>
          ) : null}
        </div>
        <div className={styles['workflow-node-panel-field']}>
          <label>{'备注'}</label>
          <Input.TextArea
            value={remark}
            onBlur={handleRemarkBlur}
            onChange={(e) => setRemark(e.target.value)}
            placeholder={'可选备注'}
            rows={2}
          />
        </div>
        <div className={styles['workflow-node-panel-field']}>
          <label>{'执行模型'}</label>
          <ModelSelect
            allowEmpty
            value={executionModel || undefined}
            onChange={handleExecutionModelChange}
            models={aiModels}
            modelType='chat'
            placeholder='使用全局默认模型'
          />
        </div>
        <div className={styles['workflow-node-panel-field']}>
          <label>{'知识库'}</label>
          <Select
            allowClear
            options={kbOptions}
            placeholder='使用全局默认知识库'
            value={kbCollectionId}
            onChange={handleKbChange}
          />
        </div>
        <div className={styles['workflow-node-panel-field']}>
          <label>{'工作区'}</label>
          <div className={styles['workflow-node-panel-workspace']}>
            {workspacePaths.map((folderPath) => (
              <span className={styles['workflow-node-panel-workspace-tag']} key={folderPath}>
                <span title={folderPath}>{folderPath}</span>
                <button
                  aria-label='移除目录'
                  onClick={() => handleRemoveWorkspacePath(folderPath)}
                  type='button'>
                  <XIcon className='h-3 w-3' />
                </button>
              </span>
            ))}
            <Button size='small' type='dashed' onClick={() => void handleAddWorkspacePath()}>
              {'添加目录'}
            </Button>
          </div>
        </div>
        {data.resourceKind === 'prompt' ? (
          <>
            <div className={styles['workflow-node-panel-field']}>
              <label>{'系统提示词'}</label>
              <Input.TextArea
                status={showErrors && systemError ? 'error' : undefined}
                value={systemPrompt}
                onBlur={handleSystemPromptBlur}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={4}
              />
              {showErrors && systemError ? (
                <span className={styles['workflow-node-panel-error']}>{systemError}</span>
              ) : null}
            </div>
            <div className={styles['workflow-node-panel-field']}>
              <label>{'用户提示词'}</label>
              <Input.TextArea
                status={showErrors && userError ? 'error' : undefined}
                value={userPrompt}
                onBlur={handleUserPromptBlur}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={4}
              />
              {showErrors && userError ? (
                <span className={styles['workflow-node-panel-error']}>{userError}</span>
              ) : null}
            </div>
          </>
        ) : null}
        {data.resourceKind === 'skill' && linkedSkill ? (
          <div className={styles['workflow-node-panel-skill']}>
            <SkillContextCard skill={linkedSkill} />
            <Typography.Paragraph className={styles['workflow-node-panel-hint']} type='secondary'>
              {'技能为关联引用，修改源技能后工作流内同步更新'}
            </Typography.Paragraph>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
