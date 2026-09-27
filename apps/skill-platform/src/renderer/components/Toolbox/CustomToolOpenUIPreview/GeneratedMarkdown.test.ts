import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { GeneratedMarkdown, splitPresentationMarkdown } from './GeneratedMarkdown';
vi.mock('@renderer/components/ui/MarkdownPreview', () => ({ MarkdownPreview: () => null }));
it('renders old ASCII topology without copy buttons, code gutters or Markdown fences', () => {
  const value = '电网\n\n```text\n[节点A] ==> [节点B]\n  核心发电机\n```';
  const html = renderToStaticMarkup(createElement(GeneratedMarkdown, { value, theme: 'dark' }));
  expect(html).toContain('示意图');
  expect(html).toContain('核心发电机');
  expect(html).not.toMatch(/<code|<pre|复制|```/);
});
it('retains deliberate programming samples and multiple Markdown sections', () => {
  const parts = splitPresentationMarkdown('```js\nconst x = 1;\n```\n说明\n```\nA → B\n```\n尾部');
  expect(parts.map((p) => p.kind)).toEqual(['markdown', 'diagram', 'markdown']);
  expect(parts[0].text).toContain('const x');
});
