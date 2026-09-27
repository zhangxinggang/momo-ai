// @vitest-environment jsdom
import less from 'less';
import MarkdownIt from 'markdown-it';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditorState } from '../../../../../../packages/momo-markdown/node_modules/@codemirror/state/dist/index.js';
import { Editor } from '../../../../../../packages/momo-markdown/node_modules/@tiptap/core/dist/index.js';
import ImageFigures from '../../../../../../packages/momo-markdown/node_modules/markdown-it-image-figures/dist/markdown-it-images-figures.mjs';
import { allToolbar } from '../../../../../../packages/momo-markdown/src/components/MdEditor/config';
import {
  defaultContextValue,
  EditorContext,
} from '../../../../../../packages/momo-markdown/src/components/MdEditor/context';
import type CodeMirrorUt from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/codemirror';
import { buildRichTextExtensions } from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/richtext/extensions';
import { applyRichTextDirective } from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/richtext/toolbar';
import Toolbar from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Toolbar';
import { directive2flag } from '../../../../../../packages/momo-markdown/src/components/MdEditor/utils/content-help';
import bus from '../../../../../../packages/momo-markdown/src/components/MdEditor/utils/event-bus';

const editors: Editor[] = [];
afterEach(() => {
  editors.splice(0).forEach((editor) => editor.destroy());
  vi.restoreAllMocks();
});

function editor(content = '') {
  const editor = new Editor({ extensions: buildRichTextExtensions('', false, 30), content });
  editors.push(editor);
  return editor;
}

function markdown(editor: Editor): string {
  return (editor.storage as any).markdown.getMarkdown();
}

async function alignSource(source: string, from: number, to: number, alignment: string) {
  const state = EditorState.create({ doc: source, selection: { anchor: from, head: to } });
  return directive2flag('align', { view: { state }, getValue: () => source } as CodeMirrorUt, {
    alignment,
  });
}

describe('editor alignment', () => {
  it.each(['left', 'center', 'right'])(
    'round-trips %s for formatted paragraphs and headings',
    (alignment) => {
      const ed = editor('# **Title**\n\nHello *world*\nnext line');
      ed.commands.setTextSelection({ from: 1, to: ed.state.doc.content.size - 1 });
      applyRichTextDirective(ed, 'align', { alignment });
      const before = ed.getJSON();
      expect(before.content?.every((node) => node.attrs?.textAlign === alignment)).toBe(true);
      const source = markdown(ed);
      expect(source).toContain(`data-align="${alignment}"`);
      expect(source).toContain('# **Title**');
      expect(source).toContain('*world*');
      ed.commands.setContent(source);
      expect(ed.getJSON()).toEqual(before);
    },
  );

  it('aligns only the cursor paragraph and supports undo', () => {
    const ed = editor('First\n\nSecond');
    ed.commands.setTextSelection(2);
    applyRichTextDirective(ed, 'align', { alignment: 'right' });
    expect(ed.getJSON().content?.map((node) => node.attrs?.textAlign)).toEqual(['right', null]);
    ed.commands.undo();
    expect(ed.getJSON().content?.map((node) => node.attrs?.textAlign)).toEqual([null, null]);
  });

  it('preserves alignment in list items and table cells', () => {
    const ed = editor(
      '- **One**\n- Two\n\n1. Ordered\n2. List\n\n- [x] Done\n- [ ] Todo\n\n| A | B |\n| - | - |\n| C | D |',
    );
    ed.commands.setTextSelection({ from: 1, to: ed.state.doc.content.size - 1 });
    applyRichTextDirective(ed, 'align', { alignment: 'center' });
    const before = ed.getJSON();
    ed.commands.setContent(markdown(ed));
    expect(ed.getJSON()).toEqual(before);
  });

  it('preserves the alignment of an empty paragraph', () => {
    const ed = editor();
    applyRichTextDirective(ed, 'align', { alignment: 'right' });
    expect(ed.getJSON().content?.[0].attrs?.textAlign).toBe('right');
    const before = ed.getJSON();
    ed.commands.setContent(markdown(ed));
    expect(ed.getJSON()).toEqual(before);
  });

  it.each(['left', 'center', 'right'])(
    'round-trips %s for a selected image with its caption',
    (alignment) => {
      const ed = editor('![Caption](https://example.com/image.png "Title")\n\nAfter');
      expect(ed.getJSON().content?.[0].attrs?.textAlign).toBe('center');
      ed.commands.setNodeSelection(0);
      applyRichTextDirective(ed, 'align', { alignment });
      const before = ed.getJSON();
      expect(before.content?.[0].attrs?.textAlign).toBe(alignment);
      ed.commands.setContent(markdown(ed));
      expect(ed.getJSON()).toEqual(before);
    },
  );

  it('defaults newly inserted images to center and ignores read-only alignment commands', () => {
    const ed = editor();
    applyRichTextDirective(ed, 'image', { url: 'image.png' });
    expect(ed.getJSON().content?.find((node) => node.type === 'image')?.attrs?.textAlign).toBe(
      'center',
    );
    ed.commands.setNodeSelection(0);
    ed.setEditable(false);
    const before = ed.getJSON();
    applyRichTextDirective(ed, 'align', { alignment: 'right' });
    expect(ed.getJSON()).toEqual(before);
  });

  it('aligns the Markdown cursor line and updates its wrapper when changed again', async () => {
    const source = 'Before\n\n![Caption](image.png)\n\nAfter';
    const result = await alignSource(
      source,
      source.indexOf('Caption'),
      source.indexOf('Caption'),
      'right',
    );
    const next =
      source.slice(0, result.options.replaceStart) +
      result.text +
      source.slice(result.options.replaceEnd);
    expect(next).toContain('Before\n\n<div data-align="right"');
    expect(next).toContain('![Caption](image.png)');
    const updated = await alignSource(
      next,
      next.indexOf('Caption'),
      next.indexOf('Caption'),
      'left',
    );
    expect(updated.text.match(/<div/g)).toHaveLength(1);
    expect(updated.text).toContain('data-align="left"');
    const ed = editor(
      next.slice(0, updated.options.replaceStart) +
        updated.text +
        next.slice(updated.options.replaceEnd),
    );
    expect(ed.getJSON().content?.find((node) => node.type === 'image')?.attrs?.textAlign).toBe(
      'left',
    );
    expect(ed.getText()).toContain('Before');
    expect(ed.getText()).toContain('After');
  });

  it('retains Markdown syntax inside a source selection', async () => {
    const source = '# Heading\n\n**Bold** and $x$\n\n```mermaid\nflowchart LR\nA --> B\n```';
    const result = await alignSource(source, 0, source.length, 'center');
    expect(result.text).toContain(source);
    const ed = editor(result.text);
    expect(ed.getJSON().content?.[0]).toMatchObject({
      type: 'heading',
      attrs: { textAlign: 'center' },
    });
    expect(ed.getJSON().content?.find((node) => node.type === 'codeBlock')?.content?.[0].text).toBe(
      'flowchart LR\nA --> B',
    );
  });

  it('updates aligned HTML tables in Markdown mode without losing cells', async () => {
    const ed = editor('| A | B |\n| - | - |\n| C | D |');
    ed.commands.setTextSelection({ from: 1, to: ed.state.doc.content.size - 1 });
    applyRichTextDirective(ed, 'align', { alignment: 'center' });
    const source = markdown(ed);
    const result = await alignSource(source, 0, source.length, 'right');
    ed.commands.setContent(result.text);
    const table = ed.getJSON().content?.[0];
    expect(table?.type).toBe('table');
    expect(
      table?.content
        ?.flatMap((row) => row.content || [])
        .every((cell) => cell.content?.[0].attrs?.textAlign === 'right'),
    ).toBe(true);
  });

  it('centers default images and applies each explicit alignment in preview and rich text', async () => {
    const style = document.createElement('style');
    const stylesPath = resolve(
      __dirname,
      '../../../../../../packages/momo-markdown/src/components/MdEditor/styles',
    );
    const source = readFileSync(resolve(stylesPath, 'preview.less'), 'utf8').replace(
      /^@import.*$/gm,
      '',
    );
    const variables = readFileSync(resolve(stylesPath, 'vars.less'), 'utf8');
    const css = await less.render(variables + '\n' + source);
    expect(css.css).toContain('.md-editor-preview figure {\n  display: block;');
    style.textContent =
      '.md-editor-preview figure{display:inline-flex;flex-direction:column;text-align:center}' +
      css.css;
    document.head.appendChild(style);
    const host = document.createElement('div');
    host.className = 'md-editor';
    document.body.appendChild(host);
    const md = new MarkdownIt({ html: true }).use(ImageFigures, {
      figcaption: true,
      classes: 'md-zoom',
    });
    try {
      for (const mode of ['preview', 'richtext']) {
        for (const alignment of [null, 'left', 'center', 'right']) {
          const ed = editor('![Caption](image.png)');
          if (alignment) {
            ed.commands.setNodeSelection(0);
            applyRichTextDirective(ed, 'align', { alignment });
          }
          host.innerHTML = `<div class="md-editor-preview">${mode === 'preview' ? md.render(markdown(ed)) : ed.getHTML()}</div>`;
          const figure = host.querySelector('figure')!;
          const image = figure.querySelector('img')!;
          expect(getComputedStyle(figure).display).toBe('block');
          expect(getComputedStyle(image).marginLeft).toBe(alignment === 'left' ? '0px' : 'auto');
          expect(getComputedStyle(image).marginRight).toBe(alignment === 'right' ? '0px' : 'auto');
        }
      }
    } finally {
      host.remove();
      style.remove();
    }
  });

  it('places the dropdown before unordered list and emits each alignment without stealing focus', async () => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    const emit = vi.spyOn(bus, 'emit');
    try {
      await act(async () =>
        root.render(
          createElement(
            EditorContext.Provider,
            {
              value: { ...defaultContextValue, editorId: 'alignment-test' },
            },
            createElement(Toolbar, { toolbars: ['align', 'unorderedList'], toolbarsExclude: [] }),
          ),
        ),
      );
      expect(allToolbar.indexOf('align')).toBe(allToolbar.indexOf('unorderedList') - 1);
      expect(
        Array.from(host.querySelectorAll('.md-editor-toolbar-item')).map((item) =>
          item.getAttribute('aria-label'),
        ),
      ).toEqual(['对齐', '无序列表']);
      const trigger = host.querySelector('[aria-label="对齐"]')!;
      await act(async () => trigger.dispatchEvent(new MouseEvent('mouseenter')));
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      const items = host.querySelectorAll('[role="menuitem"]');
      expect(Array.from(items).map((item) => item.textContent)).toEqual([
        '左对齐',
        '居中对齐',
        '右对齐',
      ]);
      for (const [index, alignment] of ['left', 'center', 'right'].entries()) {
        const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        expect(items[index].dispatchEvent(event)).toBe(false);
        await act(async () =>
          items[index].dispatchEvent(new MouseEvent('click', { bubbles: true })),
        );
        expect(emit).toHaveBeenLastCalledWith('alignment-test', 'replace', 'align', { alignment });
      }
    } finally {
      await act(async () => root.unmount());
      host.remove();
    }
  });
});
