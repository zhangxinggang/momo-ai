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
  it('searches nested directories, descriptions and tags without losing the resource hierarchy', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-agent-slash-search-'));
    temporaryRoots.push(root);
    const dir = path.join(root, '.cursor', 'skills', 'frontend', 'quality', 'review');
    const commandsDir = path.join(root, '.cursor', 'commands', 'ops', 'release');
    await fs.mkdir(dir, { recursive: true });
    await fs.mkdir(commandsDir, { recursive: true });
    await fs.writeFile(
      path.join(dir, 'SKILL.md'),
      '---\nname: reviewer\ndescription: 检查组件质量\ntags: ["代码审查", React]\n---\nReview',
    );
    await fs.writeFile(
      path.join(commandsDir, 'deploy.md'),
      '---\ndescription: Ship the app\ntags:\n  - 发布流程\n  - CI\n---\nDeploy',
    );
    const profile = getAgentAppProfile('cursor')!;
    for (const query of ['REVIEWER', '组件质量', '代码审查', 'frontend/quality']) {
      const items = await listAgentAppSlashCommands(profile, [root], query);
      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({
        command: '/reviewer',
        directoryPath: ['frontend', 'quality', 'review'],
      });
    }
    const commands = await listAgentAppSlashCommands(profile, [root], '发布流程');
    expect(commands).toHaveLength(1);
    expect(commands[0]).toMatchObject({
      command: '/ops:release:deploy',
      directoryPath: ['ops', 'release'],
    });
    expect(await listAgentAppSlashCommands(profile, [root], '无匹配项')).toEqual([]);
  });

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

    const inlineExpanded = await expandAgentAppSlashContent(
      profile!,
      [root],
      '请先修改实现，再执行验证',
      command,
    );
    expect(inlineExpanded?.content).toContain('Review 请先修改实现，再执行验证');
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

  it('exposes the real tender skill resource location and preserves its fixed output contract', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-tender-skill-'));
    temporaryRoots.push(root);
    const skillDir = path.join(root, '.cursor', 'skills', 'tender-document-parser');
    await fs.cp(path.resolve('../../.cursor/skills/tender-document-parser'), skillDir, {
      recursive: true,
    });
    const profile = getAgentAppProfile('cursor')!;
    const [resource] = await listAgentAppSlashCommands(profile, [root]);
    const expanded = await expandAgentAppSlashContent(profile, [root], '解析上传文件', resource);
    expect(expanded?.content).toContain(JSON.stringify(skillDir));
    expect(expanded?.content).toContain('相对于该技能资源目录');
    expect(expanded?.content).toContain('10. 智能问答');
    expect(expanded?.content).toContain('AI 只生成数据，不临时重写整页 HTML/CSS');
    expect(expanded?.content).toContain('references/data-contract.md');
    expect(expanded?.content).toContain('assets/report.html');
    expect(await fs.readFile(path.join(skillDir, 'references/data-contract.md'), 'utf8')).toContain(
      '一级模块的 `id/title` 受渲染器校验',
    );
  });

  it('includes a localized skill name from .cursor/skills', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-agent-slash-localized-'));
    temporaryRoots.push(root);
    const dir = path.join(root, '.cursor', 'skills', 'review');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, 'SKILL.md'),
      '---\nname: 代码审查\ndescription: 检查当前实现\n---\n使用审查清单',
    );
    const profile = getAgentAppProfile('cursor')!;
    const items = await listAgentAppSlashCommands(profile, [root]);
    expect(items[0]).toMatchObject({
      command: '/代码审查',
      agentAppId: 'cursor',
      scope: 'project',
    });
    expect((await expandAgentAppSlashContent(profile, [root], '/代码审查'))?.content).toContain(
      '使用审查清单',
    );
  });
});
