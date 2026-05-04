import type { IFolder, IPrompt } from '@/types/modules';
import type { EPromptSortBy, ESortOrder } from '@renderer/types/prompt';

interface IFilterVisiblePromptsOptions {
  prompts: IPrompt[];
  selectedFolderId: string | null;
  folders: IFolder[];
  searchQuery?: string;
  filterTags?: string[];
}

export interface IPromptStats {
  totalCount: number;
  favoriteCount: number;
  uniqueTags: string[];
}

export function collectDescendantFolderIds(
  folders: IFolder[],
  rootIds: Iterable<string>,
): Set<string> {
  const collected = new Set(rootIds);
  let changed = true;

  while (changed) {
    changed = false;
    for (const folder of folders) {
      if (folder.parentId && collected.has(folder.parentId) && !collected.has(folder.id)) {
        collected.add(folder.id);
        changed = true;
      }
    }
  }

  return collected;
}

function isSubsequence(needle: string, haystack: string) {
  if (!needle) return true;
  if (needle.length > haystack.length) return false;
  let i = 0;
  for (let j = 0; j < haystack.length && i < needle.length; j++) {
    if (haystack[j] === needle[i]) i++;
  }
  return i === needle.length;
}

export function filterVisiblePrompts({
  prompts,
  selectedFolderId,
  folders,
  searchQuery = '',
  filterTags = [],
}: IFilterVisiblePromptsOptions): IPrompt[] {
  let result = prompts;

  if (selectedFolderId === 'favorites') {
    result = result.filter((prompt) => prompt.isFavorite);
  } else if (selectedFolderId) {
    const visibleFolderIds = collectDescendantFolderIds(folders, [selectedFolderId]);
    result = result.filter((prompt) => prompt.folderId && visibleFolderIds.has(prompt.folderId));
  }

  const trimmedQuery = searchQuery.trim();
  if (trimmedQuery) {
    const queryLower = trimmedQuery.toLowerCase();
    const queryCompact = queryLower.replace(/\s+/g, '');
    const keywords = queryLower.split(/\s+/).filter((keyword) => keyword.length > 0);

    result = result
      .map((prompt) => {
        let score = 0;
        const titleLower = prompt.title.toLowerCase();

        if (titleLower === queryLower) score += 100;
        else if (titleLower.includes(queryLower)) score += 50;
        else if (
          queryCompact.length >= 2 &&
          isSubsequence(queryCompact, titleLower.replace(/\s+/g, ''))
        ) {
          score += 30;
        }

        const searchableText = [prompt.title, prompt.userPrompt, prompt.systemPrompt || '']
          .join(' ')
          .toLowerCase();

        if (keywords.every((keyword) => searchableText.includes(keyword))) {
          score += 10;
        }

        return { prompt, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.prompt);
  }

  if (filterTags.length > 0) {
    result = result.filter((prompt) => filterTags.every((tag) => prompt.tags.includes(tag)));
  }

  return result;
}

export function sortVisiblePrompts(
  prompts: IPrompt[],
  sortBy: EPromptSortBy,
  sortOrder: ESortOrder,
): IPrompt[] {
  const sorted = [...prompts];
  sorted.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    let comparison = 0;
    switch (sortBy) {
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'usageCount':
        comparison = (a.usageCount || 0) - (b.usageCount || 0);
        break;
      default:
        comparison = 0;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

export function buildPromptStats(prompts: IPrompt[]): IPromptStats {
  const tagSet = new Set<string>();
  let favoriteCount = 0;

  for (const prompt of prompts) {
    if (prompt.isFavorite) favoriteCount++;

    for (const tag of prompt.tags) {
      tagSet.add(tag);
    }
  }

  return {
    totalCount: prompts.length,
    favoriteCount,
    uniqueTags: Array.from(tagSet).sort((a, b) => a.localeCompare(b)),
  };
}
