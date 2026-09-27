// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DrawioEditor from '../../../../../../packages/momo-markdown/src/components/MdEditor/components/DrawioEditor';
import { globalConfig } from '../../../../../../packages/momo-markdown/src/components/MdEditor/config';

let root: Root;
let host: HTMLDivElement;
let save: ReturnType<typeof vi.fn>;
let close: ReturnType<typeof vi.fn>;
let frame: HTMLIFrameElement;
let post: ReturnType<typeof vi.spyOn>;
const origin = 'http://localhost:28081';

beforeEach(async () => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  globalConfig.editorExtensions.drawio!.editorUrl = `${origin}/drawio/index.html?embed=1&proto=json`;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  save = vi.fn().mockResolvedValue(undefined);
  close = vi.fn();
  await act(async () =>
    root.render(
      createElement(DrawioEditor, {
        source: { format: 'mermaid', data: 'flowchart LR\nA --> B' },
        onSave: save,
        onClose: close,
      }),
    ),
  );
  frame = document.querySelector('iframe')!;
  post = vi.spyOn(frame.contentWindow!, 'postMessage');
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
async function message(data: unknown, source = frame.contentWindow, messageOrigin = origin) {
  await act(async () =>
    window.dispatchEvent(
      new MessageEvent('message', {
        data: JSON.stringify(data),
        source,
        origin: messageOrigin,
      }),
    ),
  );
}

describe('draw.io iframe lifecycle', () => {
  it('separates resource loading from conversion and gives a retry after a timeout', async () => {
    expect(document.body.textContent).toContain('正在加载图形编辑器');
    await act(async () => vi.advanceTimersByTime(30_000));
    expect(document.body.textContent).toContain('加载超时');
    const retry = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent === '重新加载',
    )!;
    expect(retry.closest('.md-editor-drawio-editor-recovery')).not.toBeNull();
    expect(retry.closest('.md-editor-drawio-editor-header')).toBeNull();
    await act(async () => retry.click());
    expect(document.body.textContent).toContain('正在加载图形编辑器');
    expect(document.querySelector('iframe')).not.toBe(frame);
  });

  it('rejects messages from other windows and sends the descriptor only after init', async () => {
    await message({ event: 'init' }, window);
    await message({ event: 'init' }, frame.contentWindow, 'https://untrusted.example');
    expect(post).not.toHaveBeenCalled();
    await message({ event: 'init' });
    expect(JSON.parse(post.mock.calls[0][0] as string).descriptor.format).toBe('mermaid');
    expect(document.body.textContent).toContain('正在转换图形');
    await message({ event: 'load' });
    expect(document.body.textContent).toContain('保存并退出');
  });

  it('exports and saves once, and recovers from export errors without losing XML', async () => {
    await message({ event: 'save', xml: '<mxGraphModel />' });
    expect(JSON.parse(post.mock.calls[0][0] as string).action).toBe('export');
    await message({ event: 'export', error: 'export failed' });
    expect(save).not.toHaveBeenCalled();
    const retry = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent === '重试保存',
    )!;
    await act(async () => retry.click());
    await message({ event: 'export', data: 'data:image/png;base64,test' });
    await message({ event: 'export', data: 'data:image/png;base64,test' });
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('<mxGraphModel />', 'data:image/png;base64,test');
    expect(close).toHaveBeenCalledTimes(1);
  });
});
