import type { ISlashCommandItem } from '../../types/slash-command';
import styles from './index.module.less';

export interface IProps {
  open: boolean;
  items: ISlashCommandItem[];
  selectedIndex: number;
  loading?: boolean;
  warning?: string;
  onSelect: (index: number) => void;
  onHover: (index: number) => void;
}

export function SlashCommandPopover(props: IProps) {
  const { open, items, selectedIndex, loading, warning, onSelect, onHover } = props;

  if (!open) {
    return null;
  }

  return (
    <div className={styles['slash-popover']} role='listbox' aria-label='斜杠命令'>
      <div className={styles['slash-popover-header']}>
        {loading ? '加载命令...' : warning ? warning : 'Claude Code 命令'}
      </div>
      <div className={styles['slash-popover-list']}>
        {items.length === 0 && !loading ? (
          <div className={styles['slash-popover-empty']}>{'无匹配命令'}</div>
        ) : (
          items.map((item, index) => (
            <button
              key={`${item.command}-${index}`}
              type='button'
              role='option'
              aria-selected={index === selectedIndex}
              className={`${styles['slash-popover-item']} ${
                index === selectedIndex ? styles['slash-popover-item-active'] : ''
              }`}
              onMouseEnter={() => onHover(index)}
              onMouseDown={(event) => {
                event.preventDefault();
                onSelect(index);
              }}>
              <div className={styles['slash-popover-item-row']}>
                <span className={styles['slash-popover-item-command']}>{item.label}</span>
                {item.group ? (
                  <span className={styles['slash-popover-item-group']}>{item.group}</span>
                ) : null}
              </div>
              {item.description ? (
                <span className={styles['slash-popover-item-desc']}>{item.description}</span>
              ) : null}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
