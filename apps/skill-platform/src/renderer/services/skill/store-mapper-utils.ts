import type { ESkillCategory } from '@/types/modules';

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
