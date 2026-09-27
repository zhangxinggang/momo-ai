// @vitest-environment jsdom
import { isFileQuestion, type RunEvent } from '@momo/agent-contracts';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { RunTimeline } from './index';

vi.mock('../MarkdownRenderer', () => ({ default: () => null }));
vi.mock('antd', () => {
  const Group = ({ children }: any) => createElement('div', {}, children);
  return {
    Button: ({ children, disabled, onClick }: any) =>
      createElement('button', { disabled, onClick }, children),
    Checkbox: Object.assign(Group, { Group }),
    Radio: Object.assign(Group, { Group }),
    Space: Group,
    Tag: Group,
    Input: { TextArea: ({ rows, ...props }: any) => createElement('textarea', props) },
  };
});

let container: HTMLDivElement, root: Root;
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
const event: RunEvent = {
  eventSchemaVersion: '1',
  eventId: 'event',
  projectId: 'project',
  sessionId: 'session',
  turnId: 'turn',
  runId: 'run',
  seq: 1,
  timestamp: 1,
  type: 'interaction.requested',
  payload: {
    requestId: 'question',
    kind: 'question',
    questions: [{ id: 'file', header: '[file] 招标文件', question: '请重新选择原文件' }],
  },
};
const ref = {
  sourceId: 'source:file',
  revision: 'a'.repeat(64),
  name: '招标.docx',
  mimeType: 'application/octet-stream',
  encoding: 'base64' as const,
  size: 3,
};

it('renders a file picker, uploads original files, and submits references to the pending run', async () => {
  let finish!: (value: (typeof ref)[]) => void;
  const uploadFiles = vi.fn(
    () =>
      new Promise<(typeof ref)[]>((resolve) => {
        finish = resolve;
      }),
  );
  const respond = vi.fn().mockResolvedValue(undefined);
  await act(async () =>
    root.render(
      createElement(RunTimeline, { events: [event], status: 'running', respond, uploadFiles }),
    ),
  );
  expect(container.querySelector('textarea')).toBeNull();
  const input = container.querySelector('input[type=file]')!;
  const button = container.querySelector('button')!;
  expect(button.disabled).toBe(true);
  const file = new File(['abc'], '招标.docx');
  await act(async () => {
    Object.defineProperty(input, 'files', { configurable: true, value: [file] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  expect(uploadFiles).toHaveBeenCalledWith([file]);
  expect(button.disabled).toBe(true);
  expect(container.textContent).not.toContain('已结束');
  await act(async () => finish([ref]));
  expect(container.textContent).toContain('招标.docx');
  await act(async () => button.click());
  expect(respond).toHaveBeenCalledWith(
    expect.objectContaining({
      runId: 'run',
      requestId: 'question',
      answers: [expect.objectContaining({ id: 'file', sourceRefs: [ref] })],
    }),
  );
  expect(button.disabled).toBe(true);
});

it('keeps upload errors actionable and ignores a cancelled file dialog', async () => {
  const uploadFiles = vi.fn().mockRejectedValue(new Error('原文件读取失败'));
  const respond = vi.fn();
  await act(async () =>
    root.render(createElement(RunTimeline, { events: [event], respond, uploadFiles })),
  );
  const input = container.querySelector('input[type=file]') as HTMLInputElement;
  await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
  expect(uploadFiles).not.toHaveBeenCalled();
  await act(async () => {
    Object.defineProperty(input, 'files', { value: [new File(['a'], 'a.pdf')] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  expect(container.textContent).toContain('原文件读取失败');
  expect(input.disabled).toBe(false);
  expect(container.querySelector('button')!.disabled).toBe(true);
  expect(respond).not.toHaveBeenCalled();
});

it('keeps ordinary text and plan review questions separate from file selection', () => {
  for (const question of ['请选择文件格式', '请提供文件名称', 'Choose file format'])
    expect(isFileQuestion({ id: 'text', question })).toBe(false);
  for (const question of ['请重新上传招标文件', 'Please upload the document'])
    expect(isFileQuestion({ id: 'file', question })).toBe(true);
  expect(
    isFileQuestion({
      id: 'review',
      header: '[file]',
      question: '上传文件的计划',
      intent: { kind: 'plan-review', approve: 'yes' },
    }),
  ).toBe(false);
});
