import { ArrowLeftIcon } from 'lucide-react';

import styles from './index.module.less';

interface IProps {
  title: string;
  onBack: () => void;
}

/** 工具箱详情顶栏：返回上一级 */
export function ToolboxDetailHeader(props: IProps) {
  const { title, onBack } = props;

  return (
    <div className={styles['toolbox-detail-header']}>
      <button type='button' className={styles['toolbox-detail-header-back']} onClick={onBack}>
        <ArrowLeftIcon className='h-4 w-4' />
        <span>{'返回'}</span>
      </button>
      <span className={styles['toolbox-detail-header-title']}>{title}</span>
    </div>
  );
}
