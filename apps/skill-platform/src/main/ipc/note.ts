import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { ENoteType } from '@/types/modules';
import { ipcMain } from 'electron';

import { noteWorkspaceService } from '../services/note';

/**
 * 注册笔记 IPC
 */
export function registerNoteIPC(): void {
  ipcMain.handle(IPC_CHANNELS.NOTE_LIST_TREE, async () => {
    return noteWorkspaceService.listTree();
  });

  ipcMain.handle(
    IPC_CHANNELS.NOTE_CREATE_FOLDER,
    async (_event, parentPath: string | null, name: string) => {
      return noteWorkspaceService.createFolder(parentPath, name);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.NOTE_CREATE_FILE,
    async (_event, parentPath: string | null, name: string, noteType?: ENoteType) => {
      return noteWorkspaceService.createFile(parentPath, name, noteType);
    },
  );

  ipcMain.handle(IPC_CHANNELS.NOTE_READ_FILE, async (_event, filePath: string) => {
    return noteWorkspaceService.readFile(filePath);
  });

  ipcMain.handle(
    IPC_CHANNELS.NOTE_WRITE_FILE,
    async (_event, filePath: string, content: string) => {
      noteWorkspaceService.writeFile(filePath, content);
      return { success: true };
    },
  );

  ipcMain.handle(IPC_CHANNELS.NOTE_RENAME, async (_event, nodePath: string, newName: string) => {
    return noteWorkspaceService.rename(nodePath, newName);
  });

  ipcMain.handle(IPC_CHANNELS.NOTE_DELETE, async (_event, nodePath: string) => {
    noteWorkspaceService.deleteNode(nodePath);
    return { success: true };
  });

  ipcMain.handle(
    IPC_CHANNELS.NOTE_MOVE,
    async (_event, sourcePath: string, targetParentPath: string | null) => {
      return noteWorkspaceService.move(sourcePath, targetParentPath);
    },
  );

  ipcMain.handle(IPC_CHANNELS.NOTE_COPY_FILE, async (_event, filePath: string) => {
    return noteWorkspaceService.copyFile(filePath);
  });

  ipcMain.handle(IPC_CHANNELS.NOTE_BOOTSTRAP_CURSOR_RULES, async () => {
    return noteWorkspaceService.bootstrapCursorRulesFromProject();
  });
}
