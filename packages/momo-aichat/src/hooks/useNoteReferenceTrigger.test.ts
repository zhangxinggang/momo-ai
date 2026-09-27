// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { INoteReferencesConfig } from '../types/note-reference';
import { useNoteReferenceTrigger } from './useNoteReferenceTrigger';

describe('useNoteReferenceTrigger', () => {
  let container: HTMLDivElement;
  let root: Root;

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

  it('loads once while typing and expands only resource roots initially', async () => {
    const listTree = vi.fn().mockResolvedValue([
      {
        id: 'reference-category:notes',
        name: '笔记',
        kind: 'folder',
        children: [
          {
            id: 'notes-folder',
            name: '项目笔记',
            kind: 'folder',
            children: [{ id: 'notes/a.md', name: 'a.md', kind: 'file' }],
          },
        ],
      },
      {
        id: 'reference-category:workspace',
        name: '工作区文件',
        kind: 'folder',
        children: [
          {
            id: 'workspace-root',
            name: 'project',
            kind: 'folder',
            noteType: 'workspace',
            children: [{ id: 'workspace-src', name: 'src', kind: 'folder', noteType: 'workspace' }],
          },
        ],
      },
    ]);
    const loadChildren = vi
      .fn()
      .mockResolvedValue([{ id: 'workspace:app', name: 'app.ts', kind: 'file' }]);
    const noteReferences: INoteReferencesConfig = {
      listTree,
      loadChildren,
      readContent: vi.fn(),
    };
    let current!: ReturnType<typeof useNoteReferenceTrigger>;

    function Harness({ value }: { value: string }) {
      current = useNoteReferenceTrigger({
        value,
        onChange: vi.fn(),
        noteReferences,
        selectionStart: value.length,
      });
      return null;
    }

    await act(async () => root.render(createElement(Harness, { value: '@' })));
    expect(listTree).toHaveBeenCalledTimes(1);
    expect(current.expandedKeys).toEqual([
      'reference-category:notes',
      'reference-category:workspace',
      'workspace-root',
    ]);

    await act(async () => current.toggleFolder('workspace-src'));
    expect(loadChildren).toHaveBeenCalledTimes(1);

    await act(async () => root.render(createElement(Harness, { value: '@src' })));
    expect(listTree).toHaveBeenCalledTimes(1);
  });
});
