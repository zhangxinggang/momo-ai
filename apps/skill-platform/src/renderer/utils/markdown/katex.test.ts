// @vitest-environment jsdom
import MarkdownIt from 'markdown-it';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import katex from '../../../../../../packages/momo-markdown/node_modules/katex/dist/katex.mjs';
import { globalConfig } from '../../../../../../packages/momo-markdown/src/components/MdEditor/config';
import KatexPlugin from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/markdownIt/katex';
import KatexView from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/richtext/nodes/katex/KatexView';

vi.mock('@tiptap/react', () => ({
  NodeViewWrapper: ({ as, children, ...props }: any) => createElement(as, props, children),
}));

let container: HTMLDivElement;
let root: Root;
const previousConfig = globalConfig.katexConfig;
const previousInstance = globalConfig.editorExtensions.katex?.instance;
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  globalConfig.katexConfig = (options) => options;
  globalConfig.editorExtensions.katex!.instance = katex;
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  globalConfig.katexConfig = previousConfig;
  globalConfig.editorExtensions.katex!.instance = previousInstance;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function renderNode(latex: string, block: boolean) {
  await act(async () =>
    root.render(
      createElement(KatexView, {
        node: { attrs: { latex }, type: { name: block ? 'katexBlock' : 'katexInline' } },
        selected: false,
        updateAttributes: vi.fn(),
        editor: { isFocused: () => false },
      }),
    ),
  );
}
function preview(source: string) {
  return new MarkdownIt().use(KatexPlugin, { katexRef: { current: katex } }).render(source);
}

describe('KaTeX Unicode labels and shared configuration', () => {
  it.each([false, true])(
    'matches Markdown formula markup and wrapper (block: %s)',
    async (block) => {
      const latex = 'x^2 + \\frac{1}{2}';
      await renderNode(latex, block);
      const className = block ? 'md-editor-katex-block' : 'md-editor-katex-inline';
      const formula = container.querySelector(`.${className}`)!;
      const expected = document.createElement('div');
      expected.innerHTML = preview(block ? `$$\n${latex}\n$$` : `$${latex}$`);
      expect(formula.tagName).toBe(block ? 'P' : 'SPAN');
      expect(formula.hasAttribute('data-processed')).toBe(true);
      expect(formula.querySelector('.katex-html')?.outerHTML).toBe(
        expected.querySelector('.katex-html')?.outerHTML,
      );
      expect(formula.querySelector('math mrow')?.outerHTML).toBe(
        expected.querySelector('math mrow')?.outerHTML,
      );
    },
  );
  it('preserves HTML-sensitive formula source before KaTeX loads', () => {
    const md = new MarkdownIt().use(KatexPlugin, { katexRef: { current: null } });
    const html = md.render('$x < y \\text{<tag>&}$');
    const node = document.createElement('div');
    node.innerHTML = html;
    expect(node.querySelector('.md-editor-katex-inline')?.textContent).toBe('x < y \\text{<tag>&}');
    expect(node.querySelector('tag')).toBeNull();
  });
  it.each([false, true])(
    'renders Chinese labels without strict warnings (block: %s)',
    async (block) => {
      const warn = vi.spyOn(console, 'warn');
      const latex = '开始 \\rightarrow 流程 \\rightarrow 结束';
      await renderNode(latex, block);
      expect(container.querySelector('.katex')).not.toBeNull();
      expect(container.textContent).toContain('开始');
      expect(Boolean(container.querySelector('.katex-display'))).toBe(block);
      expect(preview(block ? `$$\n${latex}\n$$` : `$${latex}$`)).toContain('class="katex"');
      expect(warn).not.toHaveBeenCalled();
    },
  );

  it('honors configured macros in both the node view and Markdown preview', async () => {
    globalConfig.katexConfig = (options) => ({
      ...options,
      macros: { '\\custom': '\\frac{1}{2}' },
    });
    await renderNode('\\custom', false);
    expect(container.querySelector('.mfrac')).not.toBeNull();
    expect(preview('$\\custom$')).toContain('mfrac');
  });

  it.each([false, true])('renders emoji with native MathML fonts (block: %s)', async (block) => {
    const warn = vi.spyOn(console, 'warn');
    const latex = '\\frac{1}{2} + \\text{😄👩‍💻🇨🇳}';
    await renderNode(latex, block);
    expect(container.querySelector('math mfrac')).not.toBeNull();
    expect(container.querySelector('math')?.textContent).toContain('😄👩‍💻🇨🇳');
    expect(container.querySelector('.katex-html')).toBeNull();
    const html = preview(block ? `$$\n${latex}\n$$` : `$${latex}$`);
    expect(html).toContain('<mfrac>');
    expect(html).toContain('😄👩‍💻🇨🇳');
    expect(warn).not.toHaveBeenCalled();
  });

  it('continues to warn for other LaTeX compatibility issues and displays invalid syntax', async () => {
    const warn = vi.spyOn(console, 'warn');
    await renderNode('x%comment', false);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[commentAtEnd]'));
    await renderNode('\\frac{', false);
    expect(container.querySelector('.katex-error')).not.toBeNull();
  });
});
