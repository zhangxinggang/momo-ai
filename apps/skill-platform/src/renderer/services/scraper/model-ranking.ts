import { getImageScenarioModels, getModelsByType } from '@renderer/services/ai/defaults';
import type { IAIModelConfig } from '@renderer/types/settings';

export interface IRankedModelInfo {
  rank: number;
  name: string;
  score: string;
}

interface IScrapeRankingResult {
  success: boolean;
  data?: IRankedModelInfo[];
  cachedAt?: number;
  error?: string;
}

export interface IChatModelOption {
  id: string;
  label: string;
  group: 'chat' | 'image';
}

const CHAT_GROUP_LABEL = '对话';
const IMAGE_GROUP_LABEL = '图像';

function normalizeModelName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getRankingIndex(model: IAIModelConfig, ranking: IRankedModelInfo[]): number {
  const modelKeys = [model.model, model.name ?? ''].map(normalizeModelName).filter(Boolean);
  if (modelKeys.length === 0) {
    return Number.MAX_SAFE_INTEGER;
  }

  for (const item of ranking) {
    const rankKey = normalizeModelName(item.name);
    if (!rankKey) {
      continue;
    }
    if (modelKeys.some((key) => key.includes(rankKey) || rankKey.includes(key))) {
      return item.rank;
    }
  }

  return Number.MAX_SAFE_INTEGER;
}

function sortModelsByRanking(
  models: IAIModelConfig[],
  ranking: IRankedModelInfo[],
): IAIModelConfig[] {
  return [...models].sort((a, b) => {
    const rankDiff = getRankingIndex(a, ranking) - getRankingIndex(b, ranking);
    if (rankDiff !== 0) {
      return rankDiff;
    }
    return (a.name ?? a.model).localeCompare(b.name ?? b.model);
  });
}

/** 获取 CocoLoop 模型排行（一天缓存一次，由主进程处理） */
export async function fetchModelRanking(): Promise<IScrapeRankingResult> {
  if (typeof window.api?.scraper?.getModelRanking !== 'function') {
    return { success: false, error: '当前环境不支持模型排行' };
  }
  return window.api.scraper.getModelRanking();
}

/** 按排行顺序构建分组模型选项：对话 / 图像 */
export function buildGroupedChatModelOptions(
  aiModels: IAIModelConfig[],
  ranking: IRankedModelInfo[],
): IChatModelOption[] {
  const chatModels = sortModelsByRanking(getModelsByType(aiModels, 'chat'), ranking);
  const imageModels = sortModelsByRanking(getImageScenarioModels(aiModels), ranking);

  const chatOptions: IChatModelOption[] = chatModels.map((model) => ({
    id: model.id,
    label: model.name?.trim() || model.model,
    group: 'chat',
  }));

  const imageOptions: IChatModelOption[] = imageModels.map((model) => ({
    id: model.id,
    label: model.name?.trim() || model.model,
    group: 'image',
  }));

  return [...chatOptions, ...imageOptions];
}

export function toAntdModelSelectOptions(options: IChatModelOption[]) {
  const chatItems = options
    .filter((item) => item.group === 'chat')
    .map((item) => ({ value: item.id, label: item.label }));
  const imageItems = options
    .filter((item) => item.group === 'image')
    .map((item) => ({ value: item.id, label: item.label }));

  const grouped = [];
  if (chatItems.length > 0) {
    grouped.push({ label: CHAT_GROUP_LABEL, options: chatItems });
  }
  if (imageItems.length > 0) {
    grouped.push({ label: IMAGE_GROUP_LABEL, options: imageItems });
  }
  return grouped;
}
