import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ISkill } from '@/types/modules';

const applicationSkillState = vi.hoisted(() => ({ skills: [] as ISkill[] }));

vi.mock('../../database', () => ({
  SkillDB: class {
    async getAll() {
      return applicationSkillState.skills;
    }

    async getById(id: string) {
      return applicationSkillState.skills.find((skill) => skill.id === id) ?? null;
    }
  },
}));

vi.mock('../skill/installer/utils', () => ({
  getPlatformGlobalRulePath: () => '',
  getPlatformRootDir: () => '',
  getPlatformSkillsDir: () => '',
}));

import { detectAgentApps, listAgentAppSlash, prepareAgentAppSubmit } from './index';

const temporaryRoots: string[] = [];

async function createRoot(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-agent-detect-'));
  temporaryRoots.push(root);
  return root;
}

afterEach(async () => {
  applicationSkillState.skills = [];
  await Promise.all(
    temporaryRoots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

describe('detectAgentApps', () => {
  it('returns only agents with a primary marker', async () => {
    const root = await createRoot();
    await fs.mkdir(path.join(root, '.cursor'));
    await fs.writeFile(path.join(root, 'AGENTS.md'), 'shared rules');

    const result = await detectAgentApps([root], 'request-1');

    expect(result.requestKey).toBe('request-1');
    expect(result.items.map((item) => item.platformId)).toEqual(['cursor']);
  });

  it('merges matches for the same agent across selected roots', async () => {
    const first = await createRoot();
    const second = await createRoot();
    await fs.mkdir(path.join(first, '.codex'));
    await fs.mkdir(path.join(second, '.codex'));

    const result = await detectAgentApps([first, second], 'request-2');

    expect(result.items).toHaveLength(1);
    expect(result.items[0].platformId).toBe('codex');
    expect(result.items[0].matchedFolderPaths).toHaveLength(2);
  });

  it('reports unreadable input without inventing an agent', async () => {
    const missing = path.join(os.tmpdir(), 'momo-agent-missing-' + Date.now());
    const result = await detectAgentApps([missing], 'request-3');

    expect(result.items).toEqual([]);
    expect(result.errors).toEqual([{ folderPath: missing, code: 'not-found' }]);
  });

  it('lists a momo-ai skill without an Agent and expands the selected skill into the request', async () => {
    applicationSkillState.skills = [
      {
        id: 'frontend-skill',
        name: '前端开发',
        description: '按设计文档实现并验证前端功能',
        instructions: '先核对验收条件，再实现并测试。\n\n任务：$ARGUMENTS',
        protocol_type: 'skill',
        category: 'dev',
        tags: ['React', '测试'],
        is_favorite: false,
        created_at: 1,
        updated_at: 1,
      },
    ];

    const listed = await listAgentAppSlash(undefined, [], '前端');
    expect(listed.items).toHaveLength(1);
    expect(listed.items[0]).toMatchObject({
      command: '/前端开发',
      label: '前端开发',
      scope: 'application',
      category: 'dev',
    });

    const item = listed.items[0];
    const prepared = await prepareAgentAppSubmit({
      folderPaths: [],
      content: '/前端开发 实现登录页面',
      displayContent: '实现登录页面',
      invocation: {
        resourceId: item.resourceId,
        resourceRevision: item.resourceRevision,
        command: item.command,
        label: item.label,
        kind: item.kind,
        scope: item.scope,
        category: item.category,
        tags: item.tags,
      },
    });

    expect(prepared.action).toBe('allow');
    expect(prepared.content).toContain('先核对验收条件，再实现并测试。');
    expect(prepared.content).toContain('任务：实现登录页面');
    expect(prepared.invocation).toMatchObject({
      resourceId: 'application-skill:frontend-skill',
      scope: 'application',
    });
  });

  it('expands multiple inline skills at their original positions', async () => {
    applicationSkillState.skills = [
      {
        id: 'review-skill',
        name: '代码审查',
        instructions: '审查实现与边界。\n\n任务：$ARGUMENTS',
        protocol_type: 'skill',
        category: 'dev',
        tags: [],
        is_favorite: false,
        created_at: 1,
        updated_at: 1,
      },
      {
        id: 'test-skill',
        name: '测试验证',
        instructions: '执行相关自动化测试。\n\n任务：$ARGUMENTS',
        protocol_type: 'skill',
        category: 'dev',
        tags: [],
        is_favorite: false,
        created_at: 1,
        updated_at: 1,
      },
    ];
    const listed = await listAgentAppSlash(undefined, []);
    const review = listed.items.find((item) => item.resourceId.endsWith('review-skill'))!;
    const test = listed.items.find((item) => item.resourceId.endsWith('test-skill'))!;
    const reviewToken = '@[slash:review]';
    const testToken = '@[slash:test]';
    const content = `先 ${reviewToken}，再 ${testToken}，最后汇总`;

    const prepared = await prepareAgentAppSubmit({
      folderPaths: [],
      content,
      displayContent: content,
      invocations: [
        { ...review, token: reviewToken },
        { ...test, token: testToken },
      ],
    });

    expect(prepared.action).toBe('allow');
    expect(prepared.invocations).toHaveLength(2);
    expect(prepared.content).toContain('审查实现与边界。');
    expect(prepared.content).toContain('执行相关自动化测试。');
    expect(prepared.content).not.toContain(reviewToken);
    expect(prepared.content).not.toContain(testToken);
    expect(prepared.content!.indexOf('审查实现与边界。')).toBeLessThan(
      prepared.content!.indexOf('执行相关自动化测试。'),
    );
  });

  it('combines a momo-ai skill with an Agent command in the same request', async () => {
    applicationSkillState.skills = [
      {
        id: 'design-skill',
        name: '设计实现',
        instructions: '逐条落实设计文档。\n\n任务：$ARGUMENTS',
        protocol_type: 'skill',
        category: 'dev',
        tags: [],
        is_favorite: false,
        created_at: 1,
        updated_at: 1,
      },
    ];
    const root = await createRoot();
    const commandDir = path.join(root, '.cursor', 'commands');
    await fs.mkdir(commandDir, { recursive: true });
    await fs.writeFile(path.join(commandDir, 'verify.md'), '验证实现并运行测试：$ARGUMENTS');

    const listed = await listAgentAppSlash('cursor', [root]);
    const appSkill = listed.items.find((item) => item.scope === 'application')!;
    const agentCommand = listed.items.find((item) => item.kind === 'command')!;
    const appToken = '@[slash:app]';
    const agentToken = '@[slash:agent]';
    const content = `根据文档 ${appToken}，完成后 ${agentToken}`;
    const prepared = await prepareAgentAppSubmit({
      agentAppId: 'cursor',
      folderPaths: [root],
      content,
      displayContent: content,
      invocations: [
        { ...appSkill, token: appToken },
        { ...agentCommand, token: agentToken },
      ],
    });

    expect(prepared.action).toBe('allow');
    expect(prepared.invocations?.map((item) => item.scope)).toEqual(['application', 'project']);
    expect(prepared.content).toContain('逐条落实设计文档。');
    expect(prepared.content).toContain('验证实现并运行测试：');
    expect(prepared.content).toContain('/设计实现');
    expect(prepared.content).toContain('/verify');
  });
});
