import type { IWorkflowResourceNodeData } from '@momo/workflow';
import type { Node } from '@xyflow/react';
import { Input, Typography } from 'antd';
import { useEffect, useState } from 'react';

import type { IPrompt, ISkill } from '@/types/modules';
import { SkillContextCard } from '@renderer/components/Skill/SkillContextCard';
import { getSystemFileNameError } from '@renderer/utils/validation/system-name';
import styles from './index.module.less';

interface IProps {
  node: Node<IWorkflowResourceNodeData>;
  prompts: IPrompt[];
  skills: ISkill[];
  onUpdate: (nodeId: string, data: Partial<IWorkflowResourceNodeData>) => void;
  onClose: () => void;
}

/**
 * 工作流节点编辑浮层（不挤压画布）
 */
export function WorkflowNodeEditPanel({ node, prompts, skills, onUpdate, onClose }: IProps) {
  const data = node.data;
  const [nodeName, setNodeName] = useState(data.nodeName || '');
  const [remark, setRemark] = useState(data.remark || '');
  const [systemPrompt, setSystemPrompt] = useState(data.systemPrompt || '');
  const [userPrompt, setUserPrompt] = useState(data.userPrompt || '');
  const [showErrors, setShowErrors] = useState(false);

  const linkedPrompt =
    data.resourceKind === 'prompt' ? prompts.find((p) => p.id === data.resourceId) : undefined;
  const linkedSkill =
    data.resourceKind === 'skill' ? skills.find((s) => s.id === data.resourceId) : undefined;

  useEffect(() => {
    setNodeName(data.nodeName || '');
    setRemark(data.remark || '');
    setSystemPrompt(data.systemPrompt ?? linkedPrompt?.systemPrompt ?? '');
    setUserPrompt(data.userPrompt ?? linkedPrompt?.userPrompt ?? '');
    setShowErrors(false);
  }, [node.id, data, linkedPrompt, linkedPrompt?.systemPrompt, linkedPrompt?.userPrompt]);

  const nameError = getSystemFileNameError(nodeName.trim());
  const systemError =
    data.resourceKind === 'prompt' && !systemPrompt.trim() ? '系统提示词不能为空' : null;
  const userError =
    data.resourceKind === 'prompt' && !userPrompt.trim() ? '用户提示词不能为空' : null;

  const handleApply = () => {
    setShowErrors(true);
    if (nameError || systemError || userError) {
      return;
    }
    onUpdate(node.id, {
      nodeName: nodeName.trim(),
      remark: remark.trim() || undefined,
      label: nodeName.trim(),
      systemPrompt: data.resourceKind === 'prompt' ? systemPrompt : undefined,
      userPrompt: data.resourceKind === 'prompt' ? userPrompt : undefined,
    });
    onClose();
  };

  return (
    <>
      <div
        className={styles['workflow-node-panel-backdrop']}
        onClick={onClose}
        role='presentation'
      />
      <aside className={styles['workflow-node-panel']}>
        <div className={styles['workflow-node-panel-header']}>
          <Typography.Text strong>{'节点属性'}</Typography.Text>
        </div>
        <div className={styles['workflow-node-panel-body']}>
          <div className={styles['workflow-node-panel-field']}>
            <label>{'名称'}</label>
            <Input
              status={showErrors && nameError ? 'error' : undefined}
              value={nodeName}
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
              onChange={(e) => setRemark(e.target.value)}
              placeholder={'可选备注'}
              rows={2}
            />
          </div>
          {data.resourceKind === 'prompt' ? (
            <>
              <div className={styles['workflow-node-panel-field']}>
                <label>{'系统提示词'}</label>
                <Input.TextArea
                  status={showErrors && systemError ? 'error' : undefined}
                  value={systemPrompt}
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
        <div className={styles['workflow-node-panel-footer']}>
          <button className={styles['workflow-node-panel-btn']} onClick={onClose} type='button'>
            {'取消'}
          </button>
          <button
            className={`${styles['workflow-node-panel-btn']} ${styles['workflow-node-panel-btn--primary']}`}
            onClick={handleApply}
            type='button'>
            {'确定'}
          </button>
        </div>
      </aside>
    </>
  );
}
