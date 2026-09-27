import { Folder, Search, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, type KeyboardEvent, type ReactNode } from 'react';

import type { ISlashCommandItem } from '../../types/slash-command';
import {
  buildSlashCommandTree,
  SLASH_SKILL_CATEGORY_LABELS,
  type SlashCommandTreeNode,
} from '../../utils/slash-command-tree';
import styles from './index.module.less';

export interface IProps {
  open: boolean;
  items: ISlashCommandItem[];
  selectedIndex: number;
  loading?: boolean;
  warning?: string;
  query?: string;
  onQueryChange?: (query: string) => void;
  onSearchKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSelect: (index: number) => void;
  onHover: (index: number) => void;
}

export function SlashCommandPopover(props: IProps) {
  const {
    open,
    items,
    selectedIndex,
    loading,
    warning,
    query = '',
    onQueryChange,
    onSearchKeyDown,
    onSelect,
    onHover,
  } = props;
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { tree } = useMemo(() => buildSlashCommandTree(items), [items]);
  useEffect(() => {
    if (open && !loading) {
      listRef.current
        ?.querySelector<HTMLElement>('[aria-selected="true"]')
        ?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [open, loading, selectedIndex, items]);
  if (!open) {
    return null;
  }

  const renderNodes = (nodes: SlashCommandTreeNode[], depth = 0): ReactNode =>
    nodes.map((node) => {
      if (node.type !== 'item') {
        return (
          <div key={node.key} role='group' aria-label={node.label}>
            <div
              className={
                styles[
                  node.type === 'group' ? 'slash-popover-group-title' : 'slash-popover-directory'
                ]
              }
              style={{ paddingInlineStart: 8 + depth * 14 }}>
              {node.type === 'directory' ? <Folder size={13} aria-hidden /> : null}
              <span>{node.label}</span>
            </div>
            {renderNodes(node.children, node.type === 'group' ? 0 : depth + 1)}
          </div>
        );
      }
      const { item, index } = node;
      return (
        <button
          key={node.key}
          id={`${listId}-option-${index}`}
          type='button'
          role='option'
          aria-selected={index === selectedIndex}
          className={
            styles['slash-popover-item'] +
            (index === selectedIndex ? ' ' + styles['slash-popover-item-active'] : '')
          }
          style={{ paddingInlineStart: 8 + depth * 14 }}
          onMouseEnter={() => onHover(index)}
          onMouseDown={(event) => {
            event.preventDefault();
            onSelect(index);
          }}>
          <div className={styles['slash-popover-item-row']}>
            <span className={styles['slash-popover-item-icon']} aria-hidden>
              {item.kind === 'skill' ? '✦' : '›_'}
            </span>
            <span className={styles['slash-popover-item-command']}>{item.label}</span>
            {item.label !== item.command ? (
              <span className={styles['slash-popover-item-slash']}>{item.command}</span>
            ) : null}
            <span className={styles['slash-popover-item-group']}>
              {item.scope === 'application'
                ? SLASH_SKILL_CATEGORY_LABELS[item.category || 'general'] || item.category || '应用'
                : item.scope === 'project'
                  ? '项目'
                  : '全局'}
            </span>
          </div>
          {item.description ? (
            <span className={styles['slash-popover-item-desc']}>{item.description}</span>
          ) : null}
          {item.tags?.length ? (
            <span className={styles['slash-popover-item-tags']}>
              {item.tags.slice(0, 3).map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </span>
          ) : null}
        </button>
      );
    });

  return (
    <div className={styles['slash-popover']}>
      <div className={styles['slash-popover-header']}>
        <span>技能与命令</span>
        <span className={styles['slash-popover-header-meta']}>
          {warning || (loading ? '正在读取可用资源' : `${items.length} 项`)}
        </span>
      </div>
      {onQueryChange ? (
        <div className={styles['slash-popover-search']}>
          <Search size={14} aria-hidden />
          <input
            ref={searchRef}
            type='text'
            role='combobox'
            aria-label='查找技能或命令'
            aria-controls={listId}
            aria-expanded={open}
            aria-autocomplete='list'
            aria-activedescendant={
              items[selectedIndex] ? `${listId}-option-${selectedIndex}` : undefined
            }
            placeholder='查找名称、描述、标签或目录'
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={onSearchKeyDown}
          />
          {query ? (
            <button
              type='button'
              aria-label='清空搜索'
              onClick={() => {
                onQueryChange('');
                searchRef.current?.focus();
              }}>
              <X size={14} aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}
      <div
        ref={listRef}
        id={listId}
        className={styles['slash-popover-list']}
        role='listbox'
        aria-label='技能与命令'
        aria-busy={loading}>
        {items.length === 0 && !loading ? (
          <div className={styles['slash-popover-empty']}>
            {query ? '没有找到匹配的技能或命令' : '暂无可用技能或命令'}
          </div>
        ) : (
          renderNodes(tree)
        )}
      </div>
    </div>
  );
}
