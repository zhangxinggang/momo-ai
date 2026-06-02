import type {
  DMarketplaceReferenceEntry,
  DMarketplaceRegistryDocument,
  DMarketplaceSkillEntry,
  IDeviceManagementSettings,
  IRegistrySkill,
  ISkillStoreSource,
} from '@/types/modules';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { loadClawHubStorePage } from '@renderer/services/skill/clawhub-store';
import { mapScannedSkillsToRegistry } from '@renderer/services/skill/git-store-mapper';
import { parseFrontmatter, toTitleCase } from '@renderer/services/skill/github-store';
import {
  mergeOnlineSkillStoreSources,
  type IRemoteSkillStoreSource,
} from '@renderer/services/skill/online-store-sources';
import { loadSkillHubStorePage } from '@renderer/services/skill/skillhub-store';
import {
  filterSkillsShLeaderboardEntries,
  getSkillsShIndexUrl,
  normalizeSkillsShFilterKey,
  parseSkillsShDetail,
  parseSkillsShLeaderboard,
  parseSkillsShTotalCount,
  type ISkillsShLeaderboardEntry,
} from '@renderer/services/skill/skills-sh-store';
import { slugify } from '@renderer/services/skill/store-mapper-utils';
import { useOnlineConfStore, useSkillStore } from '@renderer/store';

const MAX_REMOTE_STORE_DEPTH = 3;
const SKILLHUB_PAGE_SIZE = 24;
const SKILLS_SH_PAGE_SIZE = 24;
const SKILLS_SH_CONCURRENCY = 4;

type TResolvedStoreSource =
  | (IRemoteSkillStoreSource & { enabled?: boolean })
  | (ISkillStoreSource & { gitRef?: string });

export interface ILoadStoreSourceOptions {
  append?: boolean;
  page?: number;
}

interface IUseSkillStoreRemoteSyncOptions {
  eagerRemoteSources?: 'selected' | 'all';
  selectedStoreSourceId?: string;
  skillhubKeyword?: string;
  skillsShFilterKey?: string;
  skillsShSearchQuery?: string;
}

interface ISkillsShIndexCache {
  entries: ISkillsShLeaderboardEntry[];
  totalCount?: number;
}

function getOffsetFromCursor(cursor?: string | null): number {
  return Math.max(0, Number.parseInt(cursor ?? '0', 10) || 0);
}

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R | null>,
): Promise<R[]> {
  const results: Array<R | null> = new Array(items.length).fill(null);
  let nextIndex = 0;

  const runWorker = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => runWorker()));
  return results.filter(isDefined);
}

function resolveUrl(baseUrl: string, value?: string | null) {
  if (!value) return null;
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return value;
  }
}

function dedupeRegistrySkills(skills: IRegistrySkill[]) {
  const bySlug = new Map<string, IRegistrySkill>();
  const seenNames = new Set<string>();
  for (const skill of skills) {
    if (bySlug.has(skill.slug)) continue;
    const normalizedName = (skill.install_name || skill.slug).toLowerCase();
    if (seenNames.has(normalizedName)) continue;
    bySlug.set(skill.slug, skill);
    seenNames.add(normalizedName);
  }
  return Array.from(bySlug.values());
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function cadenceToMs(cadence: IDeviceManagementSettings['storeSyncCadence']): number | null {
  switch (cadence) {
    case '1h':
      return 60 * 60 * 1000;
    case '1d':
      return 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

function shouldForceRefreshSource(
  loadedAt: number | undefined,
  intervalMs: number | null,
): boolean {
  if (!loadedAt || loadedAt <= 0) {
    return true;
  }
  if (intervalMs === null) {
    return false;
  }
  return Date.now() - loadedAt >= intervalMs;
}

function resolveMarketplaceReference(
  entry: string | DMarketplaceReferenceEntry,
): string | undefined {
  if (typeof entry === 'string') return entry;
  return entry.url || entry.index || entry.manifest;
}

function sortSkillsByName(skills: IRegistrySkill[]) {
  return [...skills].sort((left, right) =>
    left.name.localeCompare(right.name, 'en', { sensitivity: 'base' }),
  );
}

export function useSkillStoreRemoteSync(options: IUseSkillStoreRemoteSyncOptions = {}) {
  const eagerRemoteSources = options.eagerRemoteSources ?? 'all';
  const selectedStoreSourceId = options.selectedStoreSourceId;
  const onlineConfig = useOnlineConfStore((state) => state.config);
  const onlineStoreSources = useMemo(
    () => mergeOnlineSkillStoreSources(onlineConfig),
    [onlineConfig],
  );
  const customStoreSources = useSkillStore((state) => state.customStoreSources) ?? [];
  const remoteStoreEntries = useSkillStore((state) => state.remoteStoreEntries) ?? {};
  const setRemoteStoreEntry = useSkillStore((state) => state.setRemoteStoreEntry);
  const scanLocalPreview = useSkillStore((state) => state.scanLocalPreview);

  const [loadingSourceId, setLoadingSourceId] = useState<string | null>(null);
  const remoteStoreEntriesRef = useRef(remoteStoreEntries);
  const inflightStoreLoadsRef = useRef(new Map<string, Promise<void>>());
  const skillsShIndexCacheRef = useRef(new Map<string, ISkillsShIndexCache>());
  const skillsShDetailCacheRef = useRef(new Map<string, IRegistrySkill | null>());
  const loadStoreSourceRef = useRef<
    (
      sourceId: string,
      forceRefresh?: boolean,
      loadOptions?: ILoadStoreSourceOptions,
    ) => Promise<void>
  >(async () => undefined);

  const customStoreSourcesSyncKey = useMemo(
    () =>
      customStoreSources
        .map((source) => [source.id, source.type, source.url, source.enabled ? '1' : '0'].join(':'))
        .join('|'),
    [customStoreSources],
  );

  const onlineStoreSourcesSyncKey = useMemo(
    () =>
      onlineStoreSources
        .map((source) =>
          [
            source.id,
            source.type,
            source.url,
            source.gitRef ?? '',
            source.enabled ? '1' : '0',
          ].join(':'),
        )
        .join('|'),
    [onlineStoreSources],
  );

  const resolveStoreSource = useCallback(
    (sourceId: string): TResolvedStoreSource | null => {
      const onlineSource = onlineStoreSources.find((item) => item.id === sourceId);
      if (onlineSource) {
        return onlineSource;
      }
      return customStoreSources.find((item) => item.id === sourceId) ?? null;
    },
    [customStoreSources, onlineStoreSources],
  );

  useEffect(() => {
    remoteStoreEntriesRef.current = remoteStoreEntries;
  }, [remoteStoreEntries]);

  const loadGitDownloadStore = useCallback(
    async (repoUrl: string, forceRefresh = false, gitRef = 'main') => {
      const result = await window.api.skill.syncGitStore(repoUrl, forceRefresh, gitRef);
      return mapScannedSkillsToRegistry(result.skills, repoUrl);
    },
    [],
  );

  const loadMarketplaceStore = useCallback(
    async (url: string, visited = new Set<string>(), depth = 0): Promise<IRegistrySkill[]> => {
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
          const description =
            item.description || parsed.description || `${toTitleCase(slug)} skill`;

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
    },
    [],
  );

  const loadLocalDirectoryStore = useCallback(
    async (dirPath: string): Promise<IRegistrySkill[]> => {
      const scannedSkills = await scanLocalPreview([dirPath]);
      return sortSkillsByName(mapScannedSkillsToRegistry(scannedSkills, dirPath));
    },
    [scanLocalPreview],
  );

  const loadSkillHubStore = useCallback(async (page: number, keyword?: string) => {
    return loadSkillHubStorePage((url) => window.api.skill.fetchRemoteContent(url), {
      page,
      pageSize: SKILLHUB_PAGE_SIZE,
      preferZh: true,
      keyword,
    });
  }, []);

  const loadClawHubStore = useCallback(async (cursor?: string) => {
    return loadClawHubStorePage((url, body) => window.api.skill.fetchRemotePost(url, body), {
      cursor,
      numItems: 25,
    });
  }, []);

  const loadSkillsShIndex = useCallback(async (filterKey: string): Promise<ISkillsShIndexCache> => {
    const normalizedFilterKey = normalizeSkillsShFilterKey(filterKey);
    const cached = skillsShIndexCacheRef.current.get(normalizedFilterKey);
    if (cached) {
      return cached;
    }

    const leaderboardHtml = await window.api.skill.fetchRemoteContent(
      getSkillsShIndexUrl(normalizedFilterKey),
    );
    const nextCache = {
      entries: parseSkillsShLeaderboard(leaderboardHtml, {
        limit: Number.MAX_SAFE_INTEGER,
      }),
      totalCount: parseSkillsShTotalCount(leaderboardHtml),
    };
    skillsShIndexCacheRef.current.set(normalizedFilterKey, nextCache);
    return nextCache;
  }, []);

  const loadSkillsShDetail = useCallback(
    async (entry: ISkillsShLeaderboardEntry): Promise<IRegistrySkill | null> => {
      if (skillsShDetailCacheRef.current.has(entry.detailUrl)) {
        return skillsShDetailCacheRef.current.get(entry.detailUrl) ?? null;
      }

      try {
        const detailHtml = await window.api.skill.fetchRemoteContent(entry.detailUrl);
        const parsed = parseSkillsShDetail(detailHtml, entry);
        skillsShDetailCacheRef.current.set(entry.detailUrl, parsed);
        return parsed;
      } catch {
        skillsShDetailCacheRef.current.set(entry.detailUrl, null);
        return null;
      }
    },
    [],
  );

  const loadSkillsShStore = useCallback(
    async (cursor: string | null | undefined, searchQuery: string, filterKey: string) => {
      const normalizedFilterKey = normalizeSkillsShFilterKey(filterKey);
      const index = await loadSkillsShIndex(normalizedFilterKey);
      const filteredEntries = filterSkillsShLeaderboardEntries(index.entries, searchQuery);
      const offset = getOffsetFromCursor(cursor);
      const pageEntries = filteredEntries.slice(offset, offset + SKILLS_SH_PAGE_SIZE);

      const skillsFromDetails = await runWithConcurrency(
        pageEntries,
        SKILLS_SH_CONCURRENCY,
        async (entry) => loadSkillsShDetail(entry),
      );

      const nextOffset = offset + SKILLS_SH_PAGE_SIZE;
      const normalizedSearchQuery = searchQuery.trim();
      const indexedResultCount =
        normalizedFilterKey === 'all'
          ? (index.totalCount ?? filteredEntries.length)
          : filteredEntries.length;
      const resultCount = normalizedSearchQuery ? filteredEntries.length : indexedResultCount;

      return {
        skills: dedupeRegistrySkills(skillsFromDetails),
        pagination: {
          page: Math.floor(offset / SKILLS_SH_PAGE_SIZE) + 1,
          total: resultCount,
          hasMore: nextOffset < filteredEntries.length,
          nextCursor: nextOffset < filteredEntries.length ? String(nextOffset) : undefined,
        },
        query: `${normalizedFilterKey}:${normalizedSearchQuery}`,
      };
    },
    [loadSkillsShDetail, loadSkillsShIndex],
  );

  const loadStoreSource = useCallback(
    async (sourceId: string, forceRefresh = false, loadOptions: ILoadStoreSourceOptions = {}) => {
      if (typeof setRemoteStoreEntry !== 'function') {
        return;
      }
      if (sourceId === 'new-custom') {
        return;
      }

      const source = resolveStoreSource(sourceId);

      if (!source) return;
      if ('enabled' in source && source.enabled === false) return;

      const append = Boolean(loadOptions.append);
      const skillhubKeyword =
        source.type === 'skillhub' ? (options.skillhubKeyword ?? '').trim() : '';
      const skillsShFilterKey =
        source.type === 'skills-sh'
          ? normalizeSkillsShFilterKey(options.skillsShFilterKey ?? 'all')
          : 'all';
      const skillsShSearchQuery =
        source.type === 'skills-sh' ? (options.skillsShSearchQuery ?? '').trim() : '';
      const skillsShQueryKey = `${skillsShFilterKey}:${skillsShSearchQuery}`;
      const skillhubPage = loadOptions.page ?? 1;
      const loadKey = `${sourceId}:${source.type === 'skills-sh' ? skillsShQueryKey : skillhubKeyword}:${append ? 'append' : 'replace'}:${skillhubPage}:${forceRefresh ? 'force' : 'cached'}`;
      const inflightLoad = inflightStoreLoadsRef.current.get(loadKey);
      if (inflightLoad) {
        await inflightLoad;
        return;
      }

      const cachedEntry = remoteStoreEntriesRef.current[sourceId];
      const hasCachedFailure = Boolean(cachedEntry?.error);

      if (forceRefresh && source.type === 'skills-sh') {
        skillsShIndexCacheRef.current.clear();
        skillsShDetailCacheRef.current.clear();
      }

      if (source.type === 'skillhub' || source.type === 'clawhub' || source.type === 'skills-sh') {
        if (append && cachedEntry?.pagination && !cachedEntry.pagination.hasMore) {
          return;
        }
      } else if (!forceRefresh && hasCachedFailure) {
        return;
      }

      const loadPromise = (async () => {
        setLoadingSourceId(sourceId);
        try {
          let skillsForSource: IRegistrySkill[] = cachedEntry?.skills || [];
          let pagination = cachedEntry?.pagination;

          if (source.type === 'git-repo') {
            const gitRef = source.gitRef || 'main';
            skillsForSource = await loadGitDownloadStore(source.url, forceRefresh, gitRef);
            pagination = undefined;
          } else if (source.type === 'skillhub') {
            const nextPage =
              append && !forceRefresh
                ? (loadOptions.page ?? (cachedEntry?.pagination?.page ?? 0) + 1)
                : 1;
            const pageResult = await loadSkillHubStore(nextPage, skillhubKeyword || undefined);
            const nextSkills =
              append && !forceRefresh
                ? dedupeRegistrySkills([...skillsForSource, ...pageResult.skills])
                : pageResult.skills;
            skillsForSource = nextSkills;
            pagination = {
              page: pageResult.page,
              total: pageResult.total,
              hasMore: pageResult.hasMore,
            };
          } else if (source.type === 'clawhub') {
            const nextCursor =
              append && !forceRefresh ? cachedEntry?.pagination?.nextCursor : undefined;
            const pageResult = await loadClawHubStore(nextCursor);
            const nextSkills =
              append && !forceRefresh
                ? dedupeRegistrySkills([...skillsForSource, ...pageResult.skills])
                : pageResult.skills;
            skillsForSource = nextSkills;
            pagination = {
              page: append && !forceRefresh ? (cachedEntry?.pagination?.page ?? 1) + 1 : 1,
              total: nextSkills.length,
              hasMore: pageResult.hasMore,
              nextCursor: pageResult.nextCursor,
            };
          } else if (source.type === 'skills-sh') {
            const nextCursor =
              append && !forceRefresh ? cachedEntry?.pagination?.nextCursor : undefined;
            const pageResult = await loadSkillsShStore(
              nextCursor,
              skillsShSearchQuery,
              skillsShFilterKey,
            );
            if (pageResult.query !== skillsShQueryKey) {
              return;
            }
            skillsForSource =
              append && !forceRefresh
                ? dedupeRegistrySkills([...skillsForSource, ...pageResult.skills])
                : pageResult.skills;
            pagination = pageResult.pagination;
          } else if (source.type === 'marketplace-json') {
            skillsForSource = await loadMarketplaceStore(source.url);
            pagination = undefined;
          } else if (source.type === 'local-dir') {
            skillsForSource = await loadLocalDirectoryStore(source.url);
            pagination = undefined;
          }

          setRemoteStoreEntry(sourceId, {
            loadedAt: Date.now(),
            error: null,
            skills: skillsForSource,
            pagination,
          });
        } catch (error) {
          console.error(`Failed to load remote store ${sourceId}:`, error);
          setRemoteStoreEntry(sourceId, {
            loadedAt: cachedEntry?.loadedAt || 0,
            error: error instanceof Error ? error.message : '拉取远程商店失败',
            skills: cachedEntry?.skills || [],
            pagination: cachedEntry?.pagination,
          });
        } finally {
          inflightStoreLoadsRef.current.delete(loadKey);
          setLoadingSourceId((current) => (current === sourceId ? null : current));
        }
      })();

      inflightStoreLoadsRef.current.set(loadKey, loadPromise);
      await loadPromise;
    },
    [
      loadClawHubStore,
      loadGitDownloadStore,
      loadLocalDirectoryStore,
      loadMarketplaceStore,
      loadSkillHubStore,
      loadSkillsShStore,
      options.skillhubKeyword,
      options.skillsShFilterKey,
      options.skillsShSearchQuery,
      resolveStoreSource,
      setRemoteStoreEntry,
    ],
  );

  const loadMoreSkillHub = useCallback(async () => {
    const cachedEntry = remoteStoreEntriesRef.current.skillhub;
    if (!cachedEntry?.pagination?.hasMore) {
      return;
    }
    await loadStoreSource('skillhub', false, {
      append: true,
      page: cachedEntry.pagination.page + 1,
    });
  }, [loadStoreSource]);

  const loadMoreClawHub = useCallback(async () => {
    const cachedEntry = remoteStoreEntriesRef.current.clawhub;
    if (!cachedEntry?.pagination?.hasMore) {
      return;
    }
    await loadStoreSource('clawhub', false, { append: true });
  }, [loadStoreSource]);

  const loadMoreSkillsSh = useCallback(async () => {
    const cachedEntry = remoteStoreEntriesRef.current['skills-sh'];
    if (!cachedEntry?.pagination?.hasMore) {
      return;
    }
    await loadStoreSource('skills-sh', false, { append: true });
  }, [loadStoreSource]);

  useEffect(() => {
    loadStoreSourceRef.current = loadStoreSource;
  }, [loadStoreSource]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let disposed = false;
    let intervalId: number | undefined;

    const enabledCustomSourceIds = customStoreSources
      .filter((source) => source.enabled)
      .map((source) => source.id);
    const remoteSourceIds = [
      ...onlineStoreSources.filter((source) => source.enabled).map((source) => source.id),
      ...enabledCustomSourceIds,
    ];

    const initialSourceIds =
      eagerRemoteSources === 'selected' && selectedStoreSourceId
        ? [selectedStoreSourceId]
        : remoteSourceIds;

    const refreshStoreSources = async (forceRefresh: boolean, intervalMs: number | null) => {
      await Promise.allSettled(
        remoteSourceIds.map((sourceId) => {
          const cachedEntry = remoteStoreEntriesRef.current[sourceId];
          const nextForceRefresh =
            forceRefresh && shouldForceRefreshSource(cachedEntry?.loadedAt, intervalMs);
          return loadStoreSourceRef.current(sourceId, nextForceRefresh);
        }),
      );
    };

    const configure = async () => {
      const autoSyncEnabled = true;
      const intervalMs = cadenceToMs('1d');

      if (disposed) {
        return;
      }

      if (eagerRemoteSources === 'all' && autoSyncEnabled) {
        await Promise.allSettled(
          initialSourceIds.map((sourceId) => loadStoreSourceRef.current(sourceId, false)),
        );
      }

      if (!autoSyncEnabled || !intervalMs) {
        return;
      }

      intervalId = window.setInterval(() => {
        void refreshStoreSources(true, intervalMs);
      }, intervalMs);
    };

    void configure();

    return () => {
      disposed = true;
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [
    customStoreSources,
    customStoreSourcesSyncKey,
    eagerRemoteSources,
    onlineStoreSources,
    onlineStoreSourcesSyncKey,
    selectedStoreSourceId,
  ]);

  return {
    loadingSourceId,
    loadStoreSource,
    loadMoreSkillHub,
    loadMoreClawHub,
    loadMoreSkillsSh,
    onlineStoreSources,
    remoteStoreEntries,
  };
}
