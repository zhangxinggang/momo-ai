import type {
  DMarketplaceRegistryDocument,
  DMarketplaceSkillEntry,
  IRegistrySkill,
} from '@/types/modules';

import { mapScannedSkillsToRegistry } from '../git-store-mapper';
import { parseFrontmatter, toTitleCase } from '../github-store';
import { dedupeRegistrySkills, slugify, sortSkillsByName } from '../store-mapper-utils';
import { isDefined, parseJson, resolveMarketplaceReference, resolveUrl } from './utils';

const MAX_REMOTE_STORE_DEPTH = 3;

export async function loadGitDownloadStore(
  repoUrl: string,
  forceRefresh = false,
  gitRef = 'main',
): Promise<IRegistrySkill[]> {
  const result = await window.api.skill.syncGitStore(repoUrl, forceRefresh, gitRef);
  return mapScannedSkillsToRegistry(result.skills, repoUrl);
}

export async function loadLocalDirectoryStore(
  dirPath: string,
  scanLocalPreview: (paths: string[]) => Promise<Parameters<typeof mapScannedSkillsToRegistry>[0]>,
): Promise<IRegistrySkill[]> {
  const scannedSkills = await scanLocalPreview([dirPath]);
  return sortSkillsByName(mapScannedSkillsToRegistry(scannedSkills, dirPath));
}

export async function loadMarketplaceStore(
  url: string,
  visited = new Set<string>(),
  depth = 0,
): Promise<IRegistrySkill[]> {
  const resolvedUrl = resolveUrl(url, url);
  if (!resolvedUrl || visited.has(resolvedUrl) || depth > MAX_REMOTE_STORE_DEPTH) {
    return [];
  }
  visited.add(resolvedUrl);

  const raw = await window.api.skill.fetchRemoteContent(resolvedUrl).catch(() => null);
  if (!raw) return [];

  const data = parseJson<DMarketplaceRegistryDocument>(raw, {});
  const directSkills = Array.isArray(data.skills) ? data.skills : [];

  const mappedSkills = await Promise.all(
    directSkills.map(async (item: DMarketplaceSkillEntry) => {
      const slug = item.slug || item.id || slugify(item.name || item.title || 'remote-skill');
      if (!slug) return null;

      const contentUrl =
        resolveUrl(
          resolvedUrl,
          item.content_url ||
            item.contentUrl ||
            item.skill_url ||
            item.skillUrl ||
            item.raw_url ||
            item.rawUrl,
        ) || undefined;
      const sourceUrl =
        resolveUrl(
          resolvedUrl,
          item.source_url ||
            item.sourceUrl ||
            item.repo_url ||
            item.repoUrl ||
            item.repository ||
            item.repo,
        ) ||
        contentUrl ||
        resolvedUrl;

      let content = typeof item.content === 'string' ? item.content : '';
      if (!content && contentUrl) {
        try {
          content = await window.api.skill.fetchRemoteContent(contentUrl);
        } catch {
          content = '';
        }
      }

      const parsed = content
        ? parseFrontmatter(content)
        : { name: '', description: '', tags: [] as string[] };
      const description = item.description || parsed.description || `${toTitleCase(slug)} skill`;

      return {
        slug,
        name: item.name || item.title || parsed.name || toTitleCase(slug),
        install_name: item.install_name || item.installName,
        description,
        category: item.category || 'general',
        icon_url: item.icon_url || item.iconUrl,
        icon_emoji: item.icon_emoji || item.iconEmoji,
        author: item.author || 'Community',
        source_url: sourceUrl,
        store_url: item.store_url || item.storeUrl,
        tags:
          Array.isArray(item.tags) && item.tags.length > 0
            ? item.tags
            : parsed.tags.length > 0
              ? parsed.tags
              : slug.split(/[-_]/).filter(Boolean),
        version: String(item.version || '1.0.0'),
        content: content || `# ${item.name || parsed.name || toTitleCase(slug)}`,
        content_url: contentUrl,
        prerequisites: Array.isArray(item.prerequisites) ? item.prerequisites : undefined,
        compatibility: Array.isArray(item.compatibility)
          ? item.compatibility
          : ['claude', 'cursor'],
        weekly_installs: item.weekly_installs || item.weeklyInstalls,
        github_stars: item.github_stars || item.githubStars,
        installed_on: item.installed_on || item.installedOn,
        security_audits: item.security_audits || item.securityAudits,
      } satisfies IRegistrySkill;
    }),
  );

  const nestedStoreRefs = [
    ...(Array.isArray(data.marketplaces) ? data.marketplaces : []),
    ...(Array.isArray(data.sources) ? data.sources : []),
    ...(Array.isArray(data.registries) ? data.registries : []),
  ]
    .map((entry) => resolveMarketplaceReference(entry))
    .filter(Boolean)
    .map((entry: string) => resolveUrl(resolvedUrl, entry))
    .filter((entry: string | null): entry is string => Boolean(entry));

  const nestedSkills = await Promise.all(
    nestedStoreRefs.map((entry) => loadMarketplaceStore(entry, visited, depth + 1)),
  );

  return sortSkillsByName(
    dedupeRegistrySkills([...mappedSkills.filter(isDefined), ...nestedSkills.flat()]),
  );
}
