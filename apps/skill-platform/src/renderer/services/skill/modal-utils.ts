import type { ISkill } from '@/types/modules';

function isRemoteSourceUrl(sourceUrl?: string): boolean {
  return /^https?:\/\//i.test(sourceUrl || '');
}

export function getExistingSkillTags(skills: ISkill[]): string[] {
  return [...new Set(skills.flatMap((skill) => getUserSkillTags(skill)))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function inferOriginalSkillTags(
  skill: Pick<ISkill, 'tags' | 'original_tags' | 'registry_slug' | 'source_url'>,
): string[] {
  if (Array.isArray(skill.original_tags)) {
    return skill.original_tags;
  }

  // Legacy imported skills stored source tags directly in tags.
  if (skill.registry_slug || isRemoteSourceUrl(skill.source_url)) {
    return skill.tags || [];
  }

  return [];
}

export function getUserSkillTags(
  skill: Pick<ISkill, 'tags' | 'original_tags' | 'registry_slug' | 'source_url'>,
): string[] {
  const originalTags = new Set(inferOriginalSkillTags(skill));
  return (skill.tags || []).filter((tag) => !originalTags.has(tag));
}
