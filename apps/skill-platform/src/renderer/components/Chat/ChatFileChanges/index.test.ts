// @vitest-environment jsdom
import type { WorkspaceChangeSet } from '@momo/agent-contracts';
import { flushReviewDrafts } from '@renderer/services/chat/review-drafts';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ChatFileChanges } from './index';
import { ReviewPanel } from './ReviewPanel';

const mocks = vi.hoisted(() => ({
  fileChanges: vi.fn(),
  reviewChange: vi.fn(),
  correctChange: vi.fn(),
  undoChanges: vi.fn(),
  openReview: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  listener: undefined as Function | undefined,
}));
vi.mock('antd', () => ({
  Button: ({ children, onClick, disabled }: any) =>
    React.createElement('button', { onClick, disabled }, children),
  Spin: () => null,
  message: { success: mocks.success, error: mocks.error },
}));
vi.mock('@momo/file-editor', () => ({
  useSyncedCodeEditorTheme: () => 'light',
  CodeFileEditor: ({ value, readOnly, onChange }: any) =>
    React.createElement('textarea', {
      value,
      readOnly,
      onChange: (event: any) => onChange(event.target.value),
    }),
}));
vi.mock('@renderer/services/chat/workspace-panel', () => ({ openChatReview: mocks.openReview }));

let host: HTMLDivElement, root: Root, changes: WorkspaceChangeSet;
beforeEach(() => {
  vi.clearAllMocks();
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  changes = {
    runId: 'run',
    files: Array.from({ length: 5 }, (_, i) => ({
      path: `C:/work/${i}.ts`,
      root: 'C:/work',
      relativePath: `${i}.ts`,
      added: 2,
      removed: 1,
      kind: 'modified',
      status: 'pending',
    })),
  };
  mocks.fileChanges.mockResolvedValue(changes);
  mocks.reviewChange.mockImplementation(async (_run, path) => ({
    path,
    before: 'a=1\nb=1',
    current: 'a=2\nb=2',
    currentExists: true,
    revision: 'before-save',
  }));
  mocks.correctChange.mockImplementation(async (_run, path, content) => ({
    path,
    before: 'a=1\nb=1',
    current: content,
    currentExists: true,
    revision: 'after-save',
  }));
  mocks.undoChanges.mockResolvedValue({
    reverted: 1,
    preserved: 1,
    changes: { ...changes, files: changes.files.map((file) => ({ ...file, status: 'undone' })) },
  });
  (window as any).api = {
    agentRuntime: {
      ...mocks,
      onEvent: (listener: Function) => {
        mocks.listener = listener;
        return () => {};
      },
    },
  };
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => {
    await flushReviewDrafts();
    root.unmount();
  });
  host.remove();
});
const click = async (text: string) => {
  const button = Array.from(host.querySelectorAll('button')).find((element) =>
    element.textContent?.includes(text),
  );
  if (!button) throw Error('missing ' + text);
  await act(async () => button.click());
};
it.each([
  { requestSnapshot: { agentMode: 'ui' } },
  { requestSnapshot: { agentMode: 'ask', viewRequested: true } },
  { generatedView: { kind: 'openui', status: 'error', content: '' } },
])('hides interface file statistics and does not request changes for %j', async (mode) => {
  await act(async () =>
    root.render(
      React.createElement(ChatFileChanges, {
        reply: {
          id: 'ui',
          role: 'assistant',
          content: '',
          timestamp: 1,
          runId: 'run',
          ...mode,
        } as any,
      }),
    ),
  );
  expect(host.textContent).toBe('');
  expect(mocks.fileChanges).not.toHaveBeenCalled();
});
it('shows one summary, expands more files and opens the chosen file in review', async () => {
  await act(async () =>
    root.render(
      React.createElement(ChatFileChanges, {
        reply: {
          id: 'reply',
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          runId: 'run',
        } as any,
      }),
    ),
  );
  expect(host.textContent).toContain('已编辑 5 个文件');
  expect(host.textContent).toContain('+10');
  expect(host.textContent).not.toContain('4.ts');
  await click('再显示 2 个文件');
  await click('4.ts');
  expect(mocks.openReview).toHaveBeenCalledWith('run', 'C:/work/4.ts');
  await click('撤销');
  expect(mocks.undoChanges).toHaveBeenCalledWith('run');
  expect(host.textContent).toContain('已撤销');
});
it('shows the original left and editable content right, then protects edits before the next turn', async () => {
  await act(async () =>
    root.render(
      React.createElement(ReviewPanel, { runId: 'run', selectedPath: 'C:/work/2.ts', busy: false }),
    ),
  );
  const editors = host.querySelectorAll('textarea');
  expect(editors).toHaveLength(2);
  expect(editors[0].value).toBe('a=1\nb=1');
  expect(editors[0].readOnly).toBe(true);
  expect(editors[1].readOnly).toBe(false);
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(
      editors[1],
      'a=42\nb=2',
    );
    editors[1].dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(async () => flushReviewDrafts());
  expect(mocks.correctChange).toHaveBeenCalledWith(
    'run',
    'C:/work/2.ts',
    'a=42\nb=2',
    'before-save',
  );
});
