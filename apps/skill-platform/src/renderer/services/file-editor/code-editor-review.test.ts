// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { EditorView } from '../../../../../../packages/momo-file-editor/node_modules/@codemirror/view';
import { CodeFileEditor } from '../../../../../../packages/momo-file-editor/src/components/CodeFileEditor';

it('keeps Windows line endings when editing the review document and highlights changed lines', async () => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const onChange = vi.fn();
  try {
    await act(async () => {
      root.render(
        React.createElement(CodeFileEditor, {
          value: 'a=2\r\nb=2\r\n',
          relativePath: 'a.txt',
          onChange,
          highlightedLines: { lines: [2], kind: 'add' },
        }),
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    const view = EditorView.findFromDOM(host.querySelector('.cm-editor') as HTMLElement)!;
    expect(view).toBeTruthy();
    await act(async () => view.dispatch({ changes: { from: 2, to: 3, insert: '42' } }));
    expect(onChange).toHaveBeenLastCalledWith('a=42\r\nb=2\r\n');
    expect(host.querySelector('.cm-change-add')).toBeTruthy();
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
