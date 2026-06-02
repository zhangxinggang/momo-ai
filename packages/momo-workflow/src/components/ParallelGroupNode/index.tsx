import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { memo, useCallback } from 'react';

import { useWorkflowEditorContext } from '../../context';
import type { IWorkflowParallelNodeData } from '../../types';
import { isPaletteDragEvent } from '../../types';
import styles from './index.module.less';

function ParallelGroupNodeInner({ id, data }: NodeProps<Node<IWorkflowParallelNodeData>>) {
  const { parallelDropState, setParallelDropHighlight, clearParallelDropHighlight, readOnly } =
    useWorkflowEditorContext();
  const isEmpty = (data.childNodeIds?.length ?? 0) === 0;
  const dropKind = parallelDropState?.parallelId === id ? parallelDropState.kind : null;

  const rootClass = [
    styles['parallel-group'],
    dropKind === 'valid' ? styles['parallel-group--drop-valid'] : '',
    dropKind === 'invalid' ? styles['parallel-group--drop-invalid'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      if (readOnly || !isPaletteDragEvent(event.nativeEvent)) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      setParallelDropHighlight(id, 'valid');
    },
    [id, readOnly, setParallelDropHighlight],
  );

  const handleDragEnter = useCallback(
    (event: React.DragEvent) => {
      if (readOnly || !isPaletteDragEvent(event.nativeEvent)) {
        return;
      }
      event.preventDefault();
      setParallelDropHighlight(id, 'valid');
    },
    [id, readOnly, setParallelDropHighlight],
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent) => {
      if (readOnly) {
        return;
      }
      const related = event.relatedTarget as globalThis.Node | null;
      if (related && event.currentTarget.contains(related)) {
        return;
      }
      if (parallelDropState?.parallelId === id) {
        clearParallelDropHighlight();
      }
    },
    [clearParallelDropHighlight, id, parallelDropState?.parallelId, readOnly],
  );

  return (
    <div
      className={rootClass}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}>
      <Handle className={styles['parallel-group-handle']} position={Position.Top} type='target' />
      <div className={styles['parallel-group-header']}>{data.label ?? '并行节点'}</div>
      <div className={styles['parallel-group-body']}>
        {isEmpty ? (
          <div className={styles['parallel-group-placeholder']}>{'请拖入节点'}</div>
        ) : null}
      </div>
      <Handle
        className={styles['parallel-group-handle']}
        position={Position.Bottom}
        type='source'
      />
    </div>
  );
}

export const ParallelGroupNode = memo(ParallelGroupNodeInner);
