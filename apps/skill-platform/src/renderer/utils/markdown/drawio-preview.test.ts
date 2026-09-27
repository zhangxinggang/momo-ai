// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { globalConfig } from '../../../../../../packages/momo-markdown/src/components/MdEditor/config';
import { EditorContext } from '../../../../../../packages/momo-markdown/src/components/MdEditor/context';
import useDrawioPreview from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/hooks/useDrawioPreview';

let root: Root;
let host: HTMLDivElement;
const source = '# Before\n\n```mermaid\nflowchart LR\nA --> B\n```\n\nAfter';
const id = 'drawio-123e4567-e89b-42d3-a456-426614174000';
const imageUrl = `http://localhost:28081/assets/${id}.png`;

function Preview({
  markdown,
  html,
  onChange,
  readOnly = false,
  preview = true,
}: {
  markdown: string;
  html: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  preview?: boolean;
}) {
  const node = useDrawioPreview(
    { modelValue: markdown, onChange, readOnly, setting: { preview } } as any,
    html,
    0,
  );
  return createElement(
    'div',
    null,
    preview &&
      createElement('div', { id: 'test-preview', dangerouslySetInnerHTML: { __html: html } }),
    node,
  );
}
async function render(
  markdown: string,
  html: string,
  onChange: (value: string) => void,
  options: { readOnly?: boolean; preview?: boolean } = {},
) {
  if (!host) {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  }
  await act(async () =>
    root.render(
      createElement(
        EditorContext.Provider,
        { value: { editorId: 'test' } as any },
        createElement(Preview, { markdown, html, onChange, ...options }),
      ),
    ),
  );
}
async function event(data: unknown) {
  const frame = document.querySelector('iframe')!;
  await act(async () =>
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'http://localhost:28081',
        source: frame.contentWindow,
        data: JSON.stringify(data),
      }),
    ),
  );
}
afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  host = undefined as any;
});
const graphHtml =
  '<p class="md-editor-mermaid" data-line="2"><svg></svg><span class="md-editor-mermaid-action"></span></p>';
function configure() {
  const save = vi.fn().mockResolvedValue({ assetId: id, imageUrl });
  const load = vi.fn().mockResolvedValue('<mxGraphModel />');
  globalConfig.editorExtensions.drawio = {
    editorUrl: 'http://localhost:28081/drawio/index.html',
    saveDiagram: save,
    loadDiagram: load,
  };
  return { save, load };
}

describe('Markdown preview diagram editing', () => {
  it('adds editing actions when a hidden preview becomes visible', async () => {
    configure();
    const onChange = vi.fn();
    await render(source, graphHtml, onChange, { preview: false });
    expect(document.querySelector('[aria-label="图形编辑"]')).toBeNull();
    await render(source, graphHtml, onChange, { preview: true });
    expect(document.querySelector('[aria-label="图形编辑"]')).not.toBeNull();
  });

  it('removes editing actions when the document becomes read-only', async () => {
    configure();
    const onChange = vi.fn();
    await render(source, graphHtml, onChange);
    expect(document.querySelector('[aria-label="图形编辑"]')).not.toBeNull();
    await render(source, graphHtml, onChange, { readOnly: true });
    expect(document.querySelector('[aria-label="图形编辑"]')).toBeNull();
  });

  it('replaces the selected source fence with PNG Markdown and preserves adjacent content', async () => {
    const { save } = configure();
    const onChange = vi.fn();
    await render(source, graphHtml, onChange);
    await act(async () =>
      (document.querySelector('[aria-label="图形编辑"]') as HTMLButtonElement).click(),
    );
    await event({ event: 'save', xml: '<mxGraphModel />' });
    await event({ event: 'export', data: 'data:image/png;base64,test' });
    expect(save).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(`# Before\n\n![](${imageUrl})\n\nAfter`);
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('opens saved images after asynchronous XML loading and overwrites the existing asset', async () => {
    const { save, load } = configure();
    const onChange = vi.fn();
    await render(`![](${imageUrl})`, `<figure><img src="${imageUrl}"></figure>`, onChange);
    await act(async () =>
      (document.querySelector('[aria-label="图形编辑"]') as HTMLButtonElement).click(),
    );
    expect(load).toHaveBeenCalledWith(id);
    expect(document.querySelector('iframe')).not.toBeNull();
    await event({ event: 'save', xml: '<mxGraphModel changed="true" />' });
    await event({ event: 'export', data: 'data:image/png;base64,test' });
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ assetId: id }));
    expect(onChange).not.toHaveBeenCalled();
    expect(document.querySelector('figure img')?.getAttribute('src')).toContain('drawio-version=');
    const image = document.querySelector<HTMLImageElement>('figure img')!;
    const setSrc = vi.spyOn(image, 'src', 'set');
    try {
      await act(async () => image.dispatchEvent(new Event('load')));
      await act(async () =>
        (document.querySelector('[aria-label="缩放"]') as HTMLButtonElement).click(),
      );
      expect(document.querySelector('figure')?.hasAttribute('data-grab')).toBe(true);
      expect(setSrc).not.toHaveBeenCalled();
    } finally {
      setSrc.mockRestore();
    }
  });

  it('does not overwrite source edited while the graphic editor is open', async () => {
    const { save } = configure();
    const onChange = vi.fn();
    await render(source, graphHtml, onChange);
    await act(async () =>
      (document.querySelector('[aria-label="图形编辑"]') as HTMLButtonElement).click(),
    );
    await render(source.replace('A --> B', 'A --> C'), graphHtml, onChange);
    await event({ event: 'save', xml: '<mxGraphModel />' });
    await event({ event: 'export', data: 'data:image/png;base64,test' });
    expect(save).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('图形源码已变化');
  });
});
