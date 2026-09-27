import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { CustomToolWorkspaceService } from './workspace';

const temporaryDirectories: string[] = [];

function createService() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'momo-tool-workspace-'));
  temporaryDirectories.push(root);
  return new CustomToolWorkspaceService(root);
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe('CustomToolWorkspaceService', () => {
  it('creates OpenUI tools by default and persists component settings', () => {
    const service = createService();
    const created = service.createTool(null, '天气面板');
    expect(created.kind).toBe('tool');
    expect(service.readDocument(created.id)).toMatchObject({ kind: 'openui', content: '' });
    const saved = service.saveDocument(created.id, {
      kind: 'openui',
      content: 'root = TextContent("西安天气")',
      components: {},
    });
    expect(saved.content).toContain('TextContent');
  });

  it('creates webpage tools and updates their URL without creating a view file', () => {
    const service = createService();
    const created = service.createTool(null, '产品门户', {
      kind: 'web',
      url: 'https://example.com/start',
    });

    expect(service.readDocument(created.id)).toMatchObject({
      kind: 'web',
      content: 'https://example.com/start',
    });
    const saved = service.saveDocument(created.id, {
      kind: 'web',
      content: 'https://example.com/dashboard',
      components: {},
    });
    expect(saved.content).toBe('https://example.com/dashboard');
    expect(service.listTree()[0]).toMatchObject({
      id: created.id,
      webUrl: 'https://example.com/dashboard',
    });
    expect(() =>
      service.saveDocument(created.id, {
        kind: 'web',
        content: 'file:///etc/passwd',
        components: {},
      }),
    ).toThrow('仅支持 HTTP 或 HTTPS');
  });

  it('shows legacy tool.json packages as leaf tools without exposing their directories', () => {
    const service = createService();
    const root = (service as unknown as { rootDirectory: string }).rootDirectory;
    const legacy = path.join(root, 'legacy');
    fs.mkdirSync(path.join(legacy, 'actions'), { recursive: true });
    fs.writeFileSync(
      path.join(legacy, 'tool.json'),
      '{"kind":"tool","name":"旧版工具","entry":"index.html","actions":[]}',
    );
    fs.writeFileSync(path.join(legacy, 'index.html'), '<main>旧版工具</main>');

    expect(service.listTree()[0]).toEqual({ id: 'legacy', name: 'legacy', kind: 'tool' });
    expect(service.readDocument('legacy')).toMatchObject({
      name: '旧版工具',
      kind: 'html',
      content: '<main>旧版工具</main>',
    });

    service.saveDocument('legacy', {
      kind: 'html',
      content: '<main>已更新</main>',
      components: {},
    });
    expect(fs.readFileSync(path.join(legacy, 'index.html'), 'utf8')).toBe('<main>已更新</main>');
  });

  it('resolves only existing directories inside the custom-tool workspace', () => {
    const service = createService();
    service.createFolder(null, '目录');

    expect(service.resolveNodeDirectory('目录')).toContain('目录');
    expect(() => service.resolveNodeDirectory('../outside')).toThrow('路径无效');
    expect(() => service.resolveNodeDirectory('missing')).toThrow('工具目录不存在');
  });

  it('rejects oversized component configuration', () => {
    const service = createService();
    const created = service.createTool(null, 'size-limit');
    expect(() =>
      service.saveDocument(created.id, {
        kind: 'openui',
        content: 'root = TextContent("ok")',
        components: { large: { value: 'x'.repeat(2 * 1024 * 1024) } } as never,
      }),
    ).toThrow('组件配置超过 2MB');
  });
});
