// @vitest-environment jsdom
import less from 'less';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Editor } from '../../../../../../packages/momo-markdown/node_modules/@tiptap/core/dist/index.js';
import { EditorContent } from '../../../../../../packages/momo-markdown/node_modules/@tiptap/react/dist/index.js';
import { globalConfig } from '../../../../../../packages/momo-markdown/src/components/MdEditor/config';
import { buildRichTextExtensions } from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/richtext/extensions';
import { bindDrawioImageActions } from '../../../../../../packages/momo-markdown/src/components/MdEditor/utils/chart/diagram-viewer';

vi.mock(
  '../../../../../../packages/momo-markdown/src/components/MdEditor/utils/plantuml-renderer',
  () => ({
    renderPlantumlImage: vi.fn().mockResolvedValue('data:image/png;base64,AA=='),
  }),
);

const imageUrl = 'http://localhost:28081/assets/drawio-123e4567-e89b-42d3-a456-426614174000.png';
const originalExtensions = { ...globalConfig.editorExtensions };
let editor: Editor;
let root: Root;
let host: HTMLDivElement;

async function mount(content: string) {
  await act(async () => {
    editor = new Editor({ extensions: buildRichTextExtensions('', false, 30), content });
    root.render(createElement(EditorContent, { editor }));
  });
}

async function click(element: Element | null) {
  expect(element).not.toBeNull();
  await act(async () => {
    element!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('requestAnimationFrame', vi.fn());
  globalConfig.editorExtensions.mermaid = {
    instance: {
      render: vi.fn().mockResolvedValue({ svg: '<svg><rect width="80" height="40" /></svg>' }),
    } as any,
  };
  globalConfig.editorExtensions.echarts = {
    instance: {
      init: (box: HTMLElement) => {
        box.innerHTML = '<canvas></canvas>';
        return { setOption: vi.fn(), dispose: vi.fn() };
      },
    } as any,
  };
  globalConfig.editorExtensions.drawio = {
    loadDiagram: vi.fn().mockResolvedValue('<mxGraphModel />'),
    saveDiagram: vi.fn().mockResolvedValue({ imageUrl }),
  };
  host = document.createElement('div');
  host.className = 'md-editor-preview md-editor-richtext default-theme';
  document.body.appendChild(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
    editor?.destroy();
  });
  host.remove();
  Object.assign(globalConfig.editorExtensions, originalExtensions);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('media node selection', () => {
  it('omits the src attribute for a legacy empty image without a React warning', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    await mount('After');
    await act(async () => editor.commands.setImage({ src: '' }));
    expect(host.querySelector('figure > img')?.hasAttribute('src')).toBe(false);
    expect(error.mock.calls.flat().join(' ')).not.toContain('empty string');
  });
  it.each([
    ['mermaid', 'flowchart LR\nA --> B', 'rect'],
    ['flowchart', 'flowchart LR\nA --> B', 'rect'],
    ['echarts', '{ xAxis: {}, yAxis: {}, series: [] }', 'canvas'],
    ['plantuml', '@startuml\nAlice -> Bob\n@enduml', 'img'],
  ])('selects the whole %s diagram and allows deleting it', async (language, source, target) => {
    await mount('```' + language + '\n' + source + '\n```\n\nAfter');
    const before = editor.getJSON();
    await click(host.querySelector(`.md-editor-diagram-preview ${target}`));
    expect(editor.state.selection.constructor.name).toBe('NodeSelection');
    expect((editor.state.selection as any).node.type.name).toBe('codeBlock');
    expect(host.querySelector('.md-editor-diagram-selected')).not.toBeNull();
    expect(editor.getJSON()).toEqual(before);
    await act(async () => editor.commands.setTextSelection(editor.state.doc.content.size - 1));
    expect(host.querySelector('.md-editor-diagram-selected')).toBeNull();
    await click(host.querySelector('.md-editor-diagram-preview'));
    await act(async () => {
      editor.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
    });
    expect(editor.getJSON().content?.some((node) => node.type === 'codeBlock')).toBe(false);
    expect(editor.getText()).toBe('After');
  });

  it.each(['ordinary.png', imageUrl])(
    'selects an image and clears the selected appearance on deselection (%s)',
    async (src) => {
      await mount(`![Caption](${src})\n\nAfter`);
      await click(host.querySelector('figure > img'));
      expect((editor.state.selection as any).node.type.name).toBe('image');
      expect(host.querySelector('figure.ProseMirror-selectednode')).not.toBeNull();
      expect(host.querySelector('figure')?.getAttribute('data-align')).toBe('center');
      await act(async () => editor.commands.setTextSelection(editor.state.doc.content.size - 1));
      expect(host.querySelector('figure.ProseMirror-selectednode')).toBeNull();
    },
  );

  it('keeps toolbar clicks separate from selecting the diagram or draw.io image', async () => {
    await mount('```mermaid\nflowchart LR\nA --> B\n```\n\nAfter');
    await act(async () => editor.commands.setTextSelection(editor.state.doc.content.size - 1));
    await click(host.querySelector('[title="缩放"]'));
    expect(editor.state.selection.constructor.name).toBe('TextSelection');
    expect(host.querySelector('.md-editor-diagram-preview')?.hasAttribute('data-grab')).toBe(true);
    await act(async () => editor.commands.setContent(`![](${imageUrl})\n\nAfter`));
    await act(async () => editor.commands.setTextSelection(editor.state.doc.content.size - 1));
    await click(host.querySelector('[aria-label="缩放"]'));
    expect(editor.state.selection.constructor.name).toBe('TextSelection');
    expect(host.querySelector('figure')?.hasAttribute('data-grab')).toBe(true);
  });

  it('uses matching action sizes before and after conversion, including preview mode', async () => {
    const base = resolve(
      __dirname,
      '../../../../../../packages/momo-markdown/src/components/MdEditor',
    );
    const read = (file: string) => readFileSync(resolve(base, file), 'utf8');
    const { css } = await less.render(
      read('styles/vars.less') +
        '\n' +
        read('layouts/Content/richtext/index.less') +
        '\n' +
        read('styles/preview.less').replace(/^@import.*;$/gm, ''),
    );
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    const sizes = (container: Element) =>
      Array.from(container.querySelectorAll('.md-editor-mermaid-action button'), (button) => {
        const control = getComputedStyle(button);
        const icon = getComputedStyle(button.querySelector('svg')!);
        return [
          control.width,
          control.height,
          control.padding,
          icon.width,
          icon.height,
          icon.padding,
          icon.boxSizing,
        ];
      });
    try {
      await mount('```mermaid\nflowchart LR\nA --> B\n```');
      await click(host.querySelector('.md-editor-diagram-preview'));
      const diagramOutline = getComputedStyle(host.querySelector('.md-editor-diagram')!).outline;
      const expected = ['24px', '24px', '0px', '24px', '24px', '6px', 'border-box'];
      expect(sizes(host)).toEqual(Array(6).fill(expected));
      await act(async () => editor.commands.setContent(`![](${imageUrl})`));
      await click(host.querySelector('figure > img'));
      expect(sizes(host)).toEqual(Array(5).fill(expected));
      expect(getComputedStyle(host.querySelector('figure')!).outline).toBe(diagramOutline);
      expect(diagramOutline).toContain('--md-theme-link-color');
      const preview = document.createElement('div');
      preview.className = 'md-editor-preview';
      preview.innerHTML = `<figure><img src="${imageUrl}"><div class="md-editor-mermaid-action"></div></figure>`;
      document.body.appendChild(preview);
      const cleanup = bindDrawioImageActions(
        preview.querySelector('figure')!,
        preview.querySelector('.md-editor-mermaid-action')!,
        { customIcon: {} as any },
      );
      try {
        expect(sizes(preview)).toEqual(Array(4).fill(expected));
      } finally {
        cleanup();
        preview.remove();
      }
    } finally {
      style.remove();
    }
  });
});
