import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DCustomToolMeta } from '@/types/modules';

vi.mock('./workspace', () => ({ customToolWorkspaceService: {} }));

import { CustomToolRuntimeService, type ICustomToolRuntimeWorkspace } from './runtime';

describe('CustomToolRuntimeService', () => {
  let tempDirectory = '';
  let runtime: CustomToolRuntimeService | null = null;
  let meta: DCustomToolMeta;

  beforeEach(() => {
    tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'momo-custom-tool-'));
    fs.writeFileSync(path.join(tempDirectory, 'index.html'), '<!doctype html><h1>demo</h1>');
    fs.writeFileSync(path.join(tempDirectory, 'tool.json'), '{}');
    fs.mkdirSync(path.join(tempDirectory, 'backend'));
    meta = {
      kind: 'tool',
      version: 2,
      entry: 'index.html',
      service: { runtime: 'none' },
      permissions: { mcp: ['demo__echo'], skills: [] },
    };
    const workspace: ICustomToolRuntimeWorkspace = {
      resolveToolDirectory: () => tempDirectory,
      readMeta: () => meta,
    };
    runtime = new CustomToolRuntimeService(workspace);
  });

  afterEach(async () => {
    await runtime?.dispose();
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  });

  it('serves the entry with the host bridge and hides private files', async () => {
    const info = await runtime!.activate('demo');
    expect(info.status).toBe('running');
    expect(info.previewUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/$/);

    const html = await fetch(info.previewUrl).then((response) => response.text());
    expect(html).toContain('<h1>demo</h1>');
    expect(html).toContain('window.momoTool');
    expect(html).toContain('demo__echo');

    const privateResponse = await fetch(new URL('/tool.json', info.previewUrl));
    expect(privateResponse.status).toBe(403);
  });

  it('starts a Node backend on a dynamic port and proxies requests', async () => {
    const backendSource = `
      import http from 'http';
      const host = process.env.MOMO_TOOL_HOST;
      const port = Number(process.env.MOMO_TOOL_PORT);
      http.createServer((request, response) => {
        response.setHeader('content-type', 'application/json');
        response.end(JSON.stringify({ path: request.url, port, root: process.env.MOMO_TOOL_ROOT }));
      }).listen(port, host);
    `;
    fs.writeFileSync(path.join(tempDirectory, 'backend', 'server.mjs'), backendSource);
    meta = {
      ...meta,
      service: {
        runtime: 'node',
        entry: 'backend/server.mjs',
        healthPath: '/health',
        startupTimeoutMs: 5_000,
      },
    };

    const info = await runtime!.activate('demo');
    expect(info.status).toBe('running');
    const result = await fetch(new URL('/__tool_api__/hello?q=1', info.previewUrl)).then(
      (response) => response.json() as Promise<{ path: string; port: number; root: string }>,
    );
    expect(result.path).toBe('/hello?q=1');
    expect(result.port).toBeGreaterThan(0);
    expect(result.root).toBe(tempDirectory);
  });
});
