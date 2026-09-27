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

  it('does not expose legacy tool.json packages', () => {
    const service = createService();
    const root = (service as unknown as { rootDirectory: string }).rootDirectory;
    const legacy = path.join(root, 'legacy');
    fs.mkdirSync(legacy, { recursive: true });
    fs.writeFileSync(path.join(legacy, 'tool.json'), '{"kind":"tool","actions":[]}');
    expect(service.listTree()[0]).toMatchObject({ name: 'legacy', kind: 'folder' });
    expect(() => service.readDocument('legacy')).toThrow('旧格式');
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
