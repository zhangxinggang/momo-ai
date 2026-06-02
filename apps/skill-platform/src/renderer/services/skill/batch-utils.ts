import type { ISkill } from '@/types/modules';

export type ESkillBatchTagMode = 'add' | 'remove';

export function normalizeSkillTag(input: string): string {
  return input.trim().toLowerCase();
}

export function updateSkillTags(
  currentTags: string[] | undefined,
  tag: string,
  mode: ESkillBatchTagMode,
): string[] {
  const normalized = normalizeSkillTag(tag);
  const existing = currentTags || [];

  if (!normalized) {
    return existing;
  }

  if (mode === 'add') {
    if (existing.includes(normalized)) {
      return existing;
    }
    return [...existing, normalized];
  }

  return existing.filter((item) => item !== normalized);
}

export function collectSkillTags(skills: ISkill[]): string[] {
  return Array.from(
    new Set(skills.flatMap((skill) => skill.tags || []).filter((tag) => tag.trim())),
  ).sort((a, b) => a.localeCompare(b));
}
