import fs from 'fs/promises';
import path from 'path';

import { parseSkillMd } from '../../main/services/skill/safety/validator';
import type { EClaudeSlashSource, IClaudeSlashItem } from '../types';

const MAX_SKILL_DIRS = 200;

function toSlashName(raw: string): string | null {
  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '');
  if (!normalized || !/^[a-z][a-z0-9_-]*$/.test(normalized)) {
    return null;
  }
  return normalized;
}

/** 扫描 .claude/skills 下各 SKILL.md 并映射为斜杠命令 */
export async function scanSkillsDirectory(
  skillsDir: string,
  source: EClaudeSlashSource,
  projectPath?: string,
): Promise<IClaudeSlashItem[]> {
  try {
    await fs.access(skillsDir);
  } catch {
    return [];
  }

  const entries = await fs.readdir(skillsDir, { withFileTypes: true });
  const dirs = entries.filter((entry) => entry.isDirectory()).slice(0, MAX_SKILL_DIRS);

  const items: IClaudeSlashItem[] = [];
  for (const entry of dirs) {
    const skillMdPath = path.join(skillsDir, entry.name, 'SKILL.md');
    try {
      await fs.access(skillMdPath);
    } catch {
      continue;
    }

    let slashName = toSlashName(entry.name);
    let description: string | undefined;
    try {
      const content = await fs.readFile(skillMdPath, 'utf-8');
      const parsed = parseSkillMd(content);
      const fmName = parsed?.frontmatter.name;
      if (typeof fmName === 'string' && fmName.trim()) {
        slashName = toSlashName(fmName) ?? slashName;
      }
      description =
        (typeof parsed?.frontmatter.description === 'string' &&
          parsed.frontmatter.description.trim()) ||
        undefined;
    } catch {
      // 忽略解析失败
    }

    if (!slashName) {
      continue;
    }

    items.push({
      command: `/${slashName}`,
      label: `/${slashName}`,
      description: description ? `Skill: ${description}` : 'Skill',
      source,
      projectPath,
      hasArgs: true,
    });
  }

  return items.sort((a, b) => a.command.localeCompare(b.command));
}
