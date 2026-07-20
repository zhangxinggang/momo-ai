import { UNCATEGORIZED_NAME } from '@/renderer/store/chat/project';
import type { ISkill } from '@/types/modules';

export interface ISkillChatTreeGroup {
  key: string;
  title: string;
  skills: ISkill[];
}

const UNTAGGED_KEY = '__untagged__';

/** 按「我的 Skills」标签字母序 + 技能列表顺序构建树形分组 */
export function buildSkillChatTree(skills: ISkill[]): ISkillChatTreeGroup[] {
  const tagSet = new Set<string>();
  for (const skill of skills) {
    for (const tag of skill.tags ?? []) {
      const trimmed = tag.trim();
      if (trimmed) {
        tagSet.add(trimmed);
      }
    }
  }

  const sortedTags = [...tagSet].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const groups: ISkillChatTreeGroup[] = sortedTags.map((tag) => ({
    key: tag,
    title: tag,
    skills: skills.filter((skill) => (skill.tags ?? []).some((item) => item.trim() === tag)),
  }));

  const untaggedSkills = skills.filter(
    (skill) => !(skill.tags ?? []).some((tag) => tag.trim().length > 0),
  );
  if (untaggedSkills.length > 0) {
    groups.push({
      key: UNTAGGED_KEY,
      title: UNCATEGORIZED_NAME,
      skills: untaggedSkills,
    });
  }

  return groups.filter((group) => group.skills.length > 0);
}
