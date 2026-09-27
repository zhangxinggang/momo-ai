// @vitest-environment jsdom
import type { ICustomToolDocument } from '@/types/modules';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CustomToolPluginWorkspace } from '.';
const mocks = vi.hoisted(() => ({ invoke: vi.fn(), dirty: false, draft: vi.fn() }));
vi.mock('@renderer/services/custom-tool/api', () => ({
  invokeCustomToolPlugin: mocks.invoke,
  openCustomToolDirectory: vi.fn(),
}));
vi.mock('@renderer/store/custom-tool', () => ({
  isCustomToolDirty: () => mocks.dirty,
  useCustomToolStore: (select: any) => select({ setPluginDraft: mocks.draft }),
}));
vi.mock('@momo/file-editor', () => ({
  CodeFileEditor: (props: any) =>
    createElement('textarea', {
      'aria-label': '文件源码',
      value: props.value,
      readOnly: props.readOnly,
      onChange: (event: any) => props.onChange(event.target.value),
    }),
}));

let container: HTMLDivElement;
let root: Root;
const tool: ICustomToolDocument = {
  id: '文件夹/文本',
  name: '文本分析',
  kind: 'plugin',
  components: {},
  content: 'function execute(input) { return { count: input.text.length }; }',
  plugin: {
    identifier: 'text-count',
    description: '统计文本字符数',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string', title: '待统计文本' } },
      required: ['text'],
    },
    outputSchema: { type: 'object', properties: { count: { type: 'integer', title: '字符数' } } },
    tests: [
      { name: '普通文本', input: { text: '你好' }, expected: { count: 2 } },
      { name: '空文本', input: { text: '' }, expected: { count: 0 } },
    ],
  },
  validation: { revision: 'r1', results: [{ name: '普通文本', output: { count: 2 } }] },
};
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({
      matches: false,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
    }),
  });
  mocks.dirty = false;
  mocks.invoke.mockReset().mockResolvedValue({ count: 2 });
  mocks.draft.mockReset();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
const button = (label: string) =>
  [...container.querySelectorAll('button')].find((item) => item.textContent === label)!;
it('builds business fields from Schema and invokes the saved plugin with ordinary and empty inputs', async () => {
  await act(async () =>
    root.render(
      createElement(CustomToolPluginWorkspace, {
        document: tool,
        editing: true,
        busy: false,
        onValidityChange: vi.fn(),
      }),
    ),
  );
  expect(container.querySelector('[aria-label="插件文件管理器"]')).not.toBeNull();
  expect(container.textContent).toContain('待统计文本');
  await act(async () => {
    button('调用插件').click();
    await new Promise((resolve) => setTimeout(resolve, 120));
  });
  expect(mocks.invoke).toHaveBeenCalledWith('文件夹/文本', { text: '你好' });
  expect(container.textContent).toContain('调用成功');
  expect(container.textContent).toContain('字符数');
  expect(container.querySelector('[aria-label="插件验证界面"] code')).toBeNull();
  await act(async () => button('空文本').click());
  await act(async () => {
    button('调用插件').click();
    await new Promise((resolve) => setTimeout(resolve, 120));
  });
  expect(mocks.invoke).toHaveBeenLastCalledWith('文件夹/文本', { text: '' });
});
it('keeps edited or unvalidated versions out of verification and makes the registration entry read-only', async () => {
  mocks.dirty = true;
  await act(async () =>
    root.render(
      createElement(CustomToolPluginWorkspace, {
        document: tool,
        editing: true,
        busy: false,
        onValidityChange: vi.fn(),
      }),
    ),
  );
  expect(button('调用插件').disabled).toBe(true);
  await act(async () => button('index.mjs').click());
  expect((container.querySelector('[aria-label="文件源码"]') as HTMLTextAreaElement).readOnly).toBe(
    true,
  );
});
