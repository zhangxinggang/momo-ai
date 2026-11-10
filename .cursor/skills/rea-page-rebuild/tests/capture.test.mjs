import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { capture, parseOptions, saveEvidence } from '../scripts/capture.mjs';

test('validates target and CDP inputs without modifying a normal browser profile', () => {
  assert.throws(() => parseOptions(['--url', 'file:///secret']));
  assert.throws(() => parseOptions(['--url', 'https://user:password@example.com']));
  assert.throws(() =>
    parseOptions(['--url', 'https://example.com', '--cdp', 'http://remote:9222']),
  );
  assert.equal(parseOptions(['--check']).check, true);
});
test('writes a bounded readable summary, redirected URL and verified screenshot pixels', async () => {
  const out = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-rea-test-'));
  const manifest = { url: 'https://example.com/tool', operations: {}, limitations: [] };
  await saveEvidence(
    out,
    'page',
    JSON.stringify({
      normalized_result: {
        target: { url: 'https://example.com/login' },
        scripts: { items: [{ url: 'https://example.com/app.js', source: 'large script' }] },
        accessibility: {
          nodes: [
            { name: '登录', role: 'button' },
            { name: 'hidden', ignored: true },
          ],
        },
      },
    }),
    manifest,
  );
  const summary = JSON.parse(await fs.readFile(path.join(out, 'page-summary.json'), 'utf8'));
  assert.equal(manifest.observedUrl, 'https://example.com/login');
  assert.equal(manifest.limitations.length, 1);
  assert.equal(summary.accessibility.length, 1);
  assert.deepEqual(summary.scripts, [{ url: 'https://example.com/app.js' }]);
  const png = Buffer.from('test png bytes');
  await saveEvidence(
    out,
    'screenshot',
    JSON.stringify({
      normalized_result: {
        artifact: {
          media_type: 'image/png',
          data_base64: png.toString('base64'),
          sha256: createHash('sha256').update(png).digest('hex'),
        },
      },
    }),
    manifest,
  );
  assert.deepEqual(await fs.readFile(path.join(out, 'screenshot.png')), png);
  await assert.rejects(
    saveEvidence(
      out,
      'screenshot',
      JSON.stringify({
        normalized_result: {
          artifact: {
            media_type: 'image/png',
            data_base64: png.toString('base64'),
            sha256: 'wrong',
          },
        },
      }),
      manifest,
    ),
    /摘要校验失败/,
  );
});
test('records partial failures while preserving independent successful evidence', async () => {
  const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify([{ id: 'target', type: 'page', url: 'https://example.com/tool' }]));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const out = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-rea-test-'));
    const manifest = await capture(
      { url: 'https://example.com/tool', out, cdp: `http://127.0.0.1:${server.address().port}` },
      {
        runRea: async (args) => {
          if (args[0] === 'analyze-web-bundle') throw new Error('bundle unavailable');
          return JSON.stringify({ normalized_result: {} });
        },
      },
    );
    assert.equal(manifest.operations.page.status, 'captured');
    assert.equal(manifest.operations.bundle.status, 'failed');
    assert.equal(manifest.operations.screenshot.status, 'captured');
    assert.equal(
      JSON.parse(await fs.readFile(path.join(out, 'manifest.json'), 'utf8')).operations.bundle
        .error,
      'bundle unavailable',
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
