import { BarChartOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { clsx } from 'clsx';

import { useUIStore } from '@renderer/store';

import styles from './index.module.less';

/** AI 资讯侧栏二级菜单 */
export function AiNewsPanel() {
  const viewMode = useUIStore((state) => state.viewMode);
  const activeNewsSection = useUIStore((state) => state.activeNewsSection);
  const setActiveNewsSection = useUIStore((state) => state.setActiveNewsSection);

  if (viewMode !== 'news') {
    return null;
  }

  return (
    <div className={styles['ai-news-panel']}>
      <div className={styles['ai-news-panel-list']}>
        <Button
          type={activeNewsSection === 'model-ranking' ? 'primary' : 'text'}
          block
          icon={<BarChartOutlined />}
          className={clsx(styles['ai-news-panel-item'], {
            [styles['ai-news-panel-item--active']]: activeNewsSection === 'model-ranking',
          })}
          onClick={() => setActiveNewsSection('model-ranking')}>
          {'模型排行'}
        </Button>
      </div>
    </div>
  );
}
