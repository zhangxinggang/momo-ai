import { Input } from 'antd';
import { FilePlusIcon, FolderPlusIcon, SearchIcon, XIcon } from 'lucide-react';
import type { ChangeEvent, ReactNode } from 'react';
import styles from './index.module.less';

export interface IProps {
  /** 为 false 时不渲染（侧栏折叠等场景） */
  visible?: boolean;
  /** 分区标题，如「目录」 */
  sectionLabel: string;
  searchPlaceholder: string;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  clearSearchLabel?: string;
  /** 新建目录 */
  onCreateDirectory?: () => void;
  createDirectoryTitle?: string;
  /** 新建条目（笔记、提示词等） */
  onCreateItem?: () => void;
  createItemTitle?: string;
  /** 自定义右侧操作区 */
  extraActions?: ReactNode;
}

export function MomoTreeToolbar({
  visible = true,
  sectionLabel,
  searchPlaceholder,
  searchQuery,
  onSearchQueryChange,
  clearSearchLabel = '清除搜索',
  onCreateDirectory,
  createDirectoryTitle,
  onCreateItem,
  createItemTitle,
  extraActions,
}: IProps) {
  if (!visible) {
    return null;
  }

  const hasBuiltinActions = Boolean(onCreateDirectory || onCreateItem);
  const showActions = Boolean(extraActions) || hasBuiltinActions;

  return (
    <div className={styles['momo-tree-toolbar']}>
      <div className={styles['momo-tree-toolbar-header']}>
        <span className={styles['momo-tree-toolbar-label']}>{sectionLabel}</span>
        {showActions ? (
          <div className={styles['momo-tree-toolbar-actions']}>
            {extraActions}
            {onCreateDirectory ? (
              <button
                type='button'
                className={styles['momo-tree-toolbar-action']}
                title={createDirectoryTitle}
                onClick={onCreateDirectory}
                aria-label={createDirectoryTitle}>
                <FolderPlusIcon className='h-4 w-4' />
              </button>
            ) : null}
            {onCreateItem ? (
              <button
                type='button'
                className={styles['momo-tree-toolbar-action']}
                title={createItemTitle}
                onClick={onCreateItem}
                aria-label={createItemTitle}>
                <FilePlusIcon className='h-4 w-4' />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={styles['momo-tree-toolbar-search']}>
        <Input
          allowClear
          variant='borderless'
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchQueryChange(e.target.value)}
          className={styles['momo-tree-toolbar-search-input']}
          prefix={<SearchIcon className={styles['momo-tree-toolbar-search-icon']} />}
          suffix={
            searchQuery ? (
              <button
                type='button'
                className={styles['momo-tree-toolbar-search-clear']}
                onClick={() => onSearchQueryChange('')}
                aria-label={clearSearchLabel}>
                <XIcon className='h-3.5 w-3.5' />
              </button>
            ) : null
          }
        />
      </div>
    </div>
  );
}
