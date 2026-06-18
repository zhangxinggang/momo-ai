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

export function normalizeSkillTag(raw: string): string {
  return raw.trim().toLowerCase();
}

interface ISkillTagActionsParams {
  tags: string[];
  tagInput: string;
  setTags: (tags: string[]) => void;
  setTagInput: (value: string) => void;
}

/** 技能表单标签增删与回车添加 */
export function buildSkillTagActions({
  tags,
  tagInput,
  setTags,
  setTagInput,
}: ISkillTagActionsParams) {
  const handleAddTag = () => {
    const normalized = normalizeSkillTag(tagInput);
    if (normalized && !tags.includes(normalized)) {
      setTags([...tags, normalized]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((item) => item !== tag));
  };

  const handleTagKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  };

  const handleAddExistingTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  return {
    handleAddTag,
    handleRemoveTag,
    handleTagKeyDown,
    handleAddExistingTag,
  };
}
