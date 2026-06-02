import fs from 'fs/promises';
import path from 'path';

import type { EClaudeSlashSource, IClaudeSlashItem } from '../types';

const MAX_COMMAND_FILES = 200;

function parseMarkdownDescription(content: string): string | undefined {
  const trimmed = content.trim();
  if (!trimmed.startsWith('---')) {
    const firstLine = trimmed.split('\n').find((line) => line.trim());
    return firstLine?.slice(0, 120);
  }
  const end = trimmed.indexOf('---', 3);
  if (end < 0) {
    return undefined;
  }
  const body = trimmed.slice(end + 3).trim();
  const firstBodyLine = body.split('\n').find((line) => line.trim() && !line.startsWith('#'));
  return firstBodyLine?.slice(0, 120);
}

function parseFrontmatterDescription(content: string): string | undefined {
  if (!content.trim().startsWith('---')) {
    return parseMarkdownDescription(content);
  }
  const match = content.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
  if (!match) {
    return undefined;
  }
  const block = match[1];
  const descMatch = block.match(/^description:\s*(.+)$/im);
  if (descMatch) {
    return descMatch[1]
      .trim()
      .replace(/^['"]|['"]$/g, '')
      .slice(0, 200);
  }
  return parseMarkdownDescription(content);
}

/** 扫描 `.claude/commands/*.md` 自定义命令 */
export async function scanCommandsDirectory(
  commandsDir: string,
  source: EClaudeSlashSource,
  projectPath?: string,
): Promise<IClaudeSlashItem[]> {
  try {
    await fs.access(commandsDir);
  } catch {
    return [];
  }

  const entries = await fs.readdir(commandsDir, { withFileTypes: true });
  const mdFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
    .slice(0, MAX_COMMAND_FILES);

  const items: IClaudeSlashItem[] = [];
  for (const entry of mdFiles) {
    const baseName = path.basename(entry.name, path.extname(entry.name));
    const commandName = baseName.trim().toLowerCase();
    if (!commandName || !/^[a-z][a-z0-9_-]*$/.test(commandName)) {
      continue;
    }
    const filePath = path.join(commandsDir, entry.name);
    let description: string | undefined;
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      description = parseFrontmatterDescription(content);
    } catch {
      description = undefined;
    }
    items.push({
      command: `/${commandName}`,
      label: `/${commandName}`,
      description,
      source,
      projectPath,
      hasArgs: true,
    });
  }

  return items.sort((a, b) => a.command.localeCompare(b.command));
}
