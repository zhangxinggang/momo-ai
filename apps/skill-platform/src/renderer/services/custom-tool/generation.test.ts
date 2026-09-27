import { describe, expect, it } from 'vitest';

import {
  resolveCustomToolGenerationKind,
  stripGeneratedView,
  validateGeneratedView,
} from './generation';

describe('custom tool view generation', () => {
  it('defaults to OpenUI unless HTML is explicitly requested', () => {
    expect(resolveCustomToolGenerationKind('生成一个天气看板')).toBe('openui');
    expect(resolveCustomToolGenerationKind('请生成 HTML 页面')).toBe('html');
  });

  it('keeps OpenUI when HTML is explicitly rejected', () => {
    expect(resolveCustomToolGenerationKind('不要使用 HTML，请生成一个数据看板')).toBe('openui');
    expect(resolveCustomToolGenerationKind('Build a dashboard without HTML')).toBe('openui');
    expect(resolveCustomToolGenerationKind('Generate an HTML dashboard')).toBe('html');
  });

  it('strips matching code fences', () => {
    expect(stripGeneratedView('```openui\nroot = TextContent("ok")\n```', 'openui')).toBe(
      'root = TextContent("ok")',
    );
  });

  it('rejects OpenUI without a root declaration', () => {
    expect(validateGeneratedView('title = TextContent("x")', 'openui')).toContain('root');
  });
});
