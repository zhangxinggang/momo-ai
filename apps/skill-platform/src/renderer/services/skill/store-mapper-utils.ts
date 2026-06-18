import type { ESkillCategory, IRegistrySkill } from '@/types/modules';

/** 按 slug 与 install_name 去重 registry 技能列表 */
export function dedupeRegistrySkills(skills: IRegistrySkill[]): IRegistrySkill[] {
  const bySlug = new Map<string, IRegistrySkill>();
  const seenNames = new Set<string>();
  for (const skill of skills) {
    if (bySlug.has(skill.slug)) {
      continue;
    }
    const normalizedName = (skill.install_name || skill.slug).toLowerCase();
    if (seenNames.has(normalizedName)) {
      continue;
    }
    bySlug.set(skill.slug, skill);
    seenNames.add(normalizedName);
  }
  return Array.from(bySlug.values());
}

/** 按显示名称排序 registry 技能列表 */
export function sortSkillsByName(skills: IRegistrySkill[]): IRegistrySkill[] {
  return [...skills].sort((left, right) =>
    left.name.localeCompare(right.name, 'en', { sensitivity: 'base' }),
  );
}

/** 将名称规范化为 slug（小写、短横线分隔） */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** 根据 slug 与描述推断技能分类 */
export function inferCategory(slug: string, description: string): ESkillCategory {
  const text = `${slug} ${description}`.toLowerCase();
  if (/(pdf|doc|ppt|sheet|spreadsheet|word|xlsx|docx|office)/.test(text)) {
    return 'office';
  }
  if (/(github|git|web|playwright|mcp|code|cli|dev|pr)/.test(text)) {
    return 'dev';
  }
  if (/(design|figma|css|ui|frontend|canvas|brand)/.test(text)) {
    return 'design';
  }
  if (/(deploy|vercel|docker|cloudflare|netlify)/.test(text)) {
    return 'deploy';
  }
  if (/(secure|security|audit|auth|secret)/.test(text)) {
    return 'security';
  }
  if (/(analy|data|sql|chart|research)/.test(text)) {
    return 'data';
  }
  if (/(manage|project|notion|linear)/.test(text)) {
    return 'management';
  }
  if (/(ai|generate|translation|speech|image|video|art|intelligence)/.test(text)) {
    return 'ai';
  }
  return 'general';
}
