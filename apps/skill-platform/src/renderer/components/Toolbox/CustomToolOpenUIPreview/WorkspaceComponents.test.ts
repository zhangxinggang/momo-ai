// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FileInputView,
  FilePreviewView,
  TabsView,
  ViewFileSelectionContext,
  ViewSourcesContext,
} from './WorkspaceComponents';

const mocks = vi.hoisted(() => ({ load: vi.fn(), baseUrl: vi.fn(), preview: vi.fn() }));
vi.mock('@momo/file-editor', () => ({
  BinaryFilePreview: (props: unknown) => {
    mocks.preview(props);
    return null;
  },
}));
vi.mock('@renderer/services/agent-runtime/client', () => ({
  harnessSourceStore: { load: mocks.load },
}));
vi.mock('@renderer/services/system', () => ({ fetchFilePreviewBaseUrl: mocks.baseUrl }));
vi.mock('@openuidev/react-lang', () => ({
  useIsStreaming: () => false,
  useStateField: () => ({ setValue: vi.fn() }),
}));

describe('generic workspace UI components', () => {
  let container: HTMLDivElement;
  let root: Root;
  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    mocks.load.mockReset();
    mocks.preview.mockReset();
    mocks.baseUrl.mockReset().mockResolvedValue('https://local.test/file-assets/');
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it('adds original selected files to the chat composer and reports upload failures', async () => {
    const attach = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    await act(async () =>
      root.render(
        createElement(
          ViewFileSelectionContext.Provider,
          { value: attach },
          createElement(FileInputView, {
            props: { name: 'file', label: '选择原件', accept: '.pdf', multiple: true },
          } as never),
        ),
      ),
    );
    const input = container.querySelector('input')!;
    const file = new File(['original'], '原件.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file] });
    await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
    expect(container.querySelector('[role=alert]')?.textContent).toContain('文件未全部添加');
    expect(container.textContent).not.toContain('发送消息即可继续');
    await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
    expect(attach).toHaveBeenLastCalledWith([file]);
    expect(container.textContent).toContain('原件.pdf');
    expect(container.textContent).toContain('发送消息即可继续');
    expect(container.querySelector('[role=alert]')).toBeNull();
  });

  it('keeps first selection while streaming, switches by click and keyboard, and falls back when a selected tab is removed', async () => {
    const one = { props: { value: 'one', trigger: '第一组', content: '第一组内容' } };
    const two = { props: { value: 'two', trigger: '第二组', content: '第二组内容' } };
    const render = (items: unknown[]) =>
      act(async () =>
        root.render(
          createElement(TabsView, {
            props: { items },
            renderNode: (value: unknown) => String(value),
          } as never),
        ),
      );
    await render([one]);
    await render([one, two]);
    expect(container.querySelector('[role="tabpanel"]')?.textContent).toBe('第一组内容');
    await act(async () => (container.querySelectorAll('[role="tab"]')[1] as HTMLElement).click());
    expect(container.querySelector('[role="tabpanel"]')?.textContent).toBe('第二组内容');
    await act(async () =>
      container
        .querySelector('[role="tablist"]')!
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true })),
    );
    expect(container.querySelector('[role="tabpanel"]')?.textContent).toBe('第一组内容');
    await render([two]);
    expect(container.querySelector('[role="tabpanel"]')?.textContent).toBe('第二组内容');
  });

  it('reads only an admitted original and sends exact bytes and asset base URL to momo-file-editor', async () => {
    const ref = {
      sourceId: 'source:one',
      revision: 'revision',
      name: '原件.docx',
      encoding: 'base64' as const,
      mimeType: 'application/octet-stream',
      size: 3,
      originalAvailable: true,
    };
    mocks.load.mockResolvedValue([{ ...ref, content: 'AQID' }]);
    await act(async () =>
      root.render(
        createElement(
          ViewSourcesContext.Provider,
          { value: [ref] },
          createElement(FilePreviewView, {
            props: { sourceId: ref.sourceId, height: 500 },
          } as never),
        ),
      ),
    );
    expect(mocks.load).toHaveBeenCalledExactlyOnceWith([ref]);
    const props = mocks.preview.mock.calls.at(-1)![0];
    expect([...new Uint8Array(props.buffer)]).toEqual([1, 2, 3]);
    expect(props).toMatchObject({
      relativePath: '原件.docx',
      isLoading: false,
      filePreviewBaseUrl: 'https://local.test/file-assets/',
    });
    await act(async () =>
      root.render(
        createElement(
          ViewSourcesContext.Provider,
          { value: [ref] },
          createElement(FilePreviewView, { props: { sourceId: 'invented-id' } } as never),
        ),
      ),
    );
    expect(mocks.load).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('未找到');
  });

  it('shows original load failures without substituting extracted text', async () => {
    const ref = {
      sourceId: 'source:one',
      revision: 'revision',
      name: '文件.pdf',
      encoding: 'base64' as const,
      mimeType: 'application/pdf',
      size: 3,
    };
    mocks.load.mockRejectedValue(new Error('原件快照已不可用'));
    await act(async () =>
      root.render(
        createElement(
          ViewSourcesContext.Provider,
          { value: [ref] },
          createElement(FilePreviewView, { props: { sourceId: ref.sourceId } } as never),
        ),
      ),
    );
    expect(container.textContent).toContain('原件快照已不可用');
    expect(mocks.preview.mock.calls.every(([props]) => props.buffer === null)).toBe(true);
  });
});
