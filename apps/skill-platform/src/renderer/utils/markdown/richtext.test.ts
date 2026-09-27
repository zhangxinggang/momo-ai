// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import {
  Editor,
  type JSONContent,
} from '../../../../../../packages/momo-markdown/node_modules/@tiptap/core/dist/index.js';
import { buildRichTextExtensions } from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/richtext/extensions';
import { applyRichTextDirective } from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/richtext/toolbar';

const editors: Editor[] = [];
function createEditor(content = '') {
  const editor = new Editor({ extensions: buildRichTextExtensions('', false, 30), content });
  editors.push(editor);
  return editor;
}
function json(editor: Editor): JSONContent {
  return editor.getJSON() as JSONContent;
}
function markdown(editor: Editor): string {
  return (editor.storage as any).markdown.getMarkdown();
}
afterEach(() => editors.splice(0).forEach((editor) => editor.destroy()));

describe('shared rich-text toolbar', () => {
  it('inserts links as text and marks without adding a break or interpreting label HTML', () => {
    const editor = createEditor();
    applyRichTextDirective(editor, 'link', {
      desc: 'a <tag> & "label"',
      url: 'https://example.com?a=1&b=2',
    });
    const doc = json(editor);
    expect(doc.content?.[0].content).toEqual([
      expect.objectContaining({
        type: 'text',
        text: 'a <tag> & "label"',
        marks: [expect.objectContaining({ type: 'link' })],
      }),
    ]);
    expect(markdown(editor)).not.toContain('\\\n');
    editor.commands.setContent(markdown(editor));
    expect(editor.getText()).toBe('a <tag> & "label"');
    expect(editor.getHTML()).toContain('<a ');
  });

  it.each(['bold', 'italic', 'strikeThrough', 'underline', 'sub', 'sup', 'codeRow'] as const)(
    'round-trips %s through Markdown',
    (directive) => {
      const editor = createEditor('hello');
      editor.commands.setTextSelection({ from: 1, to: 6 });
      applyRichTextDirective(editor, directive);
      const before = json(editor);
      editor.commands.setContent(markdown(editor));
      expect(json(editor)).toEqual(before);
    },
  );

  it('preserves multiline diagram source without creating Markdown links or hard breaks', () => {
    const editor = createEditor();
    applyRichTextDirective(editor, 'flow');
    const node = json(editor).content?.find((node) => node.type === 'codeBlock');
    expect(node?.attrs?.language).toBe('mermaid');
    expect(node?.content?.[0].text).toContain('\n');
    expect(node?.content?.every((child) => child.type === 'text' && !child.marks)).toBe(true);
    const code = node?.content?.[0].text;
    editor.commands.setContent(markdown(editor));
    expect(json(editor).content?.find((node) => node.type === 'codeBlock')?.content?.[0].text).toBe(
      code,
    );
  });

  it('inserts images, tables and custom block Markdown as real nodes', () => {
    const image = createEditor();
    applyRichTextDirective(image, 'image', {
      url: 'https://example.com/image.png',
      desc: '<caption>',
    });
    expect(json(image).content?.some((node) => node.type === 'image')).toBe(true);
    image.commands.setContent(markdown(image));
    expect(json(image).content?.find((node) => node.type === 'image')?.attrs?.alt).toBe(
      '<caption>',
    );
    const table = createEditor();
    applyRichTextDirective(table, 'table', { selectedShape: { x: 1, y: 2 } });
    const tableNode = json(table).content?.find((node) => node.type === 'table');
    expect(tableNode?.content).toHaveLength(3);
    expect(tableNode?.content?.[0].content).toHaveLength(3);
    const block = createEditor();
    applyRichTextDirective(block, 'universal', {
      generate: () => ({ targetValue: '# Title\n\n- First\n- Second' }),
    });
    expect(json(block).content?.map((node) => node.type)).toContain('heading');
    expect(json(block).content?.map((node) => node.type)).toContain('bulletList');
  });

  it.each([
    ['https://example.com/one.png', 'https://example.com/two.png'],
    [
      { url: 'https://example.com/one.png', alt: 'First', title: 'First title' },
      { url: 'https://example.com/two.png', alt: 'Second', title: 'Second title' },
    ],
  ])(
    'inserts every uploaded image in order and preserves it when switching modes (%j)',
    (...urls) => {
      const editor = createEditor('Before');
      editor.commands.setTextSelection(7);
      applyRichTextDirective(editor, 'image', { urls });
      const images = json(editor).content?.filter((node) => node.type === 'image');
      expect(images?.map((node) => node.attrs?.src)).toEqual([
        'https://example.com/one.png',
        'https://example.com/two.png',
      ]);
      if (typeof urls[0] === 'object') {
        expect(images?.map((node) => [node.attrs?.alt, node.attrs?.title])).toEqual([
          ['First', 'First title'],
          ['Second', 'Second title'],
        ]);
      }
      editor.commands.setContent(markdown(editor));
      expect(json(editor).content?.filter((node) => node.type === 'image')).toEqual(images);
    },
  );

  it('ignores image directives without usable addresses', () => {
    const editor = createEditor('Before');
    const before = json(editor);
    for (const params of [{}, { url: '' }, { urls: ['', null, { url: '   ' }] }, { urls: [] }]) {
      applyRichTextDirective(editor, 'image', params);
      expect(json(editor)).toEqual(before);
    }
  });

  it('renders the custom highlight toolbar and keeps its mark when switching modes', () => {
    const editor = createEditor('hello');
    editor.commands.setTextSelection({ from: 1, to: 6 });
    applyRichTextDirective(editor, 'universal', {
      generate: (text: string) => ({ targetValue: `==${text}==` }),
    });
    expect(editor.getHTML()).toContain('<mark>hello</mark>');
    editor.commands.setContent(markdown(editor));
    expect(editor.getHTML()).toContain('<mark>hello</mark>');
  });
});
