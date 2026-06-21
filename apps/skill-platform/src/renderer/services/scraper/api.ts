import { getScraperIpc } from '../ipc';

export function getScraperApi() {
  return getScraperIpc();
}

export function isScraperApiAvailable(): boolean {
  return !!getScraperIpc()?.getModelRanking;
}

export async function fetchScraperModelRanking(): Promise<{
  success: boolean;
  data?: { rank: number; name: string; score: string }[];
  cachedAt?: number;
  error?: string;
}> {
  const scraper = getScraperIpc();
  if (!scraper?.getModelRanking) {
    return { success: false, error: '当前环境不支持模型排行' };
  }
  return scraper.getModelRanking();
}
