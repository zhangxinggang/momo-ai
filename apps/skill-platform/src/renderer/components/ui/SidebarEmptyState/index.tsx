import { Empty } from 'antd';
import type { ReactNode } from 'react';

import styles from './index.module.less';

interface IProps {
  description: string;
  action?: ReactNode;
}

/** 侧栏二级菜单空态，样式对齐 AI 对话「暂无对话记录」 */
export function SidebarEmptyState({ description, action }: IProps) {
  return (
    <div className={styles['sidebar-empty']}>
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />
      {action ? <div className={styles['sidebar-empty-action']}>{action}</div> : null}
    </div>
  );
}
