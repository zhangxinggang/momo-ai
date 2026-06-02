import type { IRegistrySkill, IScannedSkill } from '@/types/modules';

import { inferCategory, slugify } from './store-mapper-utils';

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
