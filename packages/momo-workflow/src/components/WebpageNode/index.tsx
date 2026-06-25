import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import { memo, useCallback } from 'react';

import { useWorkflowEditorContext } from '../../context';
import type { IWorkflowWebpageNodeData } from '../../types';
import styles from './index.module.less';

interface IProps extends NodeProps<Node<IWorkflowWebpageNodeData>> {}

function WebpageNodeInner({ id, data, type, parentId }: IProps) {
  const { onNodeEdit, onNodeDelete, removeNodeById, readOnly } = useWorkflowEditorContext();
  const node: Node<IWorkflowWebpageNodeData> = { id, data, type, position: { x: 0, y: 0 } };
  const title = data.nodeName || data.label || '网页节点';

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onNodeEdit?.({ event: e, node });
    },
    [node, onNodeEdit],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      void (async () => {
        let canRemove = true;
        if (onNodeDelete) {
          const result = await Promise.resolve(onNodeDelete({ event: e, node }));
          if (result === false) {
            canRemove = false;
          }
        }
        if (canRemove) {
          removeNodeById(node.id);
        }
      })();
    },
    [node, onNodeDelete, removeNodeById],
  );

  const rootClass = `${styles['workflow-node']} ${styles['workflow-node--webpage']}`;

  return (
    <div className={rootClass}>
      {!parentId ? (
        <Handle className={styles['workflow-node-handle']} position={Position.Top} type='target' />
      ) : null}
      <div className={styles['workflow-node-body']}>
        <div className={styles['workflow-node-header']}>
          <span className={styles['workflow-node-badge']}>Web</span>
          {!readOnly && (
            <div className={styles['workflow-node-actions']}>
              <button
                aria-label='编辑节点'
                className={styles['workflow-node-action']}
                onClick={handleEdit}
                type='button'>
                <PencilIcon className={styles['workflow-node-action-icon']} />
              </button>
              <button
                aria-label='删除节点'
                className={styles['workflow-node-action']}
                onClick={handleDelete}
                type='button'>
                <Trash2Icon className={styles['workflow-node-action-icon']} />
              </button>
            </div>
          )}
        </div>
        <span className={styles['workflow-node-title']}>{title}</span>
      </div>
      {!parentId ? (
        <Handle
          className={styles['workflow-node-handle']}
          position={Position.Bottom}
          type='source'
        />
      ) : null}
    </div>
  );
}

/** 画布网页节点 */
export const WebpageNode = memo(function WebpageNode(props: IProps) {
  return <WebpageNodeInner {...props} />;
});
