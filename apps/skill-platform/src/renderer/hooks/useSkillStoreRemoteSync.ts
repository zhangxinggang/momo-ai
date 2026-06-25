import type { IDeviceManagementSettings, IRegistrySkill, ISkillStoreSource } from '@/types/modules';
import { fetchSkillRemoteContent, fetchSkillRemotePost } from '@renderer/services/skill/api';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { loadClawHubStorePage } from '@renderer/services/skill/clawhub-store';
import { loadCocoloopStorePage } from '@renderer/services/skill/cocoloop-store';
import {
  mergeOnlineSkillStoreSources,
  type IRemoteSkillStoreSource,
} from '@renderer/services/skill/online-store-sources';
import {
  createSkillsShStoreLoader,
  loadGitDownloadStore,
  loadLocalDirectoryStore,
  loadMarketplaceStore,
} from '@renderer/services/skill/remote-store';
import { loadSkillHubStorePage } from '@renderer/services/skill/skillhub-store';
import { normalizeSkillsShFilterKey } from '@renderer/services/skill/skills-sh-store';
import { dedupeRegistrySkills } from '@renderer/services/skill/store-mapper-utils';
import { useOnlineConfStore, useSkillStore } from '@renderer/store';

const SKILLHUB_PAGE_SIZE = 24;
const COCOLOOP_PAGE_SIZE = 24;

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
  cocoloopKeyword?: string;
  skillsShFilterKey?: string;
  skillsShSearchQuery?: string;
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
  const skillsShLoaderRef = useRef(createSkillsShStoreLoader());
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

  const loadSkillHubStore = useCallback(async (page: number, keyword?: string) => {
    return loadSkillHubStorePage((url) => fetchSkillRemoteContent(url), {
      page,
      pageSize: SKILLHUB_PAGE_SIZE,
      preferZh: true,
      keyword,
    });
  }, []);

  const loadClawHubStore = useCallback(async (cursor?: string) => {
    return loadClawHubStorePage((url, body) => fetchSkillRemotePost(url, body), {
      cursor,
      numItems: 25,
    });
  }, []);

  const loadCocoloopStore = useCallback(async (apiUrl: string, page: number, keyword?: string) => {
    return loadCocoloopStorePage((url) => fetchSkillRemoteContent(url), {
      apiUrl,
      page,
      pageSize: COCOLOOP_PAGE_SIZE,
      keyword,
    });
  }, []);

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
      const cocoloopKeyword =
        source.type === 'cocoloop' ? (options.cocoloopKeyword ?? '').trim() : '';
      const skillsShFilterKey =
        source.type === 'skills-sh'
          ? normalizeSkillsShFilterKey(options.skillsShFilterKey ?? 'all')
          : 'all';
      const skillsShSearchQuery =
        source.type === 'skills-sh' ? (options.skillsShSearchQuery ?? '').trim() : '';
      const skillsShQueryKey = `${skillsShFilterKey}:${skillsShSearchQuery}`;
      const pagedPage = loadOptions.page ?? 1;
      const searchKeyword =
        source.type === 'skills-sh'
          ? skillsShQueryKey
          : source.type === 'cocoloop'
            ? cocoloopKeyword
            : skillhubKeyword;
      const loadKey = `${sourceId}:${source.type === 'skills-sh' ? skillsShQueryKey : searchKeyword}:${append ? 'append' : 'replace'}:${pagedPage}:${forceRefresh ? 'force' : 'cached'}`;
      const inflightLoad = inflightStoreLoadsRef.current.get(loadKey);
      if (inflightLoad) {
        await inflightLoad;
        return;
      }

      const cachedEntry = remoteStoreEntriesRef.current[sourceId];
      const hasCachedFailure = Boolean(cachedEntry?.error);

      if (forceRefresh && source.type === 'skills-sh') {
        skillsShLoaderRef.current.clearCache();
      }

      if (
        source.type === 'skillhub' ||
        source.type === 'clawhub' ||
        source.type === 'cocoloop' ||
        source.type === 'skills-sh'
      ) {
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
            skillsForSource =
              append && !forceRefresh
                ? dedupeRegistrySkills([...skillsForSource, ...pageResult.skills])
                : pageResult.skills;
            pagination = {
              page: pageResult.page,
              total: pageResult.total,
              hasMore: pageResult.hasMore,
            };
          } else if (source.type === 'clawhub') {
            const nextCursor =
              append && !forceRefresh ? cachedEntry?.pagination?.nextCursor : undefined;
            const pageResult = await loadClawHubStore(nextCursor);
            skillsForSource =
              append && !forceRefresh
                ? dedupeRegistrySkills([...skillsForSource, ...pageResult.skills])
                : pageResult.skills;
            pagination = {
              page: append && !forceRefresh ? (cachedEntry?.pagination?.page ?? 1) + 1 : 1,
              total: skillsForSource.length,
              hasMore: pageResult.hasMore,
              nextCursor: pageResult.nextCursor,
            };
          } else if (source.type === 'cocoloop') {
            const nextPage =
              append && !forceRefresh
                ? (loadOptions.page ?? (cachedEntry?.pagination?.page ?? 0) + 1)
                : 1;
            const pageResult = await loadCocoloopStore(
              source.url,
              nextPage,
              cocoloopKeyword || undefined,
            );
            skillsForSource =
              append && !forceRefresh
                ? dedupeRegistrySkills([...skillsForSource, ...pageResult.skills])
                : pageResult.skills;
            pagination = {
              page: pageResult.page,
              total: pageResult.total,
              hasMore: pageResult.hasMore,
            };
          } else if (source.type === 'skills-sh') {
            const nextCursor =
              append && !forceRefresh ? cachedEntry?.pagination?.nextCursor : undefined;
            const pageResult = await skillsShLoaderRef.current.loadPage(
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
            skillsForSource = await loadLocalDirectoryStore(source.url, scanLocalPreview);
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
      loadCocoloopStore,
      loadSkillHubStore,
      options.cocoloopKeyword,
      options.skillhubKeyword,
      options.skillsShFilterKey,
      options.skillsShSearchQuery,
      resolveStoreSource,
      scanLocalPreview,
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

  const loadMoreCocoloop = useCallback(async () => {
    const cachedEntry = remoteStoreEntriesRef.current.cocoloop;
    if (!cachedEntry?.pagination?.hasMore) {
      return;
    }
    await loadStoreSource('cocoloop', false, {
      append: true,
      page: cachedEntry.pagination.page + 1,
    });
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
    loadMoreCocoloop,
    loadMoreSkillsSh,
    onlineStoreSources,
    remoteStoreEntries,
  };
}
