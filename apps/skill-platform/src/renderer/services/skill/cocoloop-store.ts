import type { ESkillCategory, IRegistrySkill } from '@/types/modules';

import { parseFrontmatter } from './github-store';
import { inferCategory } from './store-mapper-utils';

export const COCOLOOP_WEB_BASE_URL = 'https://hub.cocoloop.cn';
export const COCOLOOP_API_BASE_URL = 'https://api.cocoloop.cn';
export const COCOLOOP_DOWNLOAD_BASE_URL = 'https://dl.cocoloop.cn/bss/skills';

const DEFAULT_PAGE_SIZE = 24;
const DEFAULT_COMPATIBILITY = ['claude', 'codex', 'cursor', 'opencode', 'antigravity'];

interface DCocoloopListSkill {
  id?: number;
  icon?: string;
  author?: string;
  name?: string;
  subtitle?: string;
  brief?: string;
  category?: string;
  security_level?: string;
  source_credibility?: string;
  github_stars?: string;
  downloads?: string;
  favorites?: string;
  download_url?: string;
  version?: string;
  tags?: string[] | null;
}

interface DCocoloopListResponse {
  code?: number;
  message?: string;
  data?: {
    items?: DCocoloopListSkill[];
    total?: number;
    page?: number;
    page_size?: number;
    pages?: number;
  };
}

interface DCocoloopDetailSkill extends DCocoloopListSkill {
  summary?: string;
  original_desc?: string;
  security_brief?: string;
  security_summary?: string;
  security_details?: string;
  asset_name?: string;
}

interface DCocoloopDetailResponse {
  code?: number;
  message?: string;
  data?: DCocoloopDetailSkill;
}

export interface ICocoloopStorePageResult {
  skills: IRegistrySkill[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

function normalizeListApiUrl(configUrl?: string): string {
  const trimmed = (configUrl?.trim() || `${COCOLOOP_API_BASE_URL}/api/v1/store/skills`).replace(
    /\/+$/,
    '',
  );
  if (trimmed.endsWith('/store/skills')) {
    return trimmed;
  }
  if (trimmed.endsWith('/api/v1')) {
    return `${trimmed}/store/skills`;
  }
  return `${trimmed}/api/v1/store/skills`;
}

function buildDetailApiUrl(configUrl: string | undefined, skillId: string): string {
  return `${normalizeListApiUrl(configUrl)}/${encodeURIComponent(skillId)}`;
}

export function buildCocoloopDownloadUrl(assetName: string): string {
  const trimmed = assetName.trim().replace(/^\/+/, '');
  if (!trimmed) {
    throw new Error('CocoLoop 下载文件名不能为空');
  }
  return `${COCOLOOP_DOWNLOAD_BASE_URL}/${encodeURIComponent(trimmed)}`;
}

export function isCocoloopDownloadUrl(url?: string | null): boolean {
  if (!url) {
    return false;
  }
  return url.startsWith(`${COCOLOOP_DOWNLOAD_BASE_URL}/`);
}

function buildPlaceholderContent(name: string, description: string): string {
  return `---\nname: ${name}\ndescription: ${description.replace(/\n/g, ' ')}\n---\n\n${description}`;
}

function mapCocoloopCategory(category?: string): ESkillCategory {
  if (!category) {
    return 'general';
  }
  const normalized = category.toLowerCase();
  if (normalized.includes('办公') || normalized.includes('office')) {
    return 'office';
  }
  if (normalized.includes('开发') || normalized.includes('dev') || normalized.includes('工程')) {
    return 'dev';
  }
  if (normalized.includes('设计') || normalized.includes('design')) {
    return 'design';
  }
  if (normalized.includes('运维') || normalized.includes('deploy')) {
    return 'deploy';
  }
  if (normalized.includes('安全') || normalized.includes('security')) {
    return 'security';
  }
  if (normalized.includes('数据') || normalized.includes('data')) {
    return 'data';
  }
  if (normalized.includes('管理') || normalized.includes('management')) {
    return 'management';
  }
  if (normalized.includes('ai') || normalized.includes('智能')) {
    return 'ai';
  }
  return 'general';
}

function buildCocoloopTags(item: DCocoloopListSkill): string[] {
  const tags = new Set<string>(['cocoloop']);
  if (item.security_level?.trim()) {
    tags.add(`security:${item.security_level.trim()}`);
  }
  if (item.source_credibility?.trim()) {
    tags.add(`source:${item.source_credibility.trim()}`);
  }
  if (Array.isArray(item.tags)) {
    item.tags.forEach((tag) => {
      const trimmed = tag?.trim();
      if (trimmed) {
        tags.add(trimmed);
      }
    });
  }
  return Array.from(tags);
}

function resolveDownloadUrl(item: DCocoloopListSkill): string | undefined {
  const direct = item.download_url?.trim();
  if (direct) {
    return direct;
  }
  const assetName = (item as DCocoloopDetailSkill).asset_name?.trim();
  if (assetName) {
    return buildCocoloopDownloadUrl(assetName);
  }
  return undefined;
}

export function mapCocoloopListItem(item: DCocoloopListSkill): IRegistrySkill | null {
  const skillId = item.id != null ? String(item.id).trim() : '';
  const name = item.name?.trim();
  if (!skillId || !name) {
    return null;
  }

  const description = item.brief?.trim() || item.subtitle?.trim() || `${name} skill from CocoLoop`;
  const version = item.version?.trim() || '1.0.0';
  const storeUrl = `${COCOLOOP_WEB_BASE_URL}/skills/${skillId}`;
  const downloadUrl = resolveDownloadUrl(item);

  return {
    slug: skillId,
    name,
    description,
    category: mapCocoloopCategory(item.category) || inferCategory(name, description),
    icon_emoji: item.icon?.trim() || undefined,
    author: item.author?.trim() || 'CocoLoop',
    source_url: storeUrl,
    store_url: storeUrl,
    source_label: 'cocoloop',
    tags: buildCocoloopTags(item),
    version,
    content: buildPlaceholderContent(name, description),
    content_url: downloadUrl,
    compatibility: DEFAULT_COMPATIBILITY,
    weekly_installs: item.downloads?.trim() || undefined,
    github_stars: item.github_stars?.trim() || undefined,
    security_audits: item.security_level?.trim()
      ? [`CLS ${item.security_level.trim()}`]
      : undefined,
  };
}

async function fetchCocoloopListPage(
  fetchJson: (url: string) => Promise<string>,
  listApiUrl: string,
  page: number,
  pageSize: number,
  keyword?: string,
): Promise<DCocoloopListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort: 'downloads',
  });
  const trimmedKeyword = keyword?.trim();
  if (trimmedKeyword) {
    params.set('keyword', trimmedKeyword);
  }
  const raw = await fetchJson(`${listApiUrl}?${params.toString()}`);
  return JSON.parse(raw) as DCocoloopListResponse;
}

export async function loadCocoloopStorePage(
  fetchJson: (url: string) => Promise<string>,
  options?: {
    apiUrl?: string;
    page?: number;
    pageSize?: number;
    keyword?: string;
  },
): Promise<ICocoloopStorePageResult> {
  const listApiUrl = normalizeListApiUrl(options?.apiUrl);
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  const response = await fetchCocoloopListPage(
    fetchJson,
    listApiUrl,
    page,
    pageSize,
    options?.keyword,
  );

  if (response.code !== 0) {
    throw new Error(response.message || 'CocoLoop API 返回错误');
  }

  const items = response.data?.items ?? [];
  const total = response.data?.total ?? items.length;
  const skills = items
    .map((item) => mapCocoloopListItem(item))
    .filter((item): item is IRegistrySkill => item !== null);

  return {
    skills,
    page,
    pageSize,
    total,
    hasMore: page * pageSize < total,
  };
}

export async function fetchCocoloopSkillDetail(
  fetchJson: (url: string) => Promise<string>,
  skillId: string,
  apiUrl?: string,
): Promise<DCocoloopDetailSkill | null> {
  const trimmedId = skillId.trim();
  if (!trimmedId) {
    return null;
  }
  const raw = await fetchJson(buildDetailApiUrl(apiUrl, trimmedId));
  const response = JSON.parse(raw) as DCocoloopDetailResponse;
  if (response.code !== 0 || !response.data) {
    return null;
  }
  return response.data;
}

function findSkillMdPath(entries: Record<string, Uint8Array>): string | null {
  const paths = Object.keys(entries);
  const direct = paths.find((entry) => entry.toLowerCase().endsWith('skill.md'));
  if (direct) {
    return direct;
  }
  const nested = paths.find(
    (entry) => entry.toLowerCase().includes('skill.md') && !entry.startsWith('__MACOSX'),
  );
  return nested ?? null;
}

export async function fetchCocoloopSkillContentFromZip(
  fetchBinary: (url: string) => Promise<ArrayBuffer>,
  downloadUrl: string,
): Promise<string> {
  const { unzipSync } = await import('fflate');
  const buffer = await fetchBinary(downloadUrl);
  const entries = unzipSync(new Uint8Array(buffer));
  const skillMdPath = findSkillMdPath(entries);
  if (!skillMdPath) {
    throw new Error('CocoLoop 压缩包中未找到 SKILL.md');
  }

  const content = new TextDecoder('utf-8').decode(entries[skillMdPath]);
  const parsed = parseFrontmatter(content);
  if (!parsed.description && !parsed.name) {
    return content;
  }
  return content;
}

export async function resolveCocoloopDownloadUrl(
  fetchJson: (url: string) => Promise<string>,
  skillId: string,
  fallbackUrl?: string,
  apiUrl?: string,
): Promise<string> {
  const direct = fallbackUrl?.trim();
  if (direct && isCocoloopDownloadUrl(direct)) {
    return direct;
  }

  const detail = await fetchCocoloopSkillDetail(fetchJson, skillId, apiUrl);
  const resolved = detail ? resolveDownloadUrl(detail) : undefined;
  if (!resolved) {
    throw new Error(`无法解析 CocoLoop Skill "${skillId}" 的下载地址`);
  }
  return resolved;
}
