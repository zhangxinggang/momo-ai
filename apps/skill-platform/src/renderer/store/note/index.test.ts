import { beforeEach, describe, expect, it, vi } from 'vitest';

const noteApi = vi.hoisted(() => ({
  bootstrapCursorRules: vi.fn(),
  copyNoteFile: vi.fn(),
  createNoteFile: vi.fn(),
  createNoteFolder: vi.fn(),
  deleteNote: vi.fn(),
  listNoteTree: vi.fn(),
  moveNote: vi.fn(),
  readNoteFile: vi.fn(),
  renameNote: vi.fn(),
  writeNoteFile: vi.fn(),
}));

vi.mock('@renderer/services/note/api', () => noteApi);

import { useNoteStore } from './index';

function resetStore() {
  useNoteStore.setState({
    rawTree: [],
    treeData: [],
    treeSearchQuery: '',
    selectedId: null,
    selectedNoteId: null,
    expandedKeys: [],
    editorContent: '',
    savedContent: '',
    isLoadingTree: false,
    isLoadingFile: false,
    isSaving: false,
    treeLoadError: null,
    fileLoadError: null,
  });
}

describe('note store loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
    noteApi.bootstrapCursorRules.mockResolvedValue(undefined);
    noteApi.listNoteTree.mockResolvedValue([]);
    noteApi.writeNoteFile.mockResolvedValue(undefined);
  });

  it('loads the note list even when cursor rule bootstrap fails', async () => {
    noteApi.bootstrapCursorRules.mockRejectedValueOnce(new Error('bootstrap failed'));
    noteApi.listNoteTree.mockResolvedValueOnce([
      { id: 'notes/a.md', name: 'a.md', kind: 'file', noteId: 'note-a' },
    ]);

    await useNoteStore.getState().loadTree();

    expect(useNoteStore.getState().treeData).toEqual([
      expect.objectContaining({ id: 'notes/a.md', noteId: 'note-a' }),
    ]);
    expect(useNoteStore.getState().treeLoadError).toBeNull();
  });

  it('retries a transient note list failure', async () => {
    noteApi.listNoteTree
      .mockRejectedValueOnce(new Error('ipc unavailable'))
      .mockResolvedValueOnce([{ id: 'a.md', name: 'a.md', kind: 'file', noteId: 'note-a' }]);

    await useNoteStore.getState().loadTree();

    expect(noteApi.listNoteTree).toHaveBeenCalledTimes(2);
    expect(useNoteStore.getState().treeData).toHaveLength(1);
    expect(useNoteStore.getState().treeLoadError).toBeNull();
  });

  it('keeps the selected note visible and retries a transient read failure', async () => {
    useNoteStore.setState({
      rawTree: [{ id: 'a.md', name: 'a.md', kind: 'file', noteId: 'note-a' }],
      treeData: [{ id: 'a.md', name: 'a.md', kind: 'file', noteId: 'note-a' }],
    });
    noteApi.readNoteFile
      .mockRejectedValueOnce(new Error('ipc unavailable'))
      .mockResolvedValueOnce({ content: '# A', noteType: 'text', noteId: 'note-a' });

    await useNoteStore.getState().selectFile('a.md');

    expect(noteApi.readNoteFile).toHaveBeenCalledTimes(2);
    expect(useNoteStore.getState()).toMatchObject({
      selectedId: 'a.md',
      selectedNoteId: 'note-a',
      editorContent: '# A',
      savedContent: '# A',
      isLoadingFile: false,
      fileLoadError: null,
    });
  });

  it('does not fall back to the unselected empty state after a persistent read failure', async () => {
    noteApi.readNoteFile.mockRejectedValue(new Error('file temporarily locked'));

    await useNoteStore.getState().selectFile('a.md');

    expect(useNoteStore.getState()).toMatchObject({
      selectedId: 'a.md',
      isLoadingFile: false,
      fileLoadError: 'file temporarily locked',
    });
  });

  it('ignores an older read that finishes after a newer selection', async () => {
    let resolveFirst:
      | ((value: { content: string; noteType: 'text'; noteId: string }) => void)
      | null = null;
    noteApi.readNoteFile.mockImplementation((fileId: string) => {
      if (fileId === 'a.md') {
        return new Promise((resolve) => {
          resolveFirst = resolve;
        });
      }
      return Promise.resolve({ content: '# B', noteType: 'text', noteId: 'note-b' });
    });

    const firstSelection = useNoteStore.getState().selectFile('a.md');
    await useNoteStore.getState().selectFile('b.md');
    resolveFirst?.({ content: '# A', noteType: 'text', noteId: 'note-a' });
    await firstSelection;

    expect(useNoteStore.getState()).toMatchObject({
      selectedId: 'b.md',
      selectedNoteId: 'note-b',
      editorContent: '# B',
      savedContent: '# B',
      isLoadingFile: false,
    });
  });

  it('does not apply an old save result to a newly selected note', async () => {
    let finishSave: (() => void) | null = null;
    noteApi.writeNoteFile.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishSave = resolve;
        }),
    );
    useNoteStore.setState({
      selectedId: 'a.md',
      editorContent: '# changed A',
      savedContent: '# A',
    });

    const saving = useNoteStore.getState().saveCurrentFile();
    useNoteStore.setState({
      selectedId: 'b.md',
      editorContent: '# B',
      savedContent: '# B',
    });
    finishSave?.();
    await saving;

    expect(useNoteStore.getState()).toMatchObject({
      selectedId: 'b.md',
      editorContent: '# B',
      savedContent: '# B',
      isSaving: false,
    });
  });
});
