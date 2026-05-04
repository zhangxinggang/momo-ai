import type { ESkillCategory, IRegistrySkill, IScannedSkill } from '@/types/modules';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function inferCategory(slug: string, description: string): ESkillCategory {
  const text = `${slug} ${description}`.toLowerCase();
  if (/(pdf|doc|ppt|sheet|spreadsheet|word|xlsx|docx)/.test(text)) return 'office';
  if (/(github|git|web|playwright|mcp|code|cli|dev|pr)/.test(text)) return 'dev';
  if (/(design|figma|css|ui|frontend|canvas|brand)/.test(text)) return 'design';
  if (/(deploy|vercel|docker|cloudflare|netlify)/.test(text)) return 'deploy';
  if (/(secure|security|audit|auth|secret)/.test(text)) return 'security';
  if (/(analy|data|sql|chart|research)/.test(text)) return 'data';
  if (/(manage|project|notion|linear)/.test(text)) return 'management';
  if (/(ai|generate|translation|speech|image|video|art)/.test(text)) return 'ai';
  return 'general';
}

/** 将本地扫描结果映射为商店 IRegistrySkill */
export function mapScannedSkillsToRegistry(
  skills: IScannedSkill[],
  repoUrl: string,
): IRegistrySkill[] {
  const bySlug = new Map<string, IRegistrySkill>();

  for (const skill of skills) {
    const slug = slugify(skill.name);
    if (!slug || bySlug.has(slug)) {
      continue;
    }

    const description = skill.description || `${skill.name} skill`;
    bySlug.set(slug, {
      slug,
      name: skill.name,
      description,
      category: inferCategory(slug, description),
      author: skill.author || 'Community',
      source_url: repoUrl,
      tags: skill.tags?.length ? skill.tags : slug.split('-').filter(Boolean),
      version: skill.version || '1.0.0',
      content: skill.instructions,
      content_url: skill.filePath,
      local_path: skill.localPath,
      compatibility: skill.platforms,
    });
  }

  return Array.from(bySlug.values()).sort((left, right) =>
    left.name.localeCompare(right.name, 'en', { sensitivity: 'base' }),
  );
}
