// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Editor } from '../../../../../../packages/momo-markdown/node_modules/@tiptap/core/dist/index.js';
import {
  defaultContextValue,
  EditorContext,
} from '../../../../../../packages/momo-markdown/src/components/MdEditor/context';
import { buildRichTextExtensions } from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/richtext/extensions';
import LinkEditor from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/richtext/LinkEditor';
import ToolbarPreview from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Toolbar/tools/Preview';
import { renderMermaidSvg } from '../../../../../../packages/momo-markdown/src/components/MdEditor/utils/chart/render-mermaid';

const editors: Editor[] = [];
const hosts: HTMLDivElement[] = [];
afterEach(() => {
  editors.splice(0).forEach((editor) => editor.destroy());
  hosts.splice(0).forEach((host) => host.remove());
  vi.restoreAllMocks();
});
function editor(content: string) {
  const editor = new Editor({ extensions: buildRichTextExtensions('', false, 30), content });
  editors.push(editor);
  return editor;
}
function key(editor: Editor, key: string) {
  let handled = false;
  editor.view.someProp('handleKeyDown', (handler) => {
    handled = handler(editor.view, new KeyboardEvent('keydown', { key, bubbles: true }));
    return handled;
  });
  expect(handled).toBe(true);
}
it('keeps a new drawing separate from a following heading when switching to Markdown', () => {
  const ed = editor('# Heading\n\nAfter');
  ed.commands.setTextSelection(1);
  ed.commands.setImage({
    src: 'http://localhost/assets/drawio-new.png',
    alt: 'Drawing caption',
    title: 'Drawing "title"',
  });
  const markdown = (ed.storage as any).markdown.getMarkdown();
  expect(markdown).toContain(')\n\n# Heading');
  const before = ed.getJSON();
  ed.commands.setContent(markdown);
  expect(ed.getJSON()).toEqual(before);
});
describe('rendered diagram deletion', () => {
  it.each(['mermaid', 'plantuml'])(
    'removes the whole %s when backspacing from the following paragraph',
    (lang) => {
      const ed = editor(`Before\n\n\`\`\`${lang}\nA -> B\n\`\`\`\n\nAfter`);
      let after = 0;
      ed.state.doc.descendants((node, pos) => {
        if (node.type.name === 'paragraph' && node.textContent === 'After') after = pos + 1;
      });
      ed.commands.setTextSelection(after);
      key(ed, 'Backspace');
      expect(ed.getText()).toBe('Before\n\nAfter');
      expect(ed.getJSON().content?.some((node) => node.type === 'codeBlock')).toBe(false);
    },
  );
  it.each(['mermaid', 'plantuml'])(
    'removes %s with Delete from the preceding paragraph',
    (lang) => {
      const ed = editor(`Before\n\n\`\`\`${lang}\nA -> B\n\`\`\`\n\nAfter`);
      ed.commands.setTextSelection(7);
      key(ed, 'Delete');
      expect(ed.getText()).toBe('Before\n\nAfter');
    },
  );
  it('deletes a selected diagram without exposing its source as normal text', () => {
    const ed = editor('```mermaid\nflowchart LR\nA --> B\n```');
    ed.commands.setNodeSelection(0);
    key(ed, 'Backspace');
    expect(ed.getText()).toBe('');
  });
});
it('cleans up Mermaid temporary error diagrams on render failure', async () => {
  const mermaid = {
    render: vi.fn(async (_id: string, _text: string, container: HTMLElement) => {
      container.innerHTML = '<svg>Syntax error in text mermaid version 11.15.0</svg>';
      throw new Error('invalid syntax');
    }),
  };
  await expect(renderMermaidSvg(mermaid, 'test-diagram', 'broken')).rejects.toThrow(
    'invalid syntax',
  );
  expect(document.body.textContent).not.toContain('Syntax error');
});
it('selects only the preview button while preview-only is active', async () => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement('div');
  hosts.push(host);
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () =>
    root.render(
      createElement(
        EditorContext.Provider,
        {
          value: {
            ...defaultContextValue,
            editorMode: 'markdown',
            setting: { fullscreen: false, htmlPreview: false, preview: true, previewOnly: true },
          },
        },
        createElement(ToolbarPreview),
      ),
    ),
  );
  expect(host.querySelector('.md-editor-toolbar-active')).toBeNull();
  await act(async () => root.unmount());
});
it('adds a link to selected formatted text after confirming in the popover', async () => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  const ed = editor('**Selected text** after');
  const range = { from: 1, to: 14 };
  ed.commands.setTextSelection(range);
  vi.spyOn(ed.view, 'coordsAtPos').mockReturnValue({
    left: 200,
    right: 300,
    top: 300,
    bottom: 320,
  });
  const host = document.createElement('div');
  hosts.push(host);
  document.body.appendChild(host);
  const root = createRoot(host);
  const close = vi.fn();
  await act(async () =>
    root.render(createElement(LinkEditor, { editor: ed, range, onClose: close })),
  );
  const input = document.querySelector<HTMLInputElement>('[aria-label="链接地址"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
      input,
      'https://example.com',
    );
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(async () =>
    document
      .querySelector('form[aria-label="插入链接"]')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
  );
  expect(ed.getHTML()).toContain('href="https://example.com"');
  expect(ed.getHTML()).toContain('<strong>Selected text</strong>');
  expect(ed.getText()).toBe('Selected text after');
  expect(close).toHaveBeenCalled();
  await act(async () => root.unmount());
});
