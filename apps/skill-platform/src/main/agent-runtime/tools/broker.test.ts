import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { testStore } from '../persistence/test-store';
import {
  ToolBroker,
  findReferencedToolboxToolIds,
  findReferencedUnavailableToolPackages,
  type BrokerContext,
  type HostTool,
} from './broker';
import { validateActionManifest, validateCallableActionManifest } from './manifest';
const action = {
  id: 'sum',
  title: 'Sum',
  description: 'Add two numbers',
  inputSchema: {
    type: 'object',
    properties: { a: { type: 'number' }, b: { type: 'number' } },
    required: ['a', 'b'],
    additionalProperties: false,
  },
  outputSchema: {
    type: 'object',
    properties: { sum: { type: 'number' } },
    required: ['sum'],
    additionalProperties: false,
  },
  executor: { runtime: 'node', entry: 'actions/sum.mjs' },
  capabilities: [],
  effects: ['execute'],
  timeoutMs: 5000,
  retry: 0,
  parallelSafe: false,
  idempotent: true,
  examples: [{ input: { a: 2, b: 3 }, output: { sum: 5 } }],
};
describe('single toolbox manifest', () => {
  it('accepts actions without a version and validates examples', () =>
    expect(
      validateActionManifest({ kind: 'tool', id: 'calculator', actions: [action] }).actions,
    ).toHaveLength(1));
  it('accepts bounded display names and aliases used by AI tool selection', () =>
    expect(
      validateActionManifest({
        kind: 'tool',
        id: 'calculator',
        name: '超级计算器',
        description: '进行可靠计算',
        aliases: ['算数助手'],
        actions: [action],
      }),
    ).toMatchObject({ name: '超级计算器', aliases: ['算数助手'] }));
  it('rejects malformed aliases', () =>
    expect(() =>
      validateActionManifest({ kind: 'tool', id: 'calculator', aliases: [''], actions: [action] }),
    ).toThrow('INVALID_TOOL_ALIASES'));
  it('rejects page-only output from the AI generation publishing path', () =>
    expect(() =>
      validateCallableActionManifest({ kind: 'tool', id: 'display-only', actions: [] }),
    ).toThrow('至少包含一个'));
  it.each(['version', 'packageVersion'])('rejects %s instead of retaining old formats', (field) =>
    expect(() =>
      validateActionManifest({ kind: 'tool', id: 'calculator', actions: [action], [field]: 3 }),
    ).toThrow('版本字段'),
  );
  it('rejects code disguised as readonly', () =>
    expect(() =>
      validateActionManifest({
        kind: 'tool',
        id: 'calculator',
        actions: [{ ...action, effects: ['read'] }],
      }),
    ).toThrow('MISSING_EXECUTOR_EFFECT'));
  it('rejects invalid example output', () =>
    expect(() =>
      validateActionManifest({
        kind: 'tool',
        id: 'calculator',
        actions: [{ ...action, examples: [{ input: { a: 2, b: 3 }, output: { sum: 'five' } }] }],
      }),
    ).toThrow('Schema'));
  it('rejects path traversal', () =>
    expect(() =>
      validateActionManifest({
        kind: 'tool',
        id: 'calculator',
        actions: [{ ...action, executor: { runtime: 'node', entry: 'actions/../../escape.mjs' } }],
      }),
    ).toThrow('INVALID_ACTION_ENTRY'));
});
describe('host tool broker', () => {
  let root: string,
    toolRoot: string,
    store: ReturnType<typeof testStore>,
    broker: ToolBroker,
    context: BrokerContext,
    catalog: HostTool[];
  let approvals = 0;
  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-harness-tools-'));
    toolRoot = path.join(root, 'calculator');
    await fs.mkdir(path.join(toolRoot, 'actions'), { recursive: true });
    await fs.mkdir(path.join(toolRoot, 'lib'));
    await fs.writeFile(
      path.join(toolRoot, 'tool.json'),
      JSON.stringify({
        kind: 'tool',
        id: 'calculator',
        name: '超级计算器',
        aliases: ['算数助手'],
        actions: [action],
      }),
    );
    await fs.writeFile(path.join(toolRoot, 'lib/sum.mjs'), 'export const sum = (a,b) => a+b;');
    await fs.writeFile(
      path.join(toolRoot, 'actions/sum.mjs'),
      "import { sum } from '../lib/sum.mjs'; export async function execute(input) { return { sum: sum(input.a,input.b) }; }",
    );
    store = testStore();
    broker = new ToolBroker(
      store,
      root,
      path.resolve('../../packages/momo-harness-runner/plugins/momo-tools'),
      process.execPath,
    );
    approvals = 0;
    context = {
      runId: 'run',
      projectId: 'project',
      modeId: 'ask',
      roots: [],
      signal: new AbortController().signal,
      emit: (type, payload) => {
        store.append('run', type, payload);
      },
      askApproval: async () => {
        approvals++;
        return { decision: 'allowed-once' };
      },
    };
    catalog = (await broker.customTools()).tools;
    broker.register('run', catalog);
  });
  afterEach(async () => {
    store.db.close();
    await fs.rm(root, { recursive: true, force: true });
  });
  it('lets the native Harness complete long turns without host cumulative call/output caps', async () => {
    const text = '文档正文'.repeat(40000);
    const read = {
      ...catalog[0],
      id: 'attachments.readFile',
      name: 'attachments_readFile',
      effects: ['read'] as HostTool['effects'],
      outputSchema: undefined,
      parallelSafe: true,
      execute: async () => ({ text }),
    };
    broker.register('run', [read]);
    for (let i = 0; i < 55; i++)
      expect(await broker.execute(read.name, { a: 2, b: 3 }, 'read-' + i, context)).toEqual({
        text,
      });
    expect(approvals).toBe(0);
    expect(store.events('run').filter((e) => e.type === 'tool.completed')).toHaveLength(55);
  });
  it('runs a shared implementation without activating UI preview', async () => {
    expect(catalog).toHaveLength(1);
    expect(await broker.execute(catalog[0].name, { a: 2, b: 3 }, 'sum-call', context)).toEqual({
      sum: 5,
    });
    expect(approvals).toBe(1);
    expect(store.events('run').map((e) => e.type)).toEqual(['tool.started', 'tool.completed']);
  });
  it('exposes names that let prompts and expanded Skills select the referenced toolbox action', () => {
    expect(catalog[0].aliases).toEqual(
      expect.arrayContaining(['calculator', '超级计算器', '算数助手', 'Sum']),
    );
    expect([
      ...findReferencedToolboxToolIds(catalog, ['请用超级计算器处理', 'Skill 要求调用算数助手']),
    ]).toEqual(['toolbox.calculator.sum']);
    expect(
      findReferencedToolboxToolIds(catalog, ['Write a summary without using a calculator']).size,
    ).toBe(1);
    expect(findReferencedToolboxToolIds(catalog, ['This is a summarized response']).size).toBe(0);
  });
  it('reports a referenced page-only package instead of pretending it was callable', () => {
    const unavailable = findReferencedUnavailableToolPackages(
      [{ path: '展示面板', status: 'page-only', name: '展示面板', aliases: ['展示面板'] }],
      ['Skill 要求使用展示面板'],
    );
    expect(unavailable).toHaveLength(1);
    expect(unavailable[0].status).toBe('page-only');
  });
  it.skipIf(spawnSync('python', ['--version'], { windowsHide: true }).status !== 0)(
    'runs Python shared modules while separating logs from the protocol',
    async () => {
      await fs.writeFile(
        path.join(toolRoot, 'lib/sum.py'),
        'def sum_values(a,b):\n    return a+b\n',
      );
      await fs.writeFile(
        path.join(toolRoot, 'actions/sum.py'),
        "from lib.sum import sum_values\ndef execute(value, context):\n    print('action diagnostic')\n    return {'sum':sum_values(value['a'],value['b'])}\n",
      );
      await fs.writeFile(
        path.join(toolRoot, 'tool.json'),
        JSON.stringify({
          kind: 'tool',
          id: 'calculator',
          actions: [{ ...action, executor: { runtime: 'python', entry: 'actions/sum.py' } }],
        }),
      );
      const tools = (await broker.customTools()).tools;
      broker.register('run', tools);
      expect(await broker.execute(tools[0].name, { a: 2, b: 3 }, 'python', context)).toEqual({
        sum: 5,
      });
    },
  );
  it('rejects invalid arguments before approval or execution', async () => {
    await expect(
      broker.execute(catalog[0].name, { a: 'wrong', b: 3 }, 'bad', context),
    ).rejects.toThrow('Schema');
    expect(approvals).toBe(0);
  });
  it('keeps the independent readonly plan policy', async () => {
    await expect(
      broker.execute(catalog[0].name, { a: 2, b: 3 }, 'plan', { ...context, modeId: 'plan' }),
    ).rejects.toThrow('计划模式');
    expect(approvals).toBe(0);
  });
  it('does not run a rejected action', async () => {
    await expect(
      broker.execute(catalog[0].name, { a: 2, b: 3 }, 'denied', {
        ...context,
        askApproval: async () => ({ decision: 'rejected' }),
      }),
    ).rejects.toThrow('拒绝');
  });
  it('denies side effects in read-only mode before asking approval', async () => {
    await expect(
      broker.execute(catalog[0].name, { a: 2, b: 3 }, 'readonly', {
        ...context,
        permissionMode: 'read-only',
      }),
    ).rejects.toThrow('仅可查看');
    expect(approvals).toBe(0);
  });
  it('allows confined workspace writes in the default preset without approval', async () => {
    const write = {
      ...catalog[0],
      id: 'workspace.write',
      name: 'workspace_write',
      effects: ['write'] as HostTool['effects'],
      execute: async () => ({ sum: 5 }),
    };
    broker.register('run', [write]);
    expect(await broker.execute(write.name, { a: 2, b: 3 }, 'workspace', context)).toEqual({
      sum: 5,
    });
    expect(approvals).toBe(0);
  });
  it('allows authorized code in full-access mode without approval', async () => {
    expect(
      await broker.execute(catalog[0].name, { a: 2, b: 3 }, 'full', {
        ...context,
        permissionMode: 'danger-full-access',
      }),
    ).toEqual({ sum: 5 });
    expect(approvals).toBe(0);
  });
  it('read-only revocation overrides an earlier full-access authorization', async () => {
    let permission: BrokerContext['permissionMode'] = 'danger-full-access';
    const live = { ...context, getPermissionMode: () => permission! };
    await broker.authorize(catalog[0].name, { a: 2, b: 3 }, 'revoked', live);
    permission = 'read-only';
    await expect(broker.execute(catalog[0].name, { a: 2, b: 3 }, 'revoked', live)).rejects.toThrow(
      '仅可查看',
    );
  });
  it('detects changes to shared libraries after authorization', async () => {
    await broker.authorize(catalog[0].name, { a: 2, b: 3 }, 'changed', context);
    await fs.writeFile(path.join(toolRoot, 'lib/sum.mjs'), 'export const sum = () => 999;');
    await expect(
      broker.execute(catalog[0].name, { a: 2, b: 3 }, 'changed', context),
    ).rejects.toThrow('ACTION_CHANGED');
  });
  it('validates canonical output', async () => {
    await fs.writeFile(
      path.join(toolRoot, 'actions/sum.mjs'),
      "export async function execute() { return {sum:'invalid'}; }",
    );
    const tools = (await broker.customTools()).tools;
    broker.register('run', tools);
    await expect(broker.execute(tools[0].name, { a: 2, b: 3 }, 'output', context)).rejects.toThrow(
      'Schema',
    );
  });
  it('routes declared nested capabilities through the same broker', async () => {
    await fs.writeFile(
      path.join(toolRoot, 'actions/sum.mjs'),
      "export async function execute(input,context) { const result=await context.callTool('workspace.test',input); return {sum:result.value}; }",
    );
    await fs.writeFile(
      path.join(toolRoot, 'tool.json'),
      JSON.stringify({
        kind: 'tool',
        id: 'calculator',
        actions: [{ ...action, capabilities: ['workspace.test'] }],
      }),
    );
    const tools = (await broker.customTools()).tools;
    const nested = {
      ...tools[0],
      id: 'workspace.test',
      name: 'workspace_test',
      outputSchema: {
        type: 'object',
        properties: { value: { type: 'number' } },
        required: ['value'],
      },
      effects: ['read'] as HostTool['effects'],
      execute: async () => ({ value: 5 }),
    };
    broker.register('run', [...tools, nested]);
    expect(await broker.execute(tools[0].name, { a: 2, b: 3 }, 'nested', context)).toEqual({
      sum: 5,
    });
    expect(approvals).toBe(1);
  });
  it('denies undeclared nested capabilities', async () => {
    await fs.writeFile(
      path.join(toolRoot, 'actions/sum.mjs'),
      "export async function execute(input,context) { return context.callTool('workspace.test',input); }",
    );
    const tools = (await broker.customTools()).tools;
    broker.register('run', tools);
    await expect(
      broker.execute(tools[0].name, { a: 2, b: 3 }, 'nested-deny', context),
    ).rejects.toThrow('ACTION_CAPABILITY_DENIED');
  });
  it('settles cancellation and records an unknown side effect outcome', async () => {
    await fs.writeFile(
      path.join(toolRoot, 'actions/sum.mjs'),
      'export async function execute() { await new Promise(r=>setTimeout(r,10000)); return {sum:5}; }',
    );
    const tools = (await broker.customTools()).tools;
    broker.register('run', tools);
    const controller = new AbortController();
    const pending = broker.execute(tools[0].name, { a: 2, b: 3 }, 'cancel', {
      ...context,
      signal: controller.signal,
    });
    setTimeout(() => controller.abort(new Error('test-stop')), 100);
    await expect(pending).rejects.toThrow('test-stop');
    expect(store.events('run').at(-1)?.payload.unknownOutcome).toBe(true);
  });
});
