import type { ESkillCategory, IRegistrySkill } from '@/types/modules';

import { parseFrontmatter } from './github-store';

export const SKILLHUB_WEB_BASE_URL = 'https://skillhub.cn';
export const SKILLHUB_API_BASE_URL = 'https://api.skillhub.cn';
export const SKILLHUB_COS_BASE_URL =
  'https://skillhub-1388575217.cos.accelerate.myqcloud.com/skills';

const DEFAULT_PAGE_SIZE = 24;
const DEFAULT_COMPATIBILITY = ['claude', 'codex', 'cursor', 'opencode', 'antigravity'];

interface DSkillHubListSkill {
  slug: string;
  name: string;
  description?: string;
  description_zh?: string;
  category?: string;
  ownerName?: string;
  version?: string;
  homepage?: string;
  iconUrl?: string | null;
  stars?: number;
  installs?: number;
  downloads?: number;
  source?: string;
  tags?: string[] | null;
}

interface DSkillHubListResponse {
  code: number;
  message?: string;
  data?: {
    skills?: DSkillHubListSkill[];
    total?: number;
  };
}

export interface ISkillHubStorePageResult {
  skills: IRegistrySkill[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

function inferCategory(slug: string, description: string): ESkillCategory {
  const text = `${slug} ${description}`.toLowerCase();
  if (/(pdf|doc|ppt|sheet|spreadsheet|word|xlsx|docx|office)/.test(text)) return 'office';
  if (/(github|git|web|playwright|mcp|code|cli|dev|pr)/.test(text)) return 'dev';
  if (/(design|figma|css|ui|frontend|canvas|brand)/.test(text)) return 'design';
  if (/(deploy|vercel|docker|cloudflare|netlify)/.test(text)) return 'deploy';
  if (/(secure|security|audit|auth|secret)/.test(text)) return 'security';
  if (/(analy|data|sql|chart|research)/.test(text)) return 'data';
  if (/(manage|project|notion|linear)/.test(text)) return 'management';
  if (/(ai|generate|translation|speech|image|video|art|intelligence)/.test(text)) {
    return 'ai';
  }
  return 'general';
}

function mapSkillHubCategory(category?: string): ESkillCategory {
  if (!category) return 'general';
  const normalized = category.toLowerCase();
  if (normalized.includes('office')) return 'office';
  if (normalized.includes('dev') || normalized.includes('code')) return 'dev';
  if (normalized.includes('design')) return 'design';
  if (normalized.includes('deploy')) return 'deploy';
  if (normalized.includes('security')) return 'security';
  if (normalized.includes('data')) return 'data';
  if (normalized.includes('management')) return 'management';
  if (normalized.includes('ai') || normalized.includes('intelligence')) return 'ai';
  return 'general';
}

export function buildSkillHubDownloadUrl(slug: string, version?: string): string {
  const safeVersion = version?.trim() || '1.0.0';
  return `${SKILLHUB_COS_BASE_URL}/${encodeURIComponent(slug)}/${encodeURIComponent(safeVersion)}.zip`;
}

export function isSkillHubDownloadUrl(url?: string | null): boolean {
  if (!url) return false;
  return (
    url.startsWith(`${SKILLHUB_COS_BASE_URL}/`) ||
    url.startsWith(`${SKILLHUB_API_BASE_URL}/api/v1/download?slug=`)
  );
}

function buildPlaceholderContent(name: string, description: string): string {
  return `---\nname: ${name}\ndescription: ${description.replace(/\n/g, ' ')}\n---\n\n${description}`;
}

export function mapSkillHubListItem(item: DSkillHubListSkill, preferZh = true): IRegistrySkill {
  const description =
    (preferZh ? item.description_zh?.trim() : '') ||
    item.description?.trim() ||
    item.description_zh?.trim() ||
    `${item.name} skill`;
  const slug = item.slug;
  const storeUrl = `${SKILLHUB_WEB_BASE_URL}/skills/${slug}`;
  const sourceUrl = item.homepage?.trim() || storeUrl;
  const version = item.version || '1.0.0';

  return {
    slug,
    name: item.name,
    description,
    category: mapSkillHubCategory(item.category) || inferCategory(slug, description),
    icon_url: item.iconUrl || undefined,
    author: item.ownerName || 'SkillHub',
    source_url: sourceUrl,
    store_url: storeUrl,
    tags:
      Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : [item.source || 'skillhub'],
    version,
    content: buildPlaceholderContent(item.name, description),
    content_url: buildSkillHubDownloadUrl(slug, version),
    compatibility: DEFAULT_COMPATIBILITY,
    weekly_installs: item.installs != null ? String(item.installs) : undefined,
    github_stars: item.stars != null ? String(item.stars) : undefined,
  };
}

async function fetchSkillHubListPage(
  fetchJson: (url: string) => Promise<string>,
  page: number,
  pageSize: number,
  keyword?: string,
): Promise<DSkillHubListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy: 'score',
    order: 'desc',
  });
  const trimmedKeyword = keyword?.trim();
  if (trimmedKeyword) {
    params.set('keyword', trimmedKeyword);
  }
  const raw = await fetchJson(`${SKILLHUB_API_BASE_URL}/api/skills?${params.toString()}`);
  return JSON.parse(raw) as DSkillHubListResponse;
}

export async function loadSkillHubStorePage(
  fetchJson: (url: string) => Promise<string>,
  options?: { page?: number; pageSize?: number; preferZh?: boolean; keyword?: string },
): Promise<ISkillHubStorePageResult> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  const preferZh = options?.preferZh ?? true;
  const response = await fetchSkillHubListPage(fetchJson, page, pageSize, options?.keyword);

  if (response.code !== 0) {
    throw new Error(response.message || 'SkillHub API returned an error');
  }

  const items = response.data?.skills ?? [];
  const total = response.data?.total ?? items.length;
  const skills = items.map((item) => mapSkillHubListItem(item, preferZh));

  return {
    skills,
    page,
    pageSize,
    total,
    hasMore: page * pageSize < total,
  };
}

function findSkillMdPath(entries: Record<string, Uint8Array>): string | null {
  const paths = Object.keys(entries);
  const direct = paths.find((entry) => entry.toLowerCase().endsWith('skill.md'));
  if (direct) return direct;
  const nested = paths.find(
    (entry) => entry.toLowerCase().includes('skill.md') && !entry.startsWith('__MACOSX'),
  );
  return nested ?? null;
}

export async function fetchSkillHubSkillContent(
  fetchBinary: (url: string) => Promise<ArrayBuffer>,
  slug: string,
  version?: string,
): Promise<string> {
  const { unzipSync } = await import('fflate');
  const buffer = await fetchBinary(buildSkillHubDownloadUrl(slug, version));
  const entries = unzipSync(new Uint8Array(buffer));
  const skillMdPath = findSkillMdPath(entries);
  if (!skillMdPath) {
    throw new Error(`SkillHub download for "${slug}" does not contain SKILL.md`);
  }

  const content = new TextDecoder('utf-8').decode(entries[skillMdPath]);
  const parsed = parseFrontmatter(content);
  if (!parsed.description && !parsed.name) {
    return content;
  }
  return content;
}

export async function fetchRegistrySkillRemoteContent(
  regSkill: IRegistrySkill,
  fetchText: (url: string) => Promise<string>,
  fetchBinary: (url: string) => Promise<ArrayBuffer>,
  options?: {
    readLocalFileByPath?: (
      localPath: string,
      relativePath: string,
    ) => Promise<{ content: string } | null>;
    extractSkillHubArchive?: (
      slug: string,
      version?: string,
    ) => Promise<{ cacheDir: string; content: string }>;
  },
): Promise<string> {
  if (regSkill.local_path && options?.readLocalFileByPath) {
    const localFile = await options.readLocalFileByPath(regSkill.local_path, 'SKILL.md');
    if (localFile?.content?.trim()) {
      return localFile.content;
    }
  }

  if (isSkillHubDownloadUrl(regSkill.content_url)) {
    if (options?.extractSkillHubArchive) {
      const extracted = await options.extractSkillHubArchive(regSkill.slug, regSkill.version);
      return extracted.content;
    }
    return fetchSkillHubSkillContent(fetchBinary, regSkill.slug, regSkill.version);
  }

  if (regSkill.content_url) {
    const freshContent = await fetchText(regSkill.content_url);
    if (freshContent.trim()) {
      return freshContent;
    }
  }

  return regSkill.content;
}

/** 解析安装时用于复制完整文件的源目录 */
export async function resolveRegistrySkillSourceDir(
  regSkill: IRegistrySkill,
  extractSkillHubArchive?: (
    slug: string,
    version?: string,
  ) => Promise<{ cacheDir: string; content: string }>,
): Promise<string | null> {
  if (regSkill.local_path?.trim()) {
    return regSkill.local_path;
  }

  if (isSkillHubDownloadUrl(regSkill.content_url) && extractSkillHubArchive) {
    const extracted = await extractSkillHubArchive(regSkill.slug, regSkill.version);
    return extracted.cacheDir;
  }

  return null;
}
