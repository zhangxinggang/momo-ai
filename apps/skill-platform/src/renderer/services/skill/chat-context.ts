import type { ISkill } from '@/types/modules';

/** 技能描述摘要最大长度 */
const SKILL_DESC_PREVIEW = 160;
/** 技能指令摘要最大长度 */
const SKILL_INSTRUCTIONS_PREVIEW = 480;

/** 截断文本并追加省略号 */
export function truncateSkillText(text: string, maxLen: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLen)}…`;
}

/** 获取技能正文（instructions 或 content） */
function getSkillBody(skill: ISkill): string {
  return (skill.instructions || skill.content || '').trim();
}

/** 构建单个技能的 Markdown 摘要行（供 LangGraph 使用） */
export function buildSkillSummaryLine(
  skill: ISkill,
  options?: { descMax?: number; instructionsMax?: number },
): string {
  const descMax = options?.descMax ?? SKILL_DESC_PREVIEW;
  const instructionsMax = options?.instructionsMax ?? SKILL_INSTRUCTIONS_PREVIEW;

  const desc = truncateSkillText(skill.description || '', descMax);
  const instructions = truncateSkillText(getSkillBody(skill), instructionsMax);
  const lines = [`- **${skill.name}**（id: ${skill.id}）: ${desc || '（无描述）'}`];

  if (instructions) {
    lines.push(`  指令摘要: ${instructions}`);
  }

  if (skill.tags?.length) {
    lines.push(`  标签: ${skill.tags.join(', ')}`);
  }

  return lines.join('\n');
}

/** 构建用户全部技能的 Markdown 摘要列表 */
export function buildSkillsSummary(skills: ISkill[]): string {
  if (skills.length === 0) {
    return '（当前无可用 SKILL）';
  }
  return skills.map((skill) => buildSkillSummaryLine(skill)).join('\n');
}

/** 构建当前聚焦技能的 Markdown 说明 */
export function buildActiveSkillLine(skill: ISkill | undefined): string {
  if (!skill) {
    return '（未指定）';
  }

  const desc = truncateSkillText(skill.description || '', SKILL_DESC_PREVIEW);
  const instructions = truncateSkillText(getSkillBody(skill), SKILL_INSTRUCTIONS_PREVIEW);
  const blocks = [`**${skill.name}**（id: ${skill.id}）`, desc || '（无描述）'];

  if (instructions) {
    blocks.push(`指令摘要:\n${instructions}`);
  }

  return blocks.join('\n');
}
