import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { ICustomToolSaveInput } from '@/types/modules';
import { ipcMain } from 'electron';

import { customToolWorkspaceService } from '../services/custom-tool';

/** 自定义工具只管理视图文档与组件数据配置，不注册任何可执行能力。 */
export function registerCustomToolIPC(): void {
  ipcMain.handle(IPC_CHANNELS.TOOL_LIST_TREE, () => customToolWorkspaceService.listTree());
  ipcMain.handle(
    IPC_CHANNELS.TOOL_CREATE_FOLDER,
    (_event, parentPath: string | null, name: string) =>
      customToolWorkspaceService.createFolder(parentPath, name),
  );
  ipcMain.handle(IPC_CHANNELS.TOOL_CREATE_FILE, (_event, parentPath: string | null, name: string) =>
    customToolWorkspaceService.createTool(parentPath, name),
  );
  ipcMain.handle(IPC_CHANNELS.TOOL_READ_FILE, (_event, toolPath: string) =>
    customToolWorkspaceService.readDocument(toolPath),
  );
  ipcMain.handle(
    IPC_CHANNELS.TOOL_WRITE_FILE,
    (_event, toolPath: string, input: ICustomToolSaveInput) =>
      customToolWorkspaceService.saveDocument(toolPath, input),
  );
  ipcMain.handle(IPC_CHANNELS.TOOL_RENAME, (_event, nodePath: string, newName: string) =>
    customToolWorkspaceService.rename(nodePath, newName),
  );
  ipcMain.handle(IPC_CHANNELS.TOOL_DELETE, (_event, nodePath: string) => {
    customToolWorkspaceService.deleteNode(nodePath);
    return { success: true };
  });
  ipcMain.handle(
    IPC_CHANNELS.TOOL_MOVE,
    (_event, sourcePath: string, targetParentPath: string | null) =>
      customToolWorkspaceService.move(sourcePath, targetParentPath),
  );
}
