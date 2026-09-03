import { Fragment } from 'react';

import type { ISlashCommandItem } from '../../types/slash-command';
import styles from './index.module.less';

export interface IProps {
  open: boolean;
  items: ISlashCommandItem[];
  selectedIndex: number;
  loading?: boolean;
  warning?: string;
  title?: string;
  onSelect: (index: number) => void;
  onHover: (index: number) => void;
}

export function SlashCommandPopover(props: IProps) {
  const { open, items, selectedIndex, loading, warning, title, onSelect, onHover } = props;
  if (!open) {
    return null;
  }

  return (
    <div className={styles['slash-popover']} role='listbox' aria-label='Agent 资源'>
      <div className={styles['slash-popover-header']}>
        {loading ? '加载资源...' : warning || title || 'Agent 资源'}
      </div>
      <div className={styles['slash-popover-list']}>
        {items.length === 0 && !loading ? (
          <div className={styles['slash-popover-empty']}>无匹配资源</div>
        ) : (
          items.map((item, index) => {
            const previous = items[index - 1];
            const showGroup = !previous || previous.kind !== item.kind;
            return (
              <Fragment key={item.resourceId}>
                {showGroup ? (
                  <div className={styles['slash-popover-group-title']}>
                    {item.kind === 'skill' ? 'Skills' : 'Commands'}
                  </div>
                ) : null}
                <button
                  type='button'
                  role='option'
                  aria-selected={index === selectedIndex}
                  className={
                    styles['slash-popover-item'] +
                    (index === selectedIndex ? ' ' + styles['slash-popover-item-active'] : '')
                  }
                  onMouseEnter={() => onHover(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onSelect(index);
                  }}>
                  <div className={styles['slash-popover-item-row']}>
                    <span className={styles['slash-popover-item-command']}>{item.label}</span>
                    <span className={styles['slash-popover-item-group']}>
                      {item.scope === 'project' ? '项目' : '全局'}
                    </span>
                  </div>
                  {item.description ? (
                    <span className={styles['slash-popover-item-desc']}>{item.description}</span>
                  ) : null}
                </button>
              </Fragment>
            );
          })
        )}
      </div>
    </div>
  );
}
