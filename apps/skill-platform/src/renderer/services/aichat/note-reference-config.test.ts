import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  activeFolderPaths: [] as string[],
  listNoteTree: vi.fn(),
  readNoteFile: vi.fn(),
  listWorkspaceDirectory: vi.fn(),
  readWorkspaceFile: vi.fn(),
}));

vi.mock('@momo/aichat', () => ({
  resolveNoteMentionsInContent: async (content: string) => content,
}));

vi.mock('@renderer/services/ipc', () => ({
  getWorkspaceIpc: () => ({
    listDir: mocks.listWorkspaceDirectory,
    readFile: mocks.readWorkspaceFile,
  }),
}));

vi.mock('@renderer/services/note/api', () => ({
  listNoteTree: mocks.listNoteTree,
  readNoteFile: mocks.readNoteFile,
}));

vi.mock('@renderer/store/chat', () => ({
  useChatProjectStore: {
    getState: () => ({ activeFolderPaths: mocks.activeFolderPaths }),
  },
}));

import { createNoteReferencesConfig } from './note-reference-config';

describe('createNoteReferencesConfig', () => {
  beforeEach(() => {
    mocks.activeFolderPaths = [];
    mocks.listNoteTree
      .mockReset()
      .mockResolvedValue([{ id: 'notes/a.md', name: 'a.md', kind: 'file' }]);
    mocks.readNoteFile.mockReset().mockResolvedValue({ content: 'note content' });
    mocks.listWorkspaceDirectory.mockReset();
    mocks.readWorkspaceFile.mockReset();
  });

  it('keeps the existing note tree when no workspace is selected', async () => {
    const config = createNoteReferencesConfig()!;
    await expect(config.listTree()).resolves.toEqual([
      { id: 'notes/a.md', name: 'a.md', kind: 'file' },
    ]);
    expect(mocks.listWorkspaceDirectory).not.toHaveBeenCalled();
  });

  it('groups notes and current workspace files and reads the selected file', async () => {
    mocks.activeFolderPaths = ['C:\\project'];
    mocks.listWorkspaceDirectory.mockImplementation(async (directoryPath: string) =>
      directoryPath.endsWith('src')
        ? {
            success: true,
            entries: [{ name: 'app.ts', path: `${directoryPath}\\app.ts`, type: 'file' }],
          }
        : {
            success: true,
            entries: [{ name: 'src', path: `${directoryPath}\\src`, type: 'directory' }],
          },
    );
    mocks.readWorkspaceFile.mockResolvedValue({ success: true, content: 'workspace content' });

    const config = createNoteReferencesConfig()!;
    const tree = await config.listTree();
    expect(tree.map((node) => node.name)).toEqual(['笔记', '工作区文件']);
    const sourceFolder = tree[1].children?.[0].children?.[0];
    expect(sourceFolder?.name).toBe('src');
    expect(sourceFolder?.children).toBeUndefined();
    const sourceChildren = await config.loadChildren!(sourceFolder!);
    const workspaceFile = sourceChildren[0];
    expect(workspaceFile?.name).toBe('app.ts');
    await expect(config.readContent(workspaceFile!.id)).resolves.toBe('workspace content');
    expect(mocks.listWorkspaceDirectory).toHaveBeenNthCalledWith(1, 'C:\\project');
    expect(mocks.listWorkspaceDirectory).toHaveBeenNthCalledWith(2, 'C:\\project\\src');
    expect(mocks.readWorkspaceFile).toHaveBeenCalledWith('C:\\project\\src\\app.ts');
  });
});
