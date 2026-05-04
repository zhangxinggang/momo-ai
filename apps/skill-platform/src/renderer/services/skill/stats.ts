import type { ISkill } from '@/types/modules';

function isRemoteSourceUrl(sourceUrl?: string): boolean {
  return /^https?:\/\//i.test(sourceUrl || '');
}

function inferOriginalSkillTags(
  skill: Pick<ISkill, 'tags' | 'original_tags' | 'registry_slug' | 'source_url'>,
): string[] {
  if (Array.isArray(skill.original_tags)) {
    return skill.original_tags;
  }

  if (skill.registry_slug || isRemoteSourceUrl(skill.source_url)) {
    return skill.tags || [];
  }

  return [];
}

function getUserSkillTags(
  skill: Pick<ISkill, 'tags' | 'original_tags' | 'registry_slug' | 'source_url'>,
): string[] {
  const originalTags = new Set(inferOriginalSkillTags(skill));
  return (skill.tags || []).filter((tag) => !originalTags.has(tag));
}

export interface ISkillStats {
  deployedCount: number;
  pendingCount: number;
  uniqueUserTags: string[];
}

export function buildSkillStats(skills: ISkill[], deployedSkillNames: Set<string>): ISkillStats {
  let deployedCount = 0;
  const tagSet = new Set<string>();

  for (const skill of skills) {
    if (deployedSkillNames.has(skill.name)) {
      deployedCount++;
    }

    for (const tag of getUserSkillTags(skill)) {
      tagSet.add(tag);
    }
  }

  return {
    deployedCount,
    pendingCount: skills.length - deployedCount,
    uniqueUserTags: Array.from(tagSet).sort((a, b) => a.localeCompare(b)),
  };
}
