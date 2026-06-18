import type { ISkill } from '@/types/modules';

export interface ISkillSourceMeta {
  kind: 'github' | 'remote' | 'local';
  value: string;
  displayValue: string;
  shortValue: string;
  sourceLabel: string;
}

export function getProtocolDisplayLabel(protocolType: ISkill['protocol_type']): string {
  switch (protocolType) {
    case 'skill':
      return 'SKILL.md';
    case 'mcp':
      return 'MCP';
    case 'claude-code':
      return 'Claude Code';
    default:
      return protocolType;
  }
}

export function getSkillSourceMeta(skill: ISkill): ISkillSourceMeta | null {
  const sourceValue = skill.source_url || skill.local_repo_path;
  if (!sourceValue) {
    return null;
  }

  if (/^https?:\/\/github\.com\//i.test(sourceValue)) {
    return {
      kind: 'github',
      value: sourceValue,
      displayValue: sourceValue.replace(/^https?:\/\/(www\.)?github\.com\//i, ''),
      shortValue: sourceValue.replace(/^https?:\/\/(www\.)?github\.com\//i, ''),
      sourceLabel: skill.registry_slug ? '从 GitHub / Skill 商店导入' : '从 GitHub 仓库导入',
    };
  }

  if (/^https?:\/\//i.test(sourceValue)) {
    return {
      kind: 'remote',
      value: sourceValue,
      displayValue: sourceValue.replace(/^https?:\/\/(www\.)?/i, ''),
      shortValue: sourceValue.replace(/^https?:\/\/(www\.)?/i, ''),
      sourceLabel: skill.registry_slug ? '从远程 Skill 商店导入' : '从远程链接导入',
    };
  }

  const normalized = sourceValue.replace(/\\/g, '/');
  const parts = normalized.split('/').filter(Boolean);
  const shortValue =
    parts.length >= 2 ? `.../${parts[parts.length - 2]}/${parts[parts.length - 1]}` : sourceValue;
  const lowerPath = normalized.toLowerCase();
  let sourceLabel = '从本地文件夹导入';
  if (lowerPath.includes('/.claude/skills/')) {
    sourceLabel = '从 Claude Code 本地技能目录导入';
  } else if (lowerPath.includes('/cursor/') || lowerPath.includes('/.cursor/')) {
    sourceLabel = '从 Cursor 本地技能目录导入';
  }

  return {
    kind: 'local',
    value: sourceValue,
    displayValue: sourceValue,
    shortValue,
    sourceLabel,
  };
}
