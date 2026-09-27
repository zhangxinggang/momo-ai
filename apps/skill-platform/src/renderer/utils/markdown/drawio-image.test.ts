// @vitest-environment jsdom
import { Blob as NodeBlob } from 'node:buffer';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { globalConfig } from '../../../../../../packages/momo-markdown/src/components/MdEditor/config';
import { EditorContext } from '../../../../../../packages/momo-markdown/src/components/MdEditor/context';
import useDrawioPreview from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/hooks/useDrawioPreview';
import DrawioImageView from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/richtext/nodes/diagram/DrawioImageView';

const imageUrl = 'http://localhost:28081/assets/drawio-123e4567-e89b-42d3-a456-426614174000.png';
const modes = ['richtext', 'preview'] as const;
let root: Root;
let host: HTMLDivElement;
let write: ReturnType<typeof vi.fn>;
let originalDrawio: typeof globalConfig.editorExtensions.drawio;

function Preview({ src }: { src: string }) {
  const html = `<figure><img src="${src}"></figure>`;
  const node = useDrawioPreview({ modelValue: `![](${src})`, onChange: vi.fn() } as any, html, 0);
  return createElement(
    'div',
    null,
    createElement('div', { id: 'image-test-preview', dangerouslySetInnerHTML: { __html: html } }),
    node,
  );
}
async function render(mode: (typeof modes)[number], src = imageUrl) {
  await act(async () =>
    root.render(
      mode === 'richtext'
        ? createElement(DrawioImageView, {
            node: { attrs: { src } },
            selected: false,
            updateAttributes: vi.fn(),
          } as any)
        : createElement(
            EditorContext.Provider,
            { value: { editorId: 'image-test' } as any },
            createElement(Preview, { src }),
          ),
    ),
  );
}
function button(label: string) {
  return host.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
}

beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  originalDrawio = globalConfig.editorExtensions.drawio;
  globalConfig.editorExtensions.drawio = {
    loadDiagram: vi.fn().mockResolvedValue('<mxGraphModel />'),
    saveDiagram: vi.fn().mockResolvedValue({ imageUrl }),
  };
  write = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { write } });
  vi.stubGlobal('Blob', NodeBlob);
  vi.stubGlobal(
    'ClipboardItem',
    class {
      constructor(public data: Record<string, Blob>) {}
    },
  );
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => new NodeBlob(['PNG image bytes'], { type: 'image/png' }),
    }),
  );
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = vi.fn().mockReturnValue('blob:drawio-png');
      static revokeObjectURL = vi.fn();
    },
  );
  vi.stubGlobal('requestAnimationFrame', vi.fn());
  vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  globalConfig.editorExtensions.drawio = originalDrawio;
  delete (navigator as any).clipboard;
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe.each(modes)('draw.io image toolbar in %s', (mode) => {
  it('copies and downloads the PNG and keeps the five actions in order', async () => {
    vi.useFakeTimers();
    await render(mode);
    expect(
      Array.from(host.querySelectorAll('button'), (node) => node.getAttribute('aria-label')),
    ).toEqual(['复制图片', '缩放', '全屏', '下载', '图形编辑']);
    expect(host.querySelector('[title="源码编辑"]')).toBeNull();
    await act(async () => button('复制图片').click());
    expect(fetch).toHaveBeenCalledWith(imageUrl, { mode: 'cors' });
    expect(write.mock.calls[0][0][0].data['image/png'].type).toBe('image/png');
    expect(host.querySelector('.lucide-check')).not.toBeNull();
    await act(async () => button('下载').click());
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    expect(blob.type).toBe('image/png');
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
    expect(globalConfig.editorExtensions.drawio?.loadDiagram).not.toHaveBeenCalled();
    await act(async () => vi.runOnlyPendingTimersAsync());
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:drawio-png');
  });

  it('zooms the image, opens the image in fullscreen, and cleans up on replacement', async () => {
    await render(mode);
    const figure = host.querySelector('figure')!;
    const image = figure.querySelector('img')!;
    await act(async () => button('缩放').click());
    expect(figure.hasAttribute('data-grab')).toBe(true);
    figure.dispatchEvent(new WheelEvent('wheel', { deltaY: -1, cancelable: true }));
    expect(image.style.transform).toContain('scale(1.08)');
    // Toolbar presses must not start a drag of the image.
    button('全屏').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    figure.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50 }));
    expect(image.style.transform).toContain('translate(0px, 0px)');
    await act(async () => button('退出缩放').click());
    expect(image.style.transform).toBe('');
    await act(async () => button('全屏').click());
    const fullscreenImage = document.querySelector('.md-editor-chart-fullscreen-transform img');
    expect(fullscreenImage?.getAttribute('src')).toBe(imageUrl);
    expect(figure.querySelector('[aria-label="退出全屏"]')).not.toBeNull();
    await render(mode, 'http://localhost:28081/assets/ordinary.png');
    expect(document.querySelector('.md-editor-chart-fullscreen-overlay')).toBeNull();
    expect(host.querySelector('button')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('keeps fullscreen copy and exit controls clickable and accepts zoom gestures', async () => {
    await render(mode);
    await act(async () => button('全屏').click());
    const overlay = document.querySelector('.md-editor-chart-fullscreen-overlay')!;
    const copy = overlay.querySelector<HTMLButtonElement>('[aria-label="复制图片"]')!;
    expect(copy.tagName).toBe('BUTTON');
    await act(async () => copy.click());
    expect(write).toHaveBeenCalledTimes(1);
    const viewport = overlay.querySelector('.md-editor-chart-fullscreen-viewport')!;
    viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: -1, cancelable: true }));
    expect(
      (overlay.querySelector('.md-editor-chart-fullscreen-transform') as HTMLElement).style
        .transform,
    ).toContain('scale(1.08)');
    const exit = overlay.querySelector<HTMLButtonElement>('[title="退出全屏"]')!;
    await act(async () => exit.click());
    expect(document.querySelector('.md-editor-chart-fullscreen-overlay')).toBeNull();
  });
});
