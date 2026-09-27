import type { ICustomToolPlugin } from '@/types/modules';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { executePlugin, validatePlugin } from './plugin-runtime';
import { CustomToolWorkspaceService } from './workspace';

const plugin: ICustomToolPlugin = {
  identifier: 'text-length',
  description: '统计文本字符数',
  inputSchema: {
    type: 'object',
    properties: { text: { type: 'string', title: '文本' } },
    required: ['text'],
    additionalProperties: false,
  },
  outputSchema: {
    type: 'object',
    properties: { count: { type: 'integer', title: '字符数' } },
    required: ['count'],
    additionalProperties: false,
  },
  tests: [
    { name: '中文', input: { text: '你好' }, expected: { count: 2 } },
    { name: '空文本', input: { text: '' }, expected: { count: 0 } },
  ],
};
const content = 'function execute(input) { return { count: [...input.text].length }; }';
const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});
function workspace() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'momo-plugin-'));
  roots.push(root);
  return { root, service: new CustomToolWorkspaceService(root) };
}

describe('validated AI tool lifecycle', () => {
  it('reserves identifiers globally across folders, case variants and drafts', () => {
    const { service } = workspace();
    service.createFolder(null, 'A');
    service.createFolder(null, 'B');
    service.createTool('A', '文本', { kind: 'plugin', identifier: plugin.identifier });
    expect(() =>
      service.createTool('B', '同标识', { kind: 'plugin', identifier: 'TEXT-LENGTH' }),
    ).toThrow('全局唯一');
    for (const identifier of [
      '中文',
      '../text',
      'text tool',
      '1text',
      'text2',
      'run_code',
      'workspace_read',
    ])
      expect(() => service.createTool(null, '非法', { kind: 'plugin', identifier })).toThrow();
    expect(() =>
      service.createTool(null, '.hidden', { kind: 'plugin', identifier: 'hidden' }),
    ).toThrow();
    expect(service.pluginTools()).toEqual([]);
  });
  it('publishes only tested versions, invokes real code, survives moves, updates and recursive deletion', async () => {
    const { root, service } = workspace();
    const created = service.createTool(null, '文本', {
      kind: 'plugin',
      identifier: plugin.identifier,
    });
    const saved = await service.savePlugin(created.id, {
      kind: 'plugin',
      content,
      plugin,
      components: {},
    });
    expect(saved.validation?.results).toHaveLength(2);
    expect(fs.readFileSync(path.join(root, '文本/index.mjs'), 'utf8')).toContain(
      'ctx.tools.register',
    );
    const [registered] = service.pluginTools();
    const context = { signal: new AbortController().signal } as any;
    expect(await registered.execute({ text: '😀abc' }, context)).toEqual({ count: 4 });
    const folder = service.createFolder(null, '目录');
    const moved = service.move(created.id, folder.id);
    expect(await registered.execute({ text: 'abc' }, context)).toEqual({ count: 3 });
    await expect(
      service.savePlugin(moved.id, {
        kind: 'plugin',
        content: 'function execute() { return { count: 100 }; }',
        plugin,
        components: {},
      }),
    ).rejects.toThrow('未通过');
    expect(service.readDocument(moved.id).validation?.revision).toBe(saved.validation?.revision);
    const renamed = service.rename(moved.id, '新名称');
    expect(service.pluginTools()[0].title).toBe('新名称');
    const updated = { ...plugin, description: '更新后的描述' };
    await service.savePlugin(renamed.id, {
      kind: 'plugin',
      content,
      plugin: updated,
      components: {},
    });
    await expect(registered.execute({ text: 'abc' }, context)).rejects.toThrow('已更新');
    expect(service.pluginTools()[0].description).toBe(updated.description);
    service.deleteNode(folder.id);
    expect(service.pluginTools()).toEqual([]);
    await expect(registered.execute({ text: 'abc' }, context)).rejects.toThrow('已删除');
    expect(() => service.deleteNode('')).toThrow('根目录');
  });
  it('does not resurrect a plugin deleted while validation is running', async () => {
    const { service } = workspace();
    const created = service.createTool(null, '临时', {
      kind: 'plugin',
      identifier: plugin.identifier,
    });
    const saving = service.savePlugin(created.id, {
      kind: 'plugin',
      content,
      plugin,
      components: {},
    });
    service.deleteNode(created.id);
    await expect(saving).rejects.toThrow();
    expect(service.listTree()).toEqual([]);
  });
  it('does not expose damaged persisted tools or let them break the Agent catalog', async () => {
    const { root, service } = workspace();
    service.createTool(null, '损坏工具', { kind: 'plugin', identifier: plugin.identifier });
    fs.writeFileSync(path.join(root, '损坏工具/momo-tool.json'), '{broken');
    expect(service.listTree()).toMatchObject([{ name: '损坏工具', kind: 'tool' }]);
    expect(service.pluginTools()).toEqual([]);
    expect(() => service.readDocument('损坏工具')).toThrow('损坏');
  });
  it('rejects syntax, schema, assertions, invalid output and host access', async () => {
    await expect(validatePlugin('function execute(', plugin)).rejects.toThrow();
    await expect(
      validatePlugin(content, { ...plugin, inputSchema: { type: 'string' } }),
    ).rejects.toThrow('object');
    await expect(executePlugin(content, plugin, { text: 123 })).rejects.toThrow('不符合定义');
    await expect(
      executePlugin('function execute() { return { count: "bad" }; }', plugin, { text: '' }),
    ).rejects.toThrow('不符合定义');
    await expect(
      executePlugin('function execute() { return process.env; }', plugin, { text: '' }),
    ).rejects.toThrow('process');
    await expect(
      executePlugin(
        'function execute() { return this.constructor.constructor("return process")(); }',
        plugin,
        { text: '' },
      ),
    ).rejects.toThrow();
  });
  it('terminates loops and supports cancellation', async () => {
    await expect(
      executePlugin('function execute() { while (true) {} }', plugin, { text: '' }),
    ).rejects.toThrow(/timed out|超时/);
    const controller = new AbortController();
    const execution = executePlugin(
      'async function execute() { return new Promise(() => {}); }',
      plugin,
      { text: '' },
      controller.signal,
    );
    controller.abort();
    await expect(execution).rejects.toThrow('取消');
  });
});
