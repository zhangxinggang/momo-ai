// @vitest-environment jsdom
import { act, createElement, createRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { valueToSurface } from '../../utils/note-mention';
import { buildSlashInvocationToken } from '../../utils/slash-token';
import { ChatMentionTextarea, type IChatMentionTextareaRef } from './index';

const token = buildSlashInvocationToken({
  resourceId: 'skill',
  resourceRevision: '1',
  command: '/tender-document-parser',
  kind: 'skill',
  scope: 'application',
});
let host: HTMLDivElement, root: Root, latest: string;
const ref = createRef<IChatMentionTextareaRef>();
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
async function mount(initial: string) {
  function Editor() {
    const [value, setValue] = useState(initial);
    latest = value;
    return createElement(ChatMentionTextarea, { ref, value, onChange: setValue });
  }
  await act(async () => root.render(createElement(Editor)));
  return host.querySelector('textarea')!;
}
async function input(textarea: HTMLTextAreaElement, text: string, position: number) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(
      textarea,
      text,
    );
    textarea.setSelectionRange(position, position);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

it('aligns chip backgrounds with native font metrics even when Chromium has no font shorthand', async () => {
  const computed = window.getComputedStyle.bind(window);
  vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
    const result = computed(element);
    if (element.tagName !== 'TEXTAREA') return result;
    const get = result.getPropertyValue.bind(result);
    const metrics: Record<string, string> = {
      font: '',
      'font-size': '13px',
      'font-weight': '500',
      'font-family': 'Arial',
      'line-height': '24px',
    };
    result.getPropertyValue = (name) => metrics[name] ?? get(name);
    return result;
  });
  await mount(`${token} 请解析文件`);
  const mirror = host.querySelector<HTMLElement>('[aria-hidden="true"]')!;
  expect(mirror.style.fontSize).toBe('13px');
  expect(mirror.firstElementChild!.getAttribute('style')).toContain('font-size: 13px');
  expect(mirror.style.fontFamily).toBe('Arial');
  expect(mirror.style.fontWeight).toBe('500');
});

it('preserves the exact insertion point around tokens in long Unicode, punctuation and multiline text', async () => {
  const prefix = '中文🙂 e\u0301 <>&"\t〔特殊字符〕\n'.repeat(80);
  const original = `${prefix}${token} 后文 @[note:目录/文件.md] 结束`;
  const textarea = await mount(original);
  for (const cursor of [prefix.length, prefix.length + token.length, original.length]) {
    await act(async () => ref.current!.setSelectionStart(cursor));
    expect(ref.current!.getSelectionStart()).toBe(cursor);
  }
  await act(async () => ref.current!.setSelectionStart(prefix.length + token.length));
  const start = textarea.selectionStart;
  const inserted = '输入🚀【】\\$`<&>\n新行';
  await input(
    textarea,
    textarea.value.slice(0, start) + inserted + textarea.value.slice(start),
    start + inserted.length,
  );
  expect(latest).toBe(`${prefix}${token}${inserted} 后文 @[note:目录/文件.md] 结束`);
  expect(textarea.selectionStart).toBe(start + inserted.length);
  expect(ref.current!.getSelectionStart()).toBe(prefix.length + token.length + inserted.length);
  expect(textarea.value).toBe(valueToSurface(latest));
});

it('deletes a token atomically and restores the caret, without hijacking IME or range deletion', async () => {
  const textarea = await mount(`前${token}后`);
  await act(async () => ref.current!.setSelectionStart(1 + token.length));
  const composing = new KeyboardEvent('keydown', {
    key: 'Backspace',
    isComposing: true,
    bubbles: true,
    cancelable: true,
  });
  await act(async () => textarea.dispatchEvent(composing));
  expect(composing.defaultPrevented).toBe(false);
  expect(latest).toBe(`前${token}后`);
  textarea.setSelectionRange(1, textarea.value.length);
  const selected = new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true });
  await act(async () => textarea.dispatchEvent(selected));
  expect(selected.defaultPrevented).toBe(false);
  await act(async () => ref.current!.setSelectionStart(1 + token.length));
  await act(async () =>
    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }),
    ),
  );
  expect(latest).toBe('前后');
  expect(textarea.selectionStart).toBe(1);
});

it('renders unescaped native textarea text and keeps the background mirror text identical', async () => {
  const textarea = await mount(`${token} <script>& 中文\t🙂\n多行`);
  expect(host.querySelector('[aria-hidden="true"]')?.textContent).toBe(textarea.value);
  expect(host.querySelector('script')).toBeNull();
});
