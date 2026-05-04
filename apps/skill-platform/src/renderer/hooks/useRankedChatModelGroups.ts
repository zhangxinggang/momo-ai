import { useEffect, useMemo, useState } from 'react';

import {
  buildGroupedChatModelOptions,
  fetchModelRanking,
  toAntdModelSelectOptions,
  type IRankedModelInfo,
} from '@renderer/services/scraper/model-ranking';
import type { IAIModelConfig } from '@renderer/types/settings';

/** 拉取排行并生成分组模型选项 */
export function useRankedChatModelGroups(aiModels: IAIModelConfig[]) {
  const [ranking, setRanking] = useState<IRankedModelInfo[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await fetchModelRanking();
      if (!cancelled && result.success && result.data) {
        setRanking(result.data);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chatModelOptionGroups = useMemo(() => {
    const grouped = buildGroupedChatModelOptions(aiModels, ranking);
    return toAntdModelSelectOptions(grouped).map((group) => ({
      label: group.label,
      options: group.options.map((item) => ({
        id: String(item.value),
        label: String(item.label),
      })),
    }));
  }, [aiModels, ranking]);

  return chatModelOptionGroups;
}
