import { Tabs } from 'antd';
import { useMemo } from 'react';

import { useUIStore } from '@renderer/store';

import styles from './index.module.less';
import { RankingWebview } from './RankingWebview';

const COCOLOOP_URL = 'https://top.cocoloop.cn/image';
const HUGGINGFACE_URL = 'https://huggingface.co/spaces/lmarena-ai/arena-leaderboard';

/** 模型排行主内容区：CocoLoop / HuggingFace 两个 Tab */
export function ModelRankingView() {
  const activeNewsSection = useUIStore((state) => state.activeNewsSection);

  const tabItems = useMemo(
    () => [
      {
        key: 'cocoloop',
        label: 'CocoLoop',
        children: <RankingWebview src={COCOLOOP_URL} title='CocoLoop 模型排行' />,
      },
      {
        key: 'huggingface',
        label: 'HuggingFace',
        children: <RankingWebview src={HUGGINGFACE_URL} title='HuggingFace 模型排行' />,
      },
    ],
    [],
  );

  if (activeNewsSection !== 'model-ranking') {
    return null;
  }

  return (
    <div className={styles['model-ranking']}>
      <Tabs
        className={styles['model-ranking-tabs']}
        items={tabItems}
        destroyInactiveTabPane={false}
      />
    </div>
  );
}
