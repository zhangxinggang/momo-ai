import { Tooltip } from 'antd';
import { clsx } from 'clsx';
import { SearchIcon, SettingsIcon, TagsIcon, XIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

import styles from './index.module.less';

interface IProps {
  tags: string[];
  activeTag: string | null;
  onSearchChange: (query: string) => void;
  onSelectAll: () => void;
  onSelectTag: (tag: string) => void;
  onManageTags: () => void;
  resultCount: number;
  searchPlaceholder?: string;
  searchQuery: string;
}

/** 技能列表的搜索与标签索引栏。 */
export function SkillTagFilter({
  tags,
  activeTag,
  onSearchChange,
  onSelectAll,
  onSelectTag,
  onManageTags,
  resultCount,
  searchPlaceholder = '搜索技能名称、描述或标签',
  searchQuery,
}: IProps) {
  const isAllSelected = activeTag === null;
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleSearchShortcut = () => searchInputRef.current?.focus();
    window.addEventListener('shortcut:search', handleSearchShortcut);
    return () => window.removeEventListener('shortcut:search', handleSearchShortcut);
  }, []);

  return (
    <section aria-label='技能搜索与标签过滤' className={styles['skill-tag-filter']}>
      <div className={clsx('app-wallpaper-panel-strong', styles['skill-filter-panel'])}>
        <div className={styles['skill-filter-search']} role='search'>
          <SearchIcon aria-hidden='true' className={styles['skill-filter-search-icon']} />
          <input
            ref={searchInputRef}
            aria-label='搜索技能'
            className={styles['skill-filter-search-input']}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                onSearchChange('');
                searchInputRef.current?.blur();
              }
            }}
            placeholder={searchPlaceholder}
            type='search'
            value={searchQuery}
          />
          {searchQuery ? (
            <>
              <span aria-live='polite' className={styles['skill-filter-search-count']}>
                {`${resultCount} 项`}
              </span>
              <button
                aria-label='清除搜索'
                className={styles['skill-filter-search-clear']}
                onClick={() => {
                  onSearchChange('');
                  searchInputRef.current?.focus();
                }}
                type='button'>
                <XIcon className='h-3.5 w-3.5' />
              </button>
            </>
          ) : null}
        </div>

        <div aria-hidden='true' className={styles['skill-filter-divider']} />

        <div className={styles['skill-filter-tags']}>
          <div className={styles['skill-filter-tags-label']}>
            <TagsIcon aria-hidden='true' className='h-3.5 w-3.5' />
            <span>{'标签'}</span>
          </div>
          <div
            aria-label='按标签筛选技能'
            className={styles['skill-tag-filter-track']}
            role='group'>
            <button
              aria-pressed={isAllSelected}
              className={clsx(
                styles['skill-tag-filter-chip'],
                styles['skill-tag-filter-chip--all'],
                isAllSelected && styles['skill-tag-filter-chip--active'],
              )}
              onClick={onSelectAll}
              type='button'>
              <span className={styles['skill-tag-filter-chip-label']}>{'全部'}</span>
            </button>
            {tags.map((tag) => {
              const isActive = activeTag === tag;
              return (
                <button
                  aria-pressed={isActive}
                  className={clsx(
                    styles['skill-tag-filter-chip'],
                    isActive && styles['skill-tag-filter-chip--active'],
                  )}
                  key={tag}
                  onClick={() => onSelectTag(tag)}
                  title={tag}
                  type='button'>
                  <span className={styles['skill-tag-filter-chip-label']}>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Tooltip title='标签管理'>
          <button
            aria-label='标签管理'
            className={styles['skill-tag-filter-manage']}
            onClick={onManageTags}
            type='button'>
            <SettingsIcon className='h-3.5 w-3.5' />
            <span className={styles['skill-tag-filter-manage-label']}>{'管理标签'}</span>
          </button>
        </Tooltip>
      </div>
    </section>
  );
}
