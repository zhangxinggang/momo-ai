import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import {
  BracesIcon,
  Code2Icon,
  FileDigitIcon,
  HashIcon,
  ImageIcon,
  LinkIcon,
  WrenchIcon,
} from 'lucide-react';

import type { IToolboxCardItem } from '../utils';
import styles from './index.module.less';

interface IProps {
  toolTitle: string;
  cards: IToolboxCardItem[];
  activeCardKey: string;
  onSelectCard: (cardKey: string) => void;
}

const CARD_ICON_RULES: Array<{ pattern: RegExp; icon: LucideIcon }> = [
  { pattern: /base64|编解码/i, icon: Code2Icon },
  { pattern: /url/i, icon: LinkIcon },
  { pattern: /图片|image/i, icon: ImageIcon },
  { pattern: /哈希|hash/i, icon: HashIcon },
  { pattern: /json/i, icon: BracesIcon },
  { pattern: /文件|file/i, icon: FileDigitIcon },
];

function resolveCardIcon(title: string): LucideIcon {
  const matched = CARD_ICON_RULES.find((rule) => rule.pattern.test(title));
  return matched?.icon ?? WrenchIcon;
}

/** 工具箱卡片列表（非 childrenInLeaf 模式） */
export function ToolboxCardGrid(props: IProps) {
  const { toolTitle, cards, activeCardKey, onSelectCard } = props;

  return (
    <div className={styles['toolbox-card-grid']}>
      <div className={styles['toolbox-card-grid-header']}>
        <h2 className={styles['toolbox-card-grid-title']}>{toolTitle}</h2>
        <p className={styles['toolbox-card-grid-desc']}>{'选择下方工具卡片开始使用'}</p>
      </div>
      <div className={styles['toolbox-card-grid-list']}>
        {cards.map((card) => {
          const Icon = resolveCardIcon(card.title);
          const isActive = activeCardKey === card.key;
          const tabCount = card.tabs.length;

          return (
            <button
              key={card.key}
              type='button'
              className={clsx(
                styles['toolbox-card-grid-card'],
                isActive && styles['toolbox-card-grid-card--active'],
              )}
              onClick={() => onSelectCard(card.key)}>
              <span className={styles['toolbox-card-grid-card-icon']}>
                <Icon className='h-4 w-4' />
              </span>
              <span className={styles['toolbox-card-grid-card-title']}>{card.title}</span>
              <span className={styles['toolbox-card-grid-card-meta']}>
                {tabCount > 1 ? `${tabCount} 个入口` : '点击进入'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
