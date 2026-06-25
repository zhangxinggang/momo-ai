import { FileTextOutlined, FolderOutlined, RightOutlined } from '@ant-design/icons';
import {
  forwardRef,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type Ref,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

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
  /** 输入框锚点，用于 Portal 定位（避免 overflow:hidden 父级裁切） */
  anchorRef?: RefObject<HTMLElement | null>;
}

function renderNodes(nodes: INoteReferenceNode[], depth: number, props: IProps): React.ReactNode[] {
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

function resolvePortalStyle(anchor: HTMLElement): CSSProperties {
  const rect = anchor.getBoundingClientRect();
  const gap = 6;
  const maxHeight = Math.min(260, Math.max(120, rect.top - 16));

  return {
    position: 'fixed',
    left: rect.left,
    width: rect.width,
    bottom: window.innerHeight - rect.top + gap,
    maxHeight,
    zIndex: 1100,
  };
}

export const NoteReferencePopover = forwardRef(function NoteReferencePopover(
  props: IProps,
  ref: Ref<HTMLDivElement>,
) {
  const { open, tree, loading, anchorRef } = props;
  const [portalStyle, setPortalStyle] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef?.current) {
      setPortalStyle(null);
      return;
    }

    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) {
        return;
      }
      setPortalStyle(resolvePortalStyle(anchor));
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [anchorRef, loading, open, tree]);

  if (!open) {
    return null;
  }

  const content = (
    <div
      ref={ref}
      className={`${styles['note-popover']} ${anchorRef ? styles['note-popover-portal'] : ''}`}
      style={anchorRef ? (portalStyle ?? undefined) : undefined}
      role='listbox'
      aria-label='笔记引用'>
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

  if (anchorRef) {
    if (!portalStyle) {
      return null;
    }
    return createPortal(content, document.body);
  }

  return content;
});
