import type { IWorkflowWebpageNodeData } from '@momo/workflow';
import type { Node } from '@xyflow/react';
import { Input, Typography } from 'antd';
import { XIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { getSystemFileNameError } from '@renderer/utils/validation/system-name';
import styles from './index.module.less';

interface IProps {
  node: Node<IWorkflowWebpageNodeData>;
  onUpdate: (nodeId: string, data: Partial<IWorkflowWebpageNodeData>) => void;
  onClose: () => void;
}

/**
 * 网页节点属性浮层：名称 / 备注 / 链接地址
 */
export function WorkflowWebpageEditPanel({ node, onUpdate, onClose }: IProps) {
  const data = node.data;
  const [nodeName, setNodeName] = useState(data.nodeName || '');
  const [remark, setRemark] = useState(data.remark || '');
  const [url, setUrl] = useState(data.url || '');
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    setNodeName(data.nodeName || '');
    setRemark(data.remark || '');
    setUrl(data.url || '');
    setShowErrors(false);
  }, [node.id, data]);

  const nameError = getSystemFileNameError(nodeName.trim());

  const commitUpdate = useCallback(
    (patch: Partial<IWorkflowWebpageNodeData>) => {
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

  const handleUrlBlur = () => {
    commitUpdate({ url: url.trim() || undefined });
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
          <label>{'链接地址'}</label>
          <Input
            value={url}
            onBlur={handleUrlBlur}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={'https://...'}
          />
        </div>
      </div>
    </aside>
  );
}
