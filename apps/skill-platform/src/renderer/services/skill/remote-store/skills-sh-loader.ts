import type { IRegistrySkill } from '@/types/modules';

import {
  filterSkillsShLeaderboardEntries,
  getSkillsShIndexUrl,
  normalizeSkillsShFilterKey,
  parseSkillsShDetail,
  parseSkillsShLeaderboard,
  parseSkillsShTotalCount,
  type ISkillsShLeaderboardEntry,
} from '../skills-sh-store';
import { dedupeRegistrySkills } from '../store-mapper-utils';
import { getOffsetFromCursor, runWithConcurrency } from './utils';

const SKILLS_SH_PAGE_SIZE = 24;
const SKILLS_SH_CONCURRENCY = 4;

interface ISkillsShIndexCache {
  entries: ISkillsShLeaderboardEntry[];
  totalCount?: number;
}

export function createSkillsShStoreLoader() {
  const indexCache = new Map<string, ISkillsShIndexCache>();
  const detailCache = new Map<string, IRegistrySkill | null>();

  const clearCache = () => {
    indexCache.clear();
    detailCache.clear();
  };

  const loadIndex = async (filterKey: string): Promise<ISkillsShIndexCache> => {
    const normalizedFilterKey = normalizeSkillsShFilterKey(filterKey);
    const cached = indexCache.get(normalizedFilterKey);
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
    indexCache.set(normalizedFilterKey, nextCache);
    return nextCache;
  };

  const loadDetail = async (entry: ISkillsShLeaderboardEntry): Promise<IRegistrySkill | null> => {
    if (detailCache.has(entry.detailUrl)) {
      return detailCache.get(entry.detailUrl) ?? null;
    }

    try {
      const detailHtml = await window.api.skill.fetchRemoteContent(entry.detailUrl);
      const parsed = parseSkillsShDetail(detailHtml, entry);
      detailCache.set(entry.detailUrl, parsed);
      return parsed;
    } catch {
      detailCache.set(entry.detailUrl, null);
      return null;
    }
  };

  const loadPage = async (
    cursor: string | null | undefined,
    searchQuery: string,
    filterKey: string,
  ) => {
    const normalizedFilterKey = normalizeSkillsShFilterKey(filterKey);
    const index = await loadIndex(normalizedFilterKey);
    const filteredEntries = filterSkillsShLeaderboardEntries(index.entries, searchQuery);
    const offset = getOffsetFromCursor(cursor);
    const pageEntries = filteredEntries.slice(offset, offset + SKILLS_SH_PAGE_SIZE);

    const skillsFromDetails = await runWithConcurrency(
      pageEntries,
      SKILLS_SH_CONCURRENCY,
      async (entry) => loadDetail(entry),
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
  };

  return { loadPage, clearCache };
}
