import { FileTextOutlined, FolderOutlined, RightOutlined } from '@ant-design/icons';
import { forwardRef, type Ref } from 'react';

import type { INoteReferenceNode } from '../../types/note-reference';
import styles from './index.module.less';

interface IProps {
  open: boolean;
  tree: INoteReferenceNode[];
  loading: boolean;
  selectedFileId?: string;
  expandedKeys: string[];
  onToggleFolder: (folderId: string) => void;
  onSelectFile: (node: INoteReferenceNode) => void;
}

function renderNodes(
  nodes: INoteReferenceNode[],
  depth: number,
  props: IProps,
): React.ReactNode[] {
  const rows: React.ReactNode[] = [];

  for (const node of nodes) {
    const isFolder = node.kind === 'folder';
    const isExpanded = props.expandedKeys.includes(node.id);
    const isActive = !isFolder && node.id === props.selectedFileId;

    rows.push(
      <button
        key={node.id}
        type='button'
        role='option'
        aria-selected={isActive}
        className={`${styles['note-popover-node']} ${
          isFolder ? styles['note-popover-node-folder'] : ''
        } ${isActive ? styles['note-popover-node-active'] : ''}`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        onMouseDown={(event) => {
          event.preventDefault();
          if (isFolder) {
            props.onToggleFolder(node.id);
            return;
          }
          props.onSelectFile(node);
        }}>
        {isFolder ? (
          <RightOutlined
            className={styles['note-popover-node-icon']}
            style={{
              fontSize: 10,
              transform: isExpanded ? 'rotate(90deg)' : undefined,
              transition: 'transform 0.15s',
            }}
          />
        ) : (
          <span className={styles['note-popover-node-icon']} style={{ width: 10 }} />
        )}
        <span className={styles['note-popover-node-icon']}>
          {isFolder ? <FolderOutlined /> : <FileTextOutlined />}
        </span>
        <span className='truncate'>{node.name}</span>
      </button>,
    );

    if (isFolder && isExpanded && node.children?.length) {
      rows.push(...renderNodes(node.children, depth + 1, props));
    }
  }

  return rows;
}

export const NoteReferencePopover = forwardRef(function NoteReferencePopover(
  props: IProps,
  ref: Ref<HTMLDivElement>,
) {
  const { open, tree, loading } = props;

  if (!open) {
    return null;
  }

  return (
    <div ref={ref} className={styles['note-popover']} role='listbox' aria-label='笔记引用'>
      <div className={styles['note-popover-header']}>
        {loading ? '加载笔记...' : '选择笔记引用'}
      </div>
      <div className={styles['note-popover-list']}>
        {tree.length === 0 && !loading ? (
          <div className={styles['note-popover-empty']}>无匹配笔记</div>
        ) : (
          renderNodes(tree, 0, props)
        )}
      </div>
    </div>
  );
});
