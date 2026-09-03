/** 项目目录探测标记 */
export interface IAgentProjectMarker {
  path: string;
  kind: 'dir' | 'file';
  /** supporting 只能补充证据，不能独立识别 Agent */
  strength: 'primary' | 'supporting';
}

export type EAgentResourceCapability = 'native-equivalent' | 'adapted' | 'unsupported';

/** 已验证的 Agent 应用资源约定 */
export interface IAgentAppProfile {
  schemaVersion: number;
  platformId: 'cursor' | 'claude' | 'codex' | 'gemini' | 'opencode';
  projectMarkers: IAgentProjectMarker[];
  projectRulePaths: string[];
  projectSkillDirs: string[];
  projectCommandDirs: string[];
  globalCommandDirs: string[];
  projectHookFiles: string[];
  globalHookFiles: string[];
  capabilities: {
    rules: EAgentResourceCapability;
    skills: EAgentResourceCapability;
    commands: EAgentResourceCapability;
    hooks: EAgentResourceCapability;
  };
}

const SUPPORTING_AGENTS_MD: IAgentProjectMarker = {
  path: 'AGENTS.md',
  kind: 'file',
  strength: 'supporting',
};

/**
 * Agent Profile 必须显式登记并配套解析器/Fixture。
 * 这里故意不从 SKILL_PLATFORMS 生成，技能安装目标不等于已验证的 Agent 格式。
 */
export const AGENT_APP_PROFILES: IAgentAppProfile[] = [
  {
    schemaVersion: 1,
    platformId: 'cursor',
    projectMarkers: [{ path: '.cursor', kind: 'dir', strength: 'primary' }],
    projectRulePaths: ['.cursor/rules'],
    projectSkillDirs: ['.cursor/skills'],
    projectCommandDirs: ['.cursor/commands'],
    globalCommandDirs: ['commands'],
    projectHookFiles: ['.cursor/hooks.json'],
    globalHookFiles: ['hooks.json'],
    capabilities: {
      rules: 'adapted',
      skills: 'adapted',
      commands: 'adapted',
      hooks: 'adapted',
    },
  },
  {
    schemaVersion: 1,
    platformId: 'claude',
    projectMarkers: [
      { path: '.claude', kind: 'dir', strength: 'primary' },
      { path: 'CLAUDE.md', kind: 'file', strength: 'primary' },
    ],
    projectRulePaths: ['CLAUDE.md', '.claude/CLAUDE.md'],
    projectSkillDirs: ['.claude/skills'],
    projectCommandDirs: ['.claude/commands'],
    globalCommandDirs: ['commands'],
    projectHookFiles: ['.claude/settings.json', '.claude/settings.local.json'],
    globalHookFiles: ['settings.json'],
    capabilities: {
      rules: 'adapted',
      skills: 'adapted',
      commands: 'adapted',
      hooks: 'adapted',
    },
  },
  {
    schemaVersion: 1,
    platformId: 'codex',
    projectMarkers: [{ path: '.codex', kind: 'dir', strength: 'primary' }, SUPPORTING_AGENTS_MD],
    projectRulePaths: ['AGENTS.md', '.codex/AGENTS.md'],
    projectSkillDirs: ['.codex/skills'],
    projectCommandDirs: [],
    globalCommandDirs: [],
    projectHookFiles: [],
    globalHookFiles: [],
    capabilities: {
      rules: 'adapted',
      skills: 'adapted',
      commands: 'unsupported',
      hooks: 'unsupported',
    },
  },
  {
    schemaVersion: 1,
    platformId: 'gemini',
    projectMarkers: [
      { path: '.gemini', kind: 'dir', strength: 'primary' },
      { path: 'GEMINI.md', kind: 'file', strength: 'primary' },
    ],
    projectRulePaths: ['GEMINI.md', '.gemini/GEMINI.md'],
    projectSkillDirs: ['.gemini/skills'],
    projectCommandDirs: ['.gemini/commands'],
    globalCommandDirs: ['commands'],
    projectHookFiles: ['.gemini/settings.json'],
    globalHookFiles: ['settings.json'],
    capabilities: {
      rules: 'adapted',
      skills: 'adapted',
      commands: 'adapted',
      hooks: 'adapted',
    },
  },
  {
    schemaVersion: 1,
    platformId: 'opencode',
    projectMarkers: [
      { path: '.opencode', kind: 'dir', strength: 'primary' },
      { path: 'opencode.json', kind: 'file', strength: 'primary' },
      { path: 'opencode.jsonc', kind: 'file', strength: 'primary' },
      SUPPORTING_AGENTS_MD,
    ],
    projectRulePaths: ['AGENTS.md', '.opencode/AGENTS.md'],
    projectSkillDirs: ['.opencode/skills'],
    projectCommandDirs: ['.opencode/commands'],
    globalCommandDirs: ['commands'],
    projectHookFiles: [],
    globalHookFiles: [],
    capabilities: {
      rules: 'adapted',
      skills: 'adapted',
      commands: 'adapted',
      hooks: 'unsupported',
    },
  },
];

export function getAgentAppProfile(platformId: string): IAgentAppProfile | undefined {
  return AGENT_APP_PROFILES.find((item) => item.platformId === platformId);
}
