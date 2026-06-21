import type { ISlashCommandItem, ISlashCommandsConfig } from '@momo/aichat';
import { CLI_MODEL_PREFIX, ECliAgent } from '@momo/aichat';

import {
  isClaudeCodeApiAvailable,
  listClaudeSlashCommands,
} from '@renderer/services/claude-code/api';
import { EClaudeSlashSource, type IClaudeSlashItem } from '../types';

const SOURCE_LABELS: Record<EClaudeSlashSource, string> = {
  [EClaudeSlashSource.EBuiltin]: '内置',
  [EClaudeSlashSource.EProject]: '项目',
  [EClaudeSlashSource.EGlobal]: '全局',
  [EClaudeSlashSource.ESkill]: 'Skill',
};

function mapItem(item: IClaudeSlashItem): ISlashCommandItem {
  const sourceLabel = SOURCE_LABELS[item.source];
  return {
    command: item.command,
    label: item.label,
    description: item.description,
    group: sourceLabel,
    hasArgs: item.hasArgs,
  };
}

/** 构建注入 momo-aichat 的斜杠命令配置（仅桌面端 + cli:claude） */
export function createClaudeSlashCommandsConfig(): ISlashCommandsConfig | undefined {
  if (!isClaudeCodeApiAvailable()) {
    return undefined;
  }

  const claudeModelId = `${CLI_MODEL_PREFIX}${ECliAgent.EClaude}`;

  return {
    isActive: (modelId) => modelId === claudeModelId,
    list: async (query, ctx) => {
      const workspacePaths =
        ctx.workspaceEnabled && ctx.workspacePaths.length > 0 ? ctx.workspacePaths : [];
      const result = await listClaudeSlashCommands({
        query,
        workspacePaths,
        cwd: workspacePaths[0],
      });
      if (!result) {
        return { items: [], warning: undefined };
      }
      return {
        items: result.items.map(mapItem),
        warning: result.warning,
      };
    },
  };
}
