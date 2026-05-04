import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { app, ipcMain } from 'electron';
import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';

interface IModelInfo {
  rank: number;
  name: string;
  score: string;
  organization?: string;
}

interface IScrapeResult {
  success: boolean;
  data?: IModelInfo[];
  error?: string;
  cachedAt?: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000;
const CACHE_FILE = 'cocoloop-model-ranking-cache.json';

interface IRankingCacheFile {
  cachedAt: number;
  data: IModelInfo[];
}

function getCacheFilePath(): string {
  return path.join(app.getPath('userData'), CACHE_FILE);
}

function readCacheFromDisk(): IRankingCacheFile | null {
  try {
    const filePath = getCacheFilePath();
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as IRankingCacheFile;
    if (!parsed?.cachedAt || !Array.isArray(parsed.data)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCacheToDisk(data: IModelInfo[]): void {
  const payload: IRankingCacheFile = {
    cachedAt: Date.now(),
    data,
  };
  fs.writeFileSync(getCacheFilePath(), JSON.stringify(payload), 'utf-8');
}

function getValidCache(): IModelInfo[] | null {
  const diskCache = readCacheFromDisk();
  if (!diskCache) {
    return null;
  }
  if (Date.now() - diskCache.cachedAt >= CACHE_DURATION) {
    return null;
  }
  return diskCache.data;
}

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    client
      .get(url, (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          fetchUrl(res.headers.location).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode && res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

function parseCocoloopHtml(html: string): IModelInfo[] {
  const models: IModelInfo[] = [];
  const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) {
    const rowMatches = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    if (!rowMatches) return models;
    let rank = 1;
    for (const row of rowMatches) {
      const cellMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
      if (cellMatches && cellMatches.length >= 2) {
        const nameCell = cellMatches[1]?.replace(/<[^>]+>/g, '').trim();
        const scoreCell = cellMatches[2]?.replace(/<[^>]+>/g, '').trim();
        if (nameCell && nameCell !== 'Model' && nameCell !== '模型') {
          models.push({ rank, name: nameCell, score: scoreCell || 'N/A' });
          rank++;
          if (rank > 20) break;
        }
      }
    }
  } else {
    const tableHtml = tableMatch[1];
    const rowMatches = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    if (!rowMatches) return models;
    let rank = 1;
    for (const row of rowMatches) {
      const cellMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
      if (cellMatches && cellMatches.length >= 2) {
        const nameCell = cellMatches[1]?.replace(/<[^>]+>/g, '').trim();
        const scoreCell = cellMatches[2]?.replace(/<[^>]+>/g, '').trim();
        if (nameCell && nameCell !== 'Model' && nameCell !== '模型') {
          models.push({ rank, name: nameCell, score: scoreCell || 'N/A' });
          rank++;
          if (rank > 20) break;
        }
      }
    }
  }
  return models;
}

export function registerScraperIPC(): void {
  ipcMain.handle(IPC_CHANNELS.SCRAPE_MODEL_RANKING, async () => {
    const cached = getValidCache();
    if (cached) {
      const diskCache = readCacheFromDisk();
      return { success: true, data: cached, cachedAt: diskCache?.cachedAt } as IScrapeResult;
    }

    try {
      const html = await fetchUrl('https://top.cocoloop.cn/image');
      const models = parseCocoloopHtml(html);
      if (models.length === 0) {
        return { success: false, error: '未能解析模型列表' } as IScrapeResult;
      }
      writeCacheToDisk(models);
      return { success: true, data: models, cachedAt: Date.now() } as IScrapeResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      } as IScrapeResult;
    }
  });
}
