import type { IRegistrySkill } from '@/types/modules';

import { inferCategory } from './store-mapper-utils';

export const CLAWHUB_QUERY_URL = 'https://wry-manatee-359.convex.cloud/api/query';
export const CLAWHUB_DOWNLOAD_BASE_URL = 'https://wry-manatee-359.convex.site/api/v1/download';

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_COMPATIBILITY = ['claude', 'codex', 'cursor', 'opencode', 'antigravity'];

interface DClawHubSkillItem {
  slug?: string;
  displayName?: string;
  summary?: string;
  stats?: {
    downloads?: number;
    stars?: number;
    installsCurrent?: number;
  };
}

interface DClawHubPageItem {
  skill?: DClawHubSkillItem;
  latestVersion?: {
    version?: string;
  };
  owner?: {
    displayName?: string;
    handle?: string;
  };
}

interface DClawHubListResponse {
  status?: string;
  value?: {
    page?: DClawHubPageItem[];
    hasMore?: boolean;
    nextCursor?: string;
  };
}

export interface IClawHubStorePageResult {
  skills: IRegistrySkill[];
  hasMore: boolean;
  nextCursor?: string;
}

export function buildClawHubDownloadUrl(slug: string): string {
  return `${CLAWHUB_DOWNLOAD_BASE_URL}?slug=${encodeURIComponent(slug)}`;
}

export function isClawHubDownloadUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.startsWith(`${CLAWHUB_DOWNLOAD_BASE_URL}?slug=`);
}

function buildPlaceholderContent(name: string, description: string): string {
  return `---\nname: ${name}\ndescription: ${description.replace(/\n/g, ' ')}\n---\n\n${description}`;
}

function mapClawHubPageItem(item: DClawHubPageItem): IRegistrySkill | null {
  const skill = item.skill;
  const slug = skill?.slug?.trim();
  if (!slug) {
    return null;
  }

  const name = skill.displayName?.trim() || slug;
  const description = skill.summary?.trim() || `${name} skill`;
  const version = item.latestVersion?.version?.trim() || '1.0.0';
  const author = item.owner?.displayName?.trim() || item.owner?.handle?.trim() || 'ClawHub';

  return {
    slug,
    name,
    description,
    category: inferCategory(slug, description),
    author,
    source_url: buildClawHubDownloadUrl(slug),
    store_url: buildClawHubDownloadUrl(slug),
    tags: ['clawhub'],
    version,
    content: buildPlaceholderContent(name, description),
    content_url: buildClawHubDownloadUrl(slug),
    compatibility: DEFAULT_COMPATIBILITY,
    weekly_installs:
      skill.stats?.installsCurrent != null ? String(skill.stats.installsCurrent) : undefined,
    github_stars: skill.stats?.stars != null ? String(skill.stats.stars) : undefined,
  };
}

export async function loadClawHubStorePage(
  fetchRemotePost: (url: string, body: unknown) => Promise<string>,
  options: {
    numItems?: number;
    cursor?: string;
  } = {},
): Promise<IClawHubStorePageResult> {
  const numItems = options.numItems ?? DEFAULT_PAGE_SIZE;
  const args: Record<string, unknown> = {
    dir: 'desc',
    highlightedOnly: false,
    numItems,
  };
  if (options.cursor) {
    args.cursor = options.cursor;
  }

  const raw = await fetchRemotePost(CLAWHUB_QUERY_URL, {
    path: 'skills:listPublicPageV4',
    format: 'convex_encoded_json',
    args: [args],
  });

  const parsed = JSON.parse(raw) as DClawHubListResponse;
  if (parsed.status !== 'success' || !parsed.value) {
    throw new Error('ClawHub 列表拉取失败');
  }

  const skills = (parsed.value.page ?? [])
    .map((item) => mapClawHubPageItem(item))
    .filter((item): item is IRegistrySkill => item !== null);

  return {
    skills,
    hasMore: Boolean(parsed.value.hasMore),
    nextCursor: parsed.value.nextCursor,
  };
}
