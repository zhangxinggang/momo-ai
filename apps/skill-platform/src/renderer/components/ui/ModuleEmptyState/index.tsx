import { Typography } from 'antd';
import type { LucideIcon } from 'lucide-react';

import styles from './index.module.less';

interface IProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** 是否垂直居中（工作流主体区域） */
  centered?: boolean;
}

/** 模块空状态：样式参考工作流列表为空 */
export function ModuleEmptyState({ icon: Icon, title, description, centered = false }: IProps) {
  return (
    <div className={centered ? styles['module-empty--centered'] : styles['module-empty']}>
      <div className={styles['module-empty-icon-wrap']}>
        <Icon className={styles['module-empty-icon']} />
      </div>
      <Typography.Text className={styles['module-empty-title']}>{title}</Typography.Text>
      <Typography.Text className={styles['module-empty-desc']} type='secondary'>
        {description}
      </Typography.Text>
    </div>
  );
}
