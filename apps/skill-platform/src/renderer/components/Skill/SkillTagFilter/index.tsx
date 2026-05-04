import { clsx } from 'clsx';
import { HashIcon, LayoutGridIcon } from 'lucide-react';

import styles from './index.module.less';

interface IProps {
  tags: string[];
  activeTag: string | null;
  onSelectAll: () => void;
  onSelectTag: (tag: string) => void;
}

/**
 * 技能列表标签过滤：平铺 Chip，左侧「全部」默认选中，单选
 */
export function SkillTagFilter({ tags, activeTag, onSelectAll, onSelectTag }: IProps) {
  const isAllSelected = activeTag === null;

  return (
    <section aria-label='标签过滤' className={styles['skill-tag-filter']}>
      <div className={styles['skill-tag-filter-track']} role='group'>
        <button
          aria-pressed={isAllSelected}
          className={clsx(
            styles['skill-tag-filter-chip'],
            styles['skill-tag-filter-chip--all'],
            isAllSelected && styles['skill-tag-filter-chip--active'],
          )}
          onClick={onSelectAll}
          type='button'>
          <LayoutGridIcon
            aria-hidden
            className={clsx('h-3.5 w-3.5', styles['skill-tag-filter-chip-icon'])}
          />
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
              <HashIcon
                aria-hidden
                className={clsx('h-3 w-3', styles['skill-tag-filter-chip-icon'])}
              />
              <span className={styles['skill-tag-filter-chip-label']}>{tag}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
