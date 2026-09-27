import fs from 'node:fs/promises';
import http, { type Server } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformWithEsbuild } from 'vite';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';

const origin = 'http://localhost:5173';
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jqaIAAAAASUVORK5CYII=',
  'base64',
);
let fixtureDir: string;
let uploadDir: string;
let server: Server;
let baseUrl: string;

vi.mock('@renderer/services/system', () => ({
  getUploadUrl: async () => `${baseUrl}/system_api/upload`,
}));

beforeAll(async () => {
  fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-image-upload-'));
  uploadDir = path.join(fixtureDir, 'uploads');
  await fs.mkdir(uploadDir);
  const routePath = fileURLToPath(
    new URL('../../../../electron/src/main/server/system/upload.{post}.{m}.ts', import.meta.url),
  );
  // Match prepare.cjs: compile a standalone CJS route, with no neighboring source modules.
  const { code } = await transformWithEsbuild(await fs.readFile(routePath, 'utf8'), routePath, {
    loader: 'ts',
    format: 'cjs',
    platform: 'node',
    target: 'node20',
  });
  await fs.writeFile(path.join(fixtureDir, 'upload.{post}.{m}.js'), code);
});
beforeEach(async () => {
  vi.resetModules();
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const config = {
    start: true,
    protocols: { http: { start: true, port: 0 } },
    security: {
      secret: 'upload-test',
      tokenExpiresIn: '1h',
      noAuthorityRoutes: [],
      frameAncestors: ["'self'", 'http://localhost:*'],
    },
    bodyparser: {
      multipart: true,
      formidable: { uploadDir, keepExtensions: true, maxFileSize: 1024 },
    },
    routes: {
      dynamicRouteDirs: [{ rootDir: fixtureDir, rootPath: 'system_api', auth: false }],
      staticDirs: [{ rootDir: uploadDir, rootPath: 'assets', auth: false }],
    },
  };
  vi.stubGlobal('NKGlobal', { config: { services: { httpServer: config } } });
  const createServer = http.createServer;
  vi.spyOn(http, 'createServer').mockImplementation((...args: any[]) => {
    server = createServer(...args);
    return server;
  });
  const { default: HttpServer } =
    await import('../../../../../packages/momo-server/src/services/http-server');
  await new Promise<void>((resolve) => new HttpServer(config).start(resolve));
  const port = (server.address() as { port: number }).port;
  config.protocols.http.port = port;
  baseUrl = `http://localhost:${port}`;
});
afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
    server.closeAllConnections();
  });
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
afterAll(async () => {
  const target = path.resolve(fixtureDir);
  expect(path.dirname(target)).toBe(path.resolve(os.tmpdir()));
  expect(path.basename(target)).toMatch(/^momo-image-upload-/);
  await fs.rm(target, { recursive: true, force: true });
});
function form(name: string, bytes: Uint8Array = png) {
  const body = new FormData();
  body.append('file', new File([bytes], name, { type: 'image/png' }));
  return body;
}
function expectCors(response: Response) {
  expect(response.headers.get('access-control-allow-origin')).toBe(origin);
  expect(response.headers.get('vary')).toContain('Origin');
}
it.each(['selected-image.png', 'cropped-image.png'])(
  'uploads %s through the compiled route and serves identical bytes',
  async (name) => {
    const response = await fetch(`${baseUrl}/system_api/upload`, {
      method: 'POST',
      headers: { Origin: origin },
      body: form(name),
    });
    expect(response.status).toBe(200);
    expectCors(response);
    const { data } = await response.json();
    expect(data.file).toMatchObject({
      originalFilename: name,
      mimetype: 'image/png',
      size: png.length,
    });
    expect(data.file.fileurl).toMatch(new RegExp(`^${baseUrl}/assets/[^/]+\\.png$`));
    const image = await fetch(data.file.fileurl, { headers: { Origin: origin } });
    expect(image.status).toBe(200);
    expectCors(image);
    expect(Buffer.from(await image.arrayBuffer())).toEqual(png);
  },
);
it('keeps the Renderer upload callback compatible with the HTTP response', async () => {
  const { uploadMarkdownImage } = await import('../../renderer/utils/markdown/image-upload');
  const result = await uploadMarkdownImage(new File([png], 'cropped.png', { type: 'image/png' }));
  expect(result.url).toContain(`${baseUrl}/assets/`);
  const image = await fetch(result.url);
  expect(image.status).toBe(200);
});
it('answers preflight without entering the body parser or dynamic route', async () => {
  const response = await fetch(`${baseUrl}/system_api/upload`, {
    method: 'OPTIONS',
    headers: {
      Origin: origin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  });
  expect(response.status).toBe(204);
  expectCors(response);
  expect(response.headers.get('access-control-allow-methods')).toContain('POST');
  expect(response.headers.get('access-control-allow-headers')).toBe('content-type');
  expect(response.headers.get('x-content-type-options')).toBe('nosniff');
});
it('retains CORS on malformed multipart parser failures', async () => {
  const response = await fetch(`${baseUrl}/system_api/upload`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'multipart/form-data' },
    body: 'missing boundary',
  });
  expect(response.status).toBe(500);
  expectCors(response);
});
it('retains CORS on file size rejection', async () => {
  const response = await fetch(`${baseUrl}/system_api/upload`, {
    method: 'POST',
    headers: { Origin: origin },
    body: form('large.png', new Uint8Array(2048)),
  });
  expect(response.status).toBe(500);
  expectCors(response);
});
it('retains CORS when the upload route rejects an empty upload', async () => {
  const response = await fetch(`${baseUrl}/system_api/upload`, {
    method: 'POST',
    headers: { Origin: origin },
    body: new FormData(),
  });
  expect(response.status).toBe(400);
  expectCors(response);
  expect(await response.text()).toContain('请选择需要上传的文件');
});
