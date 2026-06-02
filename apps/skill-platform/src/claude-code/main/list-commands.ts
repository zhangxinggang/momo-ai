import path from 'path';

import { getPlatformRootDir } from '../../main/services/skill/installer/utils';
import { SKILL_PLATFORMS } from '../../types/constants/platforms';
import {
  EClaudeSlashSource,
  type IClaudeSlashItem,
  type IListClaudeSlashInput,
  type IListClaudeSlashResult,
} from '../types';
import { fetchBuiltinSlashCommands } from './help-probe';
import { scanCommandsDirectory } from './scan-commands';
import { scanSkillsDirectory } from './scan-skills';

const SOURCE_PRIORITY: Record<EClaudeSlashSource, number> = {
  [EClaudeSlashSource.EProject]: 4,
  [EClaudeSlashSource.EGlobal]: 3,
  [EClaudeSlashSource.ESkill]: 2,
  [EClaudeSlashSource.EBuiltin]: 1,
};

function getClaudeRootDir(): string {
  const platform = SKILL_PLATFORMS.find((item) => item.id === 'claude');
  if (!platform) {
    throw new Error('未找到 Claude Code 平台配置');
  }
  return getPlatformRootDir(platform);
}

function mergeSlashItems(groups: IClaudeSlashItem[][]): IClaudeSlashItem[] {
  const map = new Map<string, IClaudeSlashItem>();
  const effectivePriority = (item: IClaudeSlashItem): number => {
    if (item.projectPath) {
      return SOURCE_PRIORITY[EClaudeSlashSource.EProject];
    }
    return SOURCE_PRIORITY[item.source];
  };

  const sortedGroups = groups.flat().sort((a, b) => {
    const diff = effectivePriority(b) - effectivePriority(a);
    if (diff !== 0) {
      return diff;
    }
    return a.command.localeCompare(b.command);
  });

  for (const item of sortedGroups) {
    const key = item.command.toLowerCase();
    if (!map.has(key)) {
      map.set(key, item);
    }
  }

  return Array.from(map.values()).sort((a, b) => a.command.localeCompare(b.command));
}

function filterByQuery(items: IClaudeSlashItem[], query: string): IClaudeSlashItem[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return items;
  }
  const needle = q.startsWith('/') ? q.slice(1) : q;
  return items.filter((item) => {
    const name = item.command.slice(1).toLowerCase();
    return name.startsWith(needle) || item.command.toLowerCase().includes(needle);
  });
}

/** 聚合内置、全局、项目 commands 与 skills */
export async function listClaudeSlashCommands(
  input: IListClaudeSlashInput,
): Promise<IListClaudeSlashResult> {
  const workspacePaths = (input.workspacePaths ?? []).map((item) => item.trim()).filter(Boolean);
  const cwd = input.cwd?.trim() || workspacePaths[0] || process.cwd();

  const claudeRoot = getClaudeRootDir();
  const groups: IClaudeSlashItem[][] = [];

  const builtin = await fetchBuiltinSlashCommands(cwd);
  groups.push(builtin.items);

  groups.push(
    await scanCommandsDirectory(path.join(claudeRoot, 'commands'), EClaudeSlashSource.EGlobal),
  );
  groups.push(
    await scanSkillsDirectory(path.join(claudeRoot, 'skills'), EClaudeSlashSource.ESkill),
  );

  for (const wsPath of workspacePaths) {
    const projectClaudeDir = path.join(wsPath, '.claude');
    groups.push(
      await scanCommandsDirectory(
        path.join(projectClaudeDir, 'commands'),
        EClaudeSlashSource.EProject,
        wsPath,
      ),
    );
    groups.push(
      await scanSkillsDirectory(
        path.join(projectClaudeDir, 'skills'),
        EClaudeSlashSource.ESkill,
        wsPath,
      ),
    );
  }

  const merged = mergeSlashItems(groups);
  const items = filterByQuery(merged, input.query ?? '');

  return {
    items,
    builtinAvailable: builtin.available,
    warning: builtin.warning,
  };
}
