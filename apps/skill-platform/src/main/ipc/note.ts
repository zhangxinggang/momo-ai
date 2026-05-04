import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { ENoteType } from '@/types/modules';
import { getMainWindow } from '@momo/electron';
import { BrowserWindow, dialog, ipcMain } from 'electron';
import fs from 'node:fs';

import { noteWorkspaceService } from '../services/note';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildNotePdfHtml(title: string, content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
      padding: 24px;
      line-height: 1.6;
      white-space: pre-wrap;
      color: #111827;
    }
  </style>
</head>
<body>${escapeHtml(content)}</body>
</html>`;
}

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

  ipcMain.handle(
    IPC_CHANNELS.NOTE_EXPORT_PDF,
    async (_event, payload: { title: string; content: string; defaultName: string }) => {
      const win = new BrowserWindow({
        show: false,
        webPreferences: {
          sandbox: true,
        },
      });

      try {
        const html = buildNotePdfHtml(payload.title, payload.content);
        await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
        const pdfBuffer = await win.webContents.printToPDF({ printBackground: true });

        const result = await dialog.showSaveDialog(getMainWindow()!, {
          defaultPath: `${payload.defaultName}.pdf`,
          filters: [{ name: 'PDF', extensions: ['pdf'] }],
        });

        if (result.canceled || !result.filePath) {
          return { success: false, canceled: true };
        }

        fs.writeFileSync(result.filePath, pdfBuffer);
        return { success: true, filePath: result.filePath };
      } finally {
        win.destroy();
      }
    },
  );
}
