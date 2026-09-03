import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../skill/installer/utils', () => ({
  getPlatformRootDir: () => 'Z:/__momo_missing_agent_global__',
  getPlatformSkillsDir: () => 'Z:/__momo_missing_agent_global__/skills',
}));

import { getAgentAppProfile } from '@/types/constants/agent-app-profile';

import { expandAgentAppSlashContent, listAgentAppSlashCommands } from './slash';

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

describe('Agent slash resources', () => {
  it('lists only the selected profile resources and expands by revision', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-agent-slash-'));
    temporaryRoots.push(root);
    const commandDir = path.join(root, '.cursor', 'commands');
    const skillDir = path.join(root, '.cursor', 'skills', 'reviewer');
    await fs.mkdir(commandDir, { recursive: true });
    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(
      path.join(commandDir, 'review.md'),
      '---\ndescription: Review code\n---\nReview $ARGUMENTS',
    );
    await fs.writeFile(
      path.join(skillDir, 'SKILL.md'),
      '---\nname: reviewer\ndescription: Review skill\n---\nUse the review checklist.',
    );

    const profile = getAgentAppProfile('cursor');
    expect(profile).toBeDefined();
    const resources = await listAgentAppSlashCommands(profile!, [root]);

    expect(resources.map((item) => [item.kind, item.command])).toEqual([
      ['skill', '/reviewer'],
      ['command', '/review'],
    ]);
    const command = resources[1];
    const expanded = await expandAgentAppSlashContent(
      profile!,
      [root],
      '/review src/main.ts',
      command,
    );
    expect(expanded?.content).toContain('Review src/main.ts');
    expect(expanded?.resource.resourceRevision).toBe(command.resourceRevision);
  });

  it('rejects a stale invocation revision', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-agent-slash-stale-'));
    temporaryRoots.push(root);
    const commandDir = path.join(root, '.cursor', 'commands');
    await fs.mkdir(commandDir, { recursive: true });
    await fs.writeFile(path.join(commandDir, 'review.md'), 'Review $ARGUMENTS');
    const profile = getAgentAppProfile('cursor')!;
    const [resource] = await listAgentAppSlashCommands(profile, [root]);

    const expanded = await expandAgentAppSlashContent(profile, [root], '/review now', {
      resourceId: resource.resourceId,
      resourceRevision: 'stale',
    });
    expect(expanded).toBeNull();
  });
});
