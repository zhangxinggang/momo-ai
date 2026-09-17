import { describe, expect, it } from 'vitest';

import {
  buildToolBundleMessages,
  buildToolBundleRepairMessages,
  extractStreamingHtml,
  isEmptyToolScaffold,
  isRepairableToolBundleError,
  parseToolBundleOutput,
  stripToolHtmlCodeFence,
  validateGeneratedToolBundle,
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

  it('does not mistake a conversational refusal for generated HTML', () => {
    const response = '当前工具是一个空的占位工具，没有任何 action。请确认是否按上述方案重新生成。';

    expect(extractStreamingHtml(response)).toBe('');
    expect(parseToolBundleOutput(response)).toEqual([]);
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
      '{"kind":"tool","id":"demo","actions":[],"service":{"runtime":"none"}}',
      '<<<MOMO_TOOL_FILE path="../outside.txt">>>',
      'blocked',
      '<<<MOMO_TOOL_FILE path="backend/server.mjs">>>',
      'console.log("ready")',
    ].join('\n');

    expect(parseToolBundleOutput(raw)).toEqual([
      { path: 'index.html', content: '<!doctype html><h1>工具</h1>' },
      {
        path: 'tool.json',
        content: '{"kind":"tool","id":"demo","actions":[],"service":{"runtime":"none"}}',
      },
      { path: 'backend/server.mjs', content: 'console.log("ready")' },
    ]);
  });

  it('handles an accidentally fenced HTML response', () => {
    expect(parseToolBundleOutput('```html\n<html>ok</html>\n```')).toEqual([
      { path: 'index.html', content: '<html>ok</html>' },
    ]);
  });

  it('strips accidental code fences from a file', () => {
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
      '{"kind":"tool","id":"demo","actions":[],"service":{"runtime":"none"}}',
      '```',
    ].join('\n');

    expect(parseToolBundleOutput(raw)).toEqual([
      { path: 'index.html', content: '<html>ok</html>' },
      {
        path: 'tool.json',
        content: '{"kind":"tool","id":"demo","actions":[],"service":{"runtime":"none"}}',
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
      'a',
    );
    expect(messages[1].content.indexOf('path="index.html"')).toBeLessThan(
      messages[1].content.indexOf('path="backend/server.mjs"'),
    );
    expect(messages[0].content).toContain('MOMO_TOOL_PORT');
    expect(messages[0].content).toContain('必须至少声明一个有意义的 action');
    expect(messages[0].content).toContain('"aliases"');
    expect(messages[0].content).toContain('不要要求用户补充内部 ID');
    expect(messages[0].content).toContain('不要询问是否确认');
    expect(messages[1].content).toContain('用户可见名称：a');
    expect(messages[1].content).toContain('name 或 aliases');
  });

  it('treats a new empty tool as a scaffold that must be implemented immediately', () => {
    const currentFiles = [
      { path: 'index.html', content: '' },
      {
        path: 'tool.json',
        content: JSON.stringify({ kind: 'tool', id: 'stable-id', name: 'a', actions: [] }),
      },
    ];

    expect(isEmptyToolScaffold(currentFiles)).toBe(true);
    const messages = buildToolBundleMessages(currentFiles, '显示西安实时天气', 'a');
    expect(messages[1].content).toContain('这是刚创建的空工具脚手架');
    expect(messages[1].content).toContain('不要请求确认');
  });

  it('preflights a callable bundle before writing it', () => {
    const currentFiles = [
      { path: 'index.html', content: '' },
      {
        path: 'tool.json',
        content: JSON.stringify({ kind: 'tool', id: 'stable-id', name: 'a', actions: [] }),
      },
    ];

    expect(validateGeneratedToolBundle([], currentFiles)).toContain('index.html');
    expect(
      validateGeneratedToolBundle(
        [
          { path: 'index.html', content: '<html>weather</html>' },
          {
            path: 'tool.json',
            content: JSON.stringify({
              kind: 'tool',
              id: 'stable-id',
              actions: [{ id: 'current-weather' }],
            }),
          },
        ],
        currentFiles,
      ),
    ).toBeNull();
  });

  it('builds a no-confirmation repair turn for an invalid first response', () => {
    const currentFiles = [
      { path: 'index.html', content: '' },
      { path: 'tool.json', content: '{"kind":"tool","id":"stable-id","actions":[]}' },
    ];
    const messages = buildToolBundleRepairMessages(
      currentFiles,
      '显示西安实时天气',
      'a',
      '请确认后我再生成。',
      '缺少可调用 action',
    );

    expect(messages.at(-2)).toEqual({ role: 'assistant', content: '请确认后我再生成。' });
    expect(messages.at(-1)?.content).toContain('这不是需要向用户确认的问题');
    expect(messages.at(-1)?.content).toContain('只输出 MOMO_TOOL_FILE');
    expect(
      isRepairableToolBundleError(
        "Error invoking remote method 'tool:writeGeneratedFiles': AI 生成的工具必须至少包含一个可供 AI 对话调用的 action",
      ),
    ).toBe(true);
  });
});
