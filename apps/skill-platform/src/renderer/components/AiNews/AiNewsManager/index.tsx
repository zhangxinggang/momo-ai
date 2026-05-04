import { useUIStore } from '@renderer/store';

import { ModelRankingView } from '../ModelRankingView';

import styles from './index.module.less';

/** AI 资讯主内容区 */
export function AiNewsManager() {
  const viewMode = useUIStore((state) => state.viewMode);

  if (viewMode !== 'news') {
    return null;
  }

  return (
    <div className={styles['ai-news-main']}>
      <ModelRankingView />
    </div>
  );
}
