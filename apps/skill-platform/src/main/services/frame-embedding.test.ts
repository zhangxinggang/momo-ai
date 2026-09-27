import { createServer, type Server } from 'node:http';
import { createRequire } from 'node:module';
import { afterEach, expect, it } from 'vitest';
import { createFrameEmbeddingMiddleware } from '../../../../../packages/momo-server/src/services/http-server/frame-embedding';

const require = createRequire(
  new URL('../../../../../packages/momo-server/package.json', import.meta.url),
);
const Koa = require('koa');
const helmet = require('koa-helmet');
let server: Server | undefined;
afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    if (!server) return resolve();
    server.close((error) => (error ? reject(error) : resolve()));
    server.closeAllConnections();
  });
  server = undefined;
});

async function request(frameAncestors?: string[]) {
  const app = new Koa();
  app.use(helmet());
  app.use(createFrameEmbeddingMiddleware(frameAncestors));
  app.use((ctx: any) => {
    ctx.body = '<html>local editor</html>';
  });
  server = createServer(app.callback());
  await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number };
  return fetch(`http://127.0.0.1:${address.port}/drawio/index.html`);
}

it('allows configured local parents with CSP while preserving the other Helmet headers', async () => {
  const ancestors = ["'self'", 'file:', 'http://localhost:*', 'http://127.0.0.1:*'];
  const response = await request(ancestors);
  expect(response.headers.get('x-frame-options')).toBeNull();
  expect(response.headers.get('content-security-policy')).toBe(
    `frame-ancestors ${ancestors.join(' ')}`,
  );
  expect(response.headers.get('x-content-type-options')).toBe('nosniff');
});

it('keeps SAMEORIGIN for hosts that have not opted into embedding', async () => {
  const response = await request();
  expect(response.headers.get('x-frame-options')).toBe('SAMEORIGIN');
  expect(response.headers.get('content-security-policy')).toBeNull();
});
