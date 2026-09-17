// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { Editor } from '../../../../../../packages/momo-markdown/node_modules/@tiptap/core/dist/index.js';
import { buildRichTextExtensions } from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/richtext/extensions';
import { normalizeMermaidSource } from '../../../../../../packages/momo-markdown/src/components/MdEditor/utils/chart/mermaid-source';

function getExtension(name: string) {
  const extension = buildRichTextExtensions('', true, 30).find((item) => item.name === name);

  expect(extension, `${name} extension`).toBeDefined();
  return extension!;
}

describe('rich-text editor parity', () => {
  it('copies rendered content instead of Markdown source', () => {
    expect(getExtension('markdown').options.transformCopiedText).toBe(false);
    expect(getExtension('markdown').options.breaks).toBe(true);
  });

  it('pastes fenced Mermaid as a diagram code block instead of inline KaTeX nodes', () => {
    const editor = new Editor({
      extensions: buildRichTextExtensions('', true, 30),
      content: '',
    });
    const markdown = `# 系统架构总览

\`\`\`mermaid
flowchart LR
  User\\[用户\\]
\`\`\``;
    const plugin = editor.state.plugins.find((item) => item.key.startsWith('momoMarkdownPaste'));
    const handlePaste = plugin?.spec.props?.handlePaste as
      | ((view: typeof editor.view, event: ClipboardEvent) => boolean)
      | undefined;

    expect(handlePaste).toBeDefined();
    expect(
      handlePaste?.(editor.view, {
        clipboardData: {
          getData: (type) => (type === 'text/plain' ? markdown : ''),
        },
      } as ClipboardEvent),
    ).toBe(true);

    const documentJson = editor.getJSON();
    const mermaidBlock = documentJson.content?.find((node) => node.type === 'codeBlock');
    expect(mermaidBlock).toMatchObject({ attrs: { language: 'mermaid' } });
    expect(mermaidBlock?.content?.[0]).toMatchObject({ text: 'flowchart LR\n  User\\[用户\\]' });
    expect(JSON.stringify(documentJson)).not.toContain('katex');

    editor.destroy();
  });

  it('restores Mermaid syntax escaped by rich-text clipboard sources', () => {
    expect(normalizeMermaidSource('User\\[用户\\]\nMain["A&lt;br/&gt;B"]')).toBe(
      'User[用户]\nMain["A<br/>B"]',
    );
  });

  it('uses the preview task-list hooks', () => {
    const taskList = getExtension('taskList');
    expect(taskList.options.HTMLAttributes).toMatchObject({
      class: 'contains-task-list',
    });
    expect(getExtension('taskItem').options.HTMLAttributes).toMatchObject({
      class: 'task-list-item',
    });

    const tightAttribute = (taskList.config as any).addAttributes.call({}).tight;
    const tightList = document.createElement('ul');
    tightList.innerHTML = '<li>one</li><li>two</li>';
    const looseList = document.createElement('ul');
    looseList.innerHTML = '<li><p>one</p></li><li><p>two</p></li>';

    expect(tightAttribute.parseHTML(tightList)).toBe(true);
    expect(tightAttribute.parseHTML(looseList)).toBe(false);
    expect(tightAttribute.renderHTML({ tight: false })).toEqual({ 'data-tight': 'false' });
  });

  it('does not apply preview-container styles to inline links or images', () => {
    expect(getExtension('link').options.HTMLAttributes?.class).toBeFalsy();
    expect(getExtension('image').options.HTMLAttributes?.class).toBeFalsy();
  });

  it('renders the same image and caption structure as markdown-it-image-figures', () => {
    const image = getExtension('image');
    const renderHTML = image.config.renderHTML as any;
    expect(
      renderHTML.call(
        { options: image.options },
        { HTMLAttributes: { src: 'figure.png', alt: '图注' } },
      ),
    ).toEqual([
      'figure',
      {},
      ['img', { src: 'figure.png', alt: '图注', class: 'md-zoom' }],
      ['figcaption', {}, '图注'],
    ]);
  });
});
