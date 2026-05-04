import { getPlatformById } from './platforms';

function requirePlatform(platformId: string) {
  const platform = getPlatformById(platformId);
  if (!platform) {
    throw new Error(`Missing rule platform metadata for: ${platformId}`);
  }
  return platform;
}

const claudePlatform = requirePlatform('claude');
const codexPlatform = requirePlatform('codex');
const geminiPlatform = requirePlatform('gemini');
const opencodePlatform = requirePlatform('opencode');
const windsurfPlatform = requirePlatform('windsurf');

export const RULE_FILE_GROUPS = ['workspace', 'assistant', 'tooling'] as const;

export const RULE_PLATFORM_ORDER = ['claude', 'codex', 'gemini', 'opencode', 'windsurf'] as const;

export const KNOWN_RULE_FILE_TEMPLATES = {
  'claude-global': {
    id: 'claude-global',
    platformId: 'claude',
    platformName: claudePlatform.name,
    platformIcon: claudePlatform.icon,
    platformDescription:
      'Global Claude Code rules stored next to the managed Claude skills directory.',
    name: 'CLAUDE.md',
    description: 'Global Claude rules loaded from the local Claude configuration.',
    group: 'assistant',
  },
  'codex-global': {
    id: 'codex-global',
    platformId: 'codex',
    platformName: codexPlatform.name,
    platformIcon: codexPlatform.icon,
    platformDescription:
      'Global Codex instructions stored next to the managed Codex settings directory.',
    name: 'AGENTS.md',
    description: 'Global Codex instructions loaded from the local Codex configuration.',
    group: 'assistant',
  },
  'gemini-global': {
    id: 'gemini-global',
    platformId: 'gemini',
    platformName: geminiPlatform.name,
    platformIcon: geminiPlatform.icon,
    platformDescription:
      'Global Gemini CLI context stored next to the managed Gemini settings directory.',
    name: 'GEMINI.md',
    description: 'Global Gemini CLI context loaded from the local Gemini configuration.',
    group: 'assistant',
  },
  'opencode-global': {
    id: 'opencode-global',
    platformId: 'opencode',
    platformName: opencodePlatform.name,
    platformIcon: opencodePlatform.icon,
    platformDescription:
      'Global OpenCode rules stored next to the managed OpenCode skills directory.',
    name: 'AGENTS.md',
    description: 'Global OpenCode rules loaded from the local OpenCode configuration.',
    group: 'tooling',
  },
  'windsurf-global': {
    id: 'windsurf-global',
    platformId: 'windsurf',
    platformName: windsurfPlatform.name,
    platformIcon: windsurfPlatform.icon,
    platformDescription: 'Global Windsurf rules stored in the local Cascade memories directory.',
    name: 'global_rules.md',
    description: 'Global Windsurf rules loaded from the local Windsurf configuration.',
    group: 'tooling',
  },
} as const;
