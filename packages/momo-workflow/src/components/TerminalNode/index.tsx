import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';

import type { IWorkflowTerminalNodeData } from '../../types';
import styles from './index.module.less';

interface IProps extends NodeProps<Node<IWorkflowTerminalNodeData>> {
  badgeLabel: string;
  variant: 'start' | 'end';
}

function TerminalNodeInner({ badgeLabel, variant, data }: IProps) {
  const title = data.label || badgeLabel;
  const rootClass =
    variant === 'start'
      ? `${styles['workflow-terminal']} ${styles['workflow-terminal--start']}`
      : `${styles['workflow-terminal']} ${styles['workflow-terminal--end']}`;

  return (
    <div className={rootClass}>
      {variant === 'end' ? (
        <Handle
          className={styles['workflow-terminal-handle']}
          position={Position.Top}
          type='target'
        />
      ) : null}
      <div className={styles['workflow-terminal-body']}>
        <span className={styles['workflow-terminal-badge']}>{badgeLabel}</span>
        <span className={styles['workflow-terminal-title']}>{title}</span>
      </div>
      {variant === 'start' ? (
        <Handle
          className={styles['workflow-terminal-handle']}
          position={Position.Bottom}
          type='source'
        />
      ) : null}
    </div>
  );
}

export const StartTerminalNode = memo(function StartTerminalNode(
  props: NodeProps<Node<IWorkflowTerminalNodeData>>,
) {
  return <TerminalNodeInner {...props} badgeLabel='Start' variant='start' />;
});

export const EndTerminalNode = memo(function EndTerminalNode(
  props: NodeProps<Node<IWorkflowTerminalNodeData>>,
) {
  return <TerminalNodeInner {...props} badgeLabel='End' variant='end' />;
});
