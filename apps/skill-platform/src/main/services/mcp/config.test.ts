import { describe, expect, it } from 'vitest';

import { EMcpTransportType } from '@/types/modules/mcp';

import { inferMcpTransport, parseMcpServersFileJson, validateMcpServersFile } from './config';
import { decodeMcpToolName, encodeMcpToolName } from './tool-name';

describe('inferMcpTransport', () => {
  it('有 command 推断为 stdio', () => {
    expect(inferMcpTransport({ command: 'npx' })).toBe(EMcpTransportType.EStdio);
  });

  it('有 url 且 type=sse 为 sse', () => {
    expect(inferMcpTransport({ type: 'sse', url: 'http://x' })).toBe(EMcpTransportType.ESse);
  });

  it('有 url 默认 http', () => {
    expect(inferMcpTransport({ url: 'http://x' })).toBe(EMcpTransportType.EHttp);
  });
});

describe('parseMcpServersFileJson', () => {
  it('合法 JSON 通过', () => {
    const file = parseMcpServersFileJson(
      JSON.stringify({ mcpServers: { a: { command: 'npx', args: ['-y', 'x'] } } }),
    );
    expect(file.mcpServers.a.command).toBe('npx');
  });

  it('非法 JSON 抛错', () => {
    expect(() => parseMcpServersFileJson('{')).toThrow();
  });

  it('缺少 mcpServers 抛错', () => {
    expect(() => parseMcpServersFileJson('{}')).toThrow(/mcpServers/);
  });
});

describe('validateMcpServersFile', () => {
  it('stdio 缺少 command 记入 invalid，不阻断其他项', () => {
    const result = validateMcpServersFile({
      mcpServers: {
        bad: { args: [] },
        good: { command: 'node', args: ['a.js'] },
      },
    });
    expect(result.valid.mcpServers.good).toBeDefined();
    expect(result.errors.some((e) => e.name === 'bad')).toBe(true);
  });
});

describe('tool-name', () => {
  it('编解码往返', () => {
    const encoded = encodeMcpToolName('fs', 'read_file');
    expect(encoded).toBe('fs__read_file');
    expect(decodeMcpToolName(encoded)).toEqual({ serverName: 'fs', toolName: 'read_file' });
  });
});
