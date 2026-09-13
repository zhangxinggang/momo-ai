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

const CATEGORY_LABELS: Record<string, string> = {
  general: '通用',
  office: '办公',
  dev: '开发',
  ai: 'AI',
  data: '数据',
  management: '管理',
  deploy: '部署',
  design: '设计',
  security: '安全',
  meta: '元技能',
};

function getGroupKey(item: ISlashCommandItem): string {
  if (item.scope === 'application') return 'application-skills';
  if (item.kind === 'command') return `${item.scope}-commands`;
  return `${item.scope}-skills`;
}

function getGroupLabel(item: ISlashCommandItem): string {
  if (item.scope === 'application') return 'momo-ai 技能';
  if (item.scope === 'project') return item.kind === 'skill' ? '项目技能' : '项目命令';
  return item.kind === 'skill' ? 'Agent 全局技能' : 'Agent 全局命令';
}

export function SlashCommandPopover(props: IProps) {
  const { open, items, selectedIndex, loading, warning, title, onSelect, onHover } = props;
  if (!open) {
    return null;
  }

  return (
    <div className={styles['slash-popover']} role='listbox' aria-label='技能与命令'>
      <div className={styles['slash-popover-header']}>
        <span>{loading ? '加载资源...' : title || '技能与命令'}</span>
        <span className={styles['slash-popover-header-meta']}>
          {warning || (loading ? '正在读取可用资源' : `${items.length} 项 · 输入名称或标签筛选`)}
        </span>
      </div>
      <div className={styles['slash-popover-list']}>
        {items.length === 0 && !loading ? (
          <div className={styles['slash-popover-empty']}>无匹配资源</div>
        ) : (
          items.map((item, index) => {
            const previous = items[index - 1];
            const showGroup = !previous || getGroupKey(previous) !== getGroupKey(item);
            return (
              <Fragment key={item.resourceId}>
                {showGroup ? (
                  <div className={styles['slash-popover-group-title']}>{getGroupLabel(item)}</div>
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
                    <span className={styles['slash-popover-item-icon']} aria-hidden>
                      {item.kind === 'skill' ? '✦' : '›_'}
                    </span>
                    <span className={styles['slash-popover-item-command']}>{item.label}</span>
                    {item.label !== item.command ? (
                      <span className={styles['slash-popover-item-slash']}>{item.command}</span>
                    ) : null}
                    <span className={styles['slash-popover-item-group']}>
                      {item.scope === 'application'
                        ? CATEGORY_LABELS[item.category || 'general'] || item.category || '应用'
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
              </Fragment>
            );
          })
        )}
      </div>
    </div>
  );
}
