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

import {
  detectAgentApps,
  listAgentAppSlash,
  prepareAgentAppSubmit,
  resolveAgentAppContext,
} from './index';

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
      directoryPath: ['开发工具'],
    });
    for (const query of ['开发工具', 'react', '测试']) {
      const searched = await listAgentAppSlash(undefined, [], query);
      expect(searched.items.map((resource) => resource.resourceId)).toEqual([
        'application-skill:frontend-skill',
      ]);
      expect(searched.items[0].directoryPath).toEqual(['开发工具']);
    }

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

  it('provides the repository path for an imported application skill with scripts and templates', async () => {
    const root = await createRoot();
    applicationSkillState.skills = [
      {
        id: 'tender-skill',
        name: 'tender-document-parser',
        instructions: '读取 references/data-contract.md 并使用 assets/report.html。',
        local_repo_path: root,
        protocol_type: 'skill',
        is_favorite: false,
        created_at: 1,
        updated_at: 1,
      },
    ];
    const [item] = (await listAgentAppSlash(undefined, [])).items;
    const result = await prepareAgentAppSubmit({
      folderPaths: [],
      content: '/tender-document-parser 解析文件',
      displayContent: '/tender-document-parser 解析文件',
      invocation: item,
    });
    expect(result.action).toBe('allow');
    expect(result.content).toContain(JSON.stringify(path.join(root, 'SKILL.md')));
    expect(result.content).toContain(JSON.stringify(root));
    expect(result.content).toContain('references/data-contract.md');
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

  it('lists Cursor and Claude skills separately and expands both same-name selections by identity', async () => {
    const root = await createRoot();
    for (const provider of ['cursor', 'claude']) {
      const dir = path.join(root, `.${provider}`, 'skills', 'review');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(
        path.join(dir, 'SKILL.md'),
        `---\nname: review\ndescription: ${provider} review\n---\n${provider} checklist`,
      );
    }
    const listed = await listAgentAppSlash(['cursor', 'claude'], [root]);
    expect(listed.warning).toBeUndefined();
    expect(listed.items.map((item) => [item.agentAppId, item.command])).toEqual([
      ['cursor', '/review'],
      ['claude', '/review'],
    ]);
    expect(new Set(listed.items.map((item) => item.resourceId)).size).toBe(2);
    const [cursor, claude] = listed.items;
    const content = '先 @cursor，再 @claude';
    const prepared = await prepareAgentAppSubmit({
      agentAppIds: ['cursor', 'claude'],
      folderPaths: [root],
      content,
      displayContent: content,
      invocations: [
        { ...cursor, token: '@cursor' },
        { ...claude, token: '@claude' },
      ],
    });
    expect(prepared.action).toBe('allow');
    expect(prepared.content).toContain('cursor checklist');
    expect(prepared.content).toContain('claude checklist');
    expect(prepared.invocations?.map((item) => item.agentAppId)).toEqual(['cursor', 'claude']);
    const ambiguous = await prepareAgentAppSubmit({
      agentAppIds: ['cursor', 'claude'],
      folderPaths: [root],
      content: '/review',
      displayContent: '/review',
    });
    expect(ambiguous.action).toBe('deny');
    expect(ambiguous.reason).toContain('同名');
  });

  it('honors an explicit empty selection and rejects a skill from a deselected Agent', async () => {
    const root = await createRoot();
    const dir = path.join(root, '.cursor', 'skills', 'review');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'SKILL.md'), '---\nname: review\n---\nCursor checklist');
    const listed = await listAgentAppSlash(['cursor'], [root]);
    expect(listed.items).toHaveLength(1);
    expect((await listAgentAppSlash([], [root])).items).toEqual([]);
    const prepared = await prepareAgentAppSubmit({
      agentAppIds: [],
      agentAppId: 'cursor',
      folderPaths: [root],
      content: '@cursor',
      displayContent: '@cursor',
      invocations: [{ ...listed.items[0], token: '@cursor' }],
    });
    expect(prepared.action).toBe('deny');
  });

  it('applies selected Agents hooks in order and limits each rules context to its matching directory', async () => {
    const cursorRoot = await createRoot();
    const claudeRoot = await createRoot();
    await fs.mkdir(path.join(cursorRoot, '.cursor', 'rules'), { recursive: true });
    await fs.mkdir(path.join(claudeRoot, '.claude'), { recursive: true });
    await fs.writeFile(path.join(cursorRoot, '.cursor', 'rules', 'guide.mdc'), 'Cursor rules');
    await fs.writeFile(path.join(claudeRoot, 'CLAUDE.md'), 'Claude rules');
    await fs.writeFile(path.join(cursorRoot, 'CLAUDE.md'), 'Cursor root Claude marker rules');
    await fs.writeFile(
      path.join(cursorRoot, '.cursor', 'hooks.json'),
      JSON.stringify({ beforeSubmitPrompt: [{ type: 'append', text: 'cursor hook' }] }),
    );
    await fs.writeFile(
      path.join(claudeRoot, '.claude', 'settings.json'),
      JSON.stringify({ beforeSubmitPrompt: [{ type: 'append', text: 'claude hook' }] }),
    );
    const input = {
      agentAppIds: ['cursor', 'claude'],
      folderPaths: [cursorRoot, claudeRoot],
      content: 'hello',
      displayContent: 'hello',
    };
    const prepared = await prepareAgentAppSubmit(input);
    expect(prepared.content).toContain('cursor hook');
    expect(prepared.content).toContain('claude hook');
    expect(prepared.content!.indexOf('cursor hook')).toBeLessThan(
      prepared.content!.indexOf('claude hook'),
    );
    const context = await resolveAgentAppContext('cursor', input.folderPaths);
    expect(context!.sources.every((source) => source.path.startsWith(cursorRoot))).toBe(true);
  });
});
