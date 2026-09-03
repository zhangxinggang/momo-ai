import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { ipcMain } from 'electron';

import { customToolWorkspaceService } from '../services/custom-tool';

/** 注册自定义工具 IPC */
export function registerCustomToolIPC(): void {
  ipcMain.handle(IPC_CHANNELS.TOOL_LIST_TREE, async () => {
    return customToolWorkspaceService.listTree();
  });

  ipcMain.handle(
    IPC_CHANNELS.TOOL_CREATE_FOLDER,
    async (_event, parentPath: string | null, name: string) => {
      return customToolWorkspaceService.createFolder(parentPath, name);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.TOOL_CREATE_FILE,
    async (_event, parentPath: string | null, name: string) => {
      return customToolWorkspaceService.createFile(parentPath, name);
    },
  );

  ipcMain.handle(IPC_CHANNELS.TOOL_READ_FILE, async (_event, filePath: string) => {
    return customToolWorkspaceService.readFile(filePath);
  });

  ipcMain.handle(
    IPC_CHANNELS.TOOL_WRITE_FILE,
    async (_event, filePath: string, content: string) => {
      customToolWorkspaceService.writeFile(filePath, content);
      return { success: true };
    },
  );

  ipcMain.handle(IPC_CHANNELS.TOOL_RENAME, async (_event, nodePath: string, newName: string) => {
    return customToolWorkspaceService.rename(nodePath, newName);
  });

  ipcMain.handle(IPC_CHANNELS.TOOL_DELETE, async (_event, nodePath: string) => {
    customToolWorkspaceService.deleteNode(nodePath);
    return { success: true };
  });

  ipcMain.handle(
    IPC_CHANNELS.TOOL_MOVE,
    async (_event, sourcePath: string, targetParentPath: string | null) => {
      return customToolWorkspaceService.move(sourcePath, targetParentPath);
    },
  );

  ipcMain.handle(IPC_CHANNELS.TOOL_READ_SNAPEDIT_HTML, async () => {
    return customToolWorkspaceService.readSnapEditHtml();
  });
}
