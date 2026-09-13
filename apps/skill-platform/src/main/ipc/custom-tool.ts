import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { ICustomToolGeneratedFile } from '@/types/modules';
import { ipcMain } from 'electron';

import { customToolRuntimeService, customToolWorkspaceService } from '../services/custom-tool';

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

  ipcMain.handle(
    IPC_CHANNELS.TOOL_WRITE_GENERATED_FILES,
    async (
      _event,
      toolPath: string,
      files: ICustomToolGeneratedFile[],
      options?: { activate?: boolean },
    ) => {
      customToolWorkspaceService.writeGeneratedFiles(toolPath, files);
      return options?.activate === false ? null : customToolRuntimeService.activate(toolPath);
    },
  );

  ipcMain.handle(IPC_CHANNELS.TOOL_ACTIVATE, async (_event, toolPath: string) => {
    return customToolRuntimeService.activate(toolPath);
  });

  ipcMain.handle(IPC_CHANNELS.TOOL_DEACTIVATE, async (_event, toolPath?: string) => {
    await customToolRuntimeService.deactivate(toolPath);
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.TOOL_RUNTIME_STATUS, async (_event, toolPath: string) => {
    return customToolRuntimeService.getStatus(toolPath);
  });

  ipcMain.handle(IPC_CHANNELS.TOOL_READ_CONTEXT_FILES, async (_event, toolPath: string) => {
    return customToolWorkspaceService.readContextFiles(toolPath);
  });

  ipcMain.handle(IPC_CHANNELS.TOOL_RENAME, async (_event, nodePath: string, newName: string) => {
    await customToolRuntimeService.deactivate(nodePath);
    return customToolWorkspaceService.rename(nodePath, newName);
  });

  ipcMain.handle(IPC_CHANNELS.TOOL_DELETE, async (_event, nodePath: string) => {
    await customToolRuntimeService.deactivate(nodePath);
    customToolWorkspaceService.deleteNode(nodePath);
    return { success: true };
  });

  ipcMain.handle(
    IPC_CHANNELS.TOOL_MOVE,
    async (_event, sourcePath: string, targetParentPath: string | null) => {
      await customToolRuntimeService.deactivate(sourcePath);
      return customToolWorkspaceService.move(sourcePath, targetParentPath);
    },
  );

  ipcMain.handle(IPC_CHANNELS.TOOL_READ_SNAPEDIT_HTML, async () => {
    return customToolWorkspaceService.readSnapEditHtml();
  });
}
