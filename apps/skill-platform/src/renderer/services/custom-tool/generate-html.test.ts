import { describe, expect, it } from 'vitest';

import {
  buildToolBundleMessages,
  extractStreamingHtml,
  parseToolBundleOutput,
  stripToolHtmlCodeFence,
} from './generate-html';

describe('custom tool bundle generation protocol', () => {
  it('streams index.html before the rest of the bundle is complete', () => {
    const raw = [
      '<<<MOMO_TOOL_FILE path="index.html">>>',
      '<!doctype html><html><body><h1>正在生成',
    ].join('\n');

    expect(extractStreamingHtml(raw)).toBe('<!doctype html><html><body><h1>正在生成');
  });

  it('does not render a partial protocol marker as HTML', () => {
    expect(extractStreamingHtml('<<<MOMO_TOOL_FILE path="index')).toBe('');
  });

  it('strips an accidental code fence while streaming a protocol bundle', () => {
    const raw = [
      '<<<MOMO_TOOL_FILE path="index.html">>>',
      '```html',
      '<!doctype html><html><body>实时内容',
    ].join('\n');

    expect(extractStreamingHtml(raw)).toBe('<!doctype html><html><body>实时内容');
  });

  it('parses multiple files and rejects traversal paths', () => {
    const raw = [
      '<<<MOMO_TOOL_FILE path="index.html">>>',
      '<!doctype html><h1>工具</h1>',
      '<<<MOMO_TOOL_FILE path="tool.json">>>',
      '{"kind":"tool","version":2,"service":{"runtime":"none"}}',
      '<<<MOMO_TOOL_FILE path="../outside.txt">>>',
      'blocked',
      '<<<MOMO_TOOL_FILE path="backend/server.mjs">>>',
      'console.log("ready")',
    ].join('\n');

    expect(parseToolBundleOutput(raw)).toEqual([
      { path: 'index.html', content: '<!doctype html><h1>工具</h1>' },
      {
        path: 'tool.json',
        content: '{"kind":"tool","version":2,"service":{"runtime":"none"}}',
      },
      { path: 'backend/server.mjs', content: 'console.log("ready")' },
    ]);
  });

  it('keeps compatibility with fenced single-file HTML', () => {
    expect(parseToolBundleOutput('```html\n<html>ok</html>\n```')).toEqual([
      { path: 'index.html', content: '<html>ok</html>' },
    ]);
  });

  it('repairs a fenced HTML file saved by an older version', () => {
    expect(stripToolHtmlCodeFence('```html\n<html>legacy</html>\n```')).toBe('<html>legacy</html>');
  });

  it('strips per-file fences from the final bundle', () => {
    const raw = [
      '<<<MOMO_TOOL_FILE path="index.html">>>',
      '```html',
      '<html>ok</html>',
      '```',
      '<<<MOMO_TOOL_FILE path="tool.json">>>',
      '```json',
      '{"kind":"tool","version":2,"service":{"runtime":"none"}}',
      '```',
    ].join('\n');

    expect(parseToolBundleOutput(raw)).toEqual([
      { path: 'index.html', content: '<html>ok</html>' },
      {
        path: 'tool.json',
        content: '{"kind":"tool","version":2,"service":{"runtime":"none"}}',
      },
    ]);
  });

  it('places the current entry first in the model context', () => {
    const messages = buildToolBundleMessages(
      [
        { path: 'backend/server.mjs', content: 'server' },
        { path: 'index.html', content: '<html />' },
      ],
      '增加接口',
    );
    expect(messages[1].content.indexOf('path="index.html"')).toBeLessThan(
      messages[1].content.indexOf('path="backend/server.mjs"'),
    );
    expect(messages[0].content).toContain('MOMO_TOOL_PORT');
  });
});
