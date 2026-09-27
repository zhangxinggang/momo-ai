import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { ICustomToolCreateInput, ICustomToolSaveInput } from '@/types/modules';
import { ipcMain, shell } from 'electron';

import { refreshCustomToolCatalog } from '../agent-runtime/ipc';
import { customToolWorkspaceService } from '../services/custom-tool';
import { validatePlugin } from '../services/custom-tool/plugin-runtime';
import { readEmbeddedWebPage } from '../services/webpage';

/** AI 插件在校验后保存，并同步刷新已启动的 Harness 会话。 */
export function registerCustomToolIPC(): void {
  ipcMain.handle(IPC_CHANNELS.TOOL_CHECK_IDENTIFIER, (_event, identifier: string) => {
    customToolWorkspaceService.assertIdentifierAvailable(identifier);
    return true;
  });
  ipcMain.handle(IPC_CHANNELS.TOOL_VALIDATE_PLUGIN, (_event, input: ICustomToolSaveInput) => {
    if (input?.kind !== 'plugin' || !input.plugin) throw Error('插件定义无效');
    return validatePlugin(input.content, input.plugin);
  });
  ipcMain.handle(IPC_CHANNELS.TOOL_INVOKE_PLUGIN, (_event, toolPath: string, input: unknown) =>
    customToolWorkspaceService.invokePlugin(toolPath, input),
  );
  ipcMain.handle(IPC_CHANNELS.TOOL_READ_WEB_PAGE, readEmbeddedWebPage);
  ipcMain.handle(IPC_CHANNELS.TOOL_LIST_TREE, () => customToolWorkspaceService.listTree());
  ipcMain.handle(
    IPC_CHANNELS.TOOL_CREATE_FOLDER,
    (_event, parentPath: string | null, name: string) =>
      customToolWorkspaceService.createFolder(parentPath, name),
  );
  ipcMain.handle(
    IPC_CHANNELS.TOOL_CREATE_FILE,
    (_event, parentPath: string | null, name: string, input?: ICustomToolCreateInput) =>
      customToolWorkspaceService.createTool(parentPath, name, input),
  );
  ipcMain.handle(IPC_CHANNELS.TOOL_READ_FILE, (_event, toolPath: string) =>
    customToolWorkspaceService.readDocument(toolPath),
  );
  ipcMain.handle(
    IPC_CHANNELS.TOOL_WRITE_FILE,
    async (_event, toolPath: string, input: ICustomToolSaveInput) => {
      const result =
        input?.kind === 'plugin'
          ? await customToolWorkspaceService.savePlugin(toolPath, input)
          : customToolWorkspaceService.saveDocument(toolPath, input);
      await refreshCustomToolCatalog();
      return result;
    },
  );
  ipcMain.handle(IPC_CHANNELS.TOOL_RENAME, async (_event, nodePath: string, newName: string) => {
    const result = customToolWorkspaceService.rename(nodePath, newName);
    await refreshCustomToolCatalog();
    return result;
  });
  ipcMain.handle(IPC_CHANNELS.TOOL_DELETE, async (_event, nodePath: string) => {
    customToolWorkspaceService.deleteNode(nodePath);
    await refreshCustomToolCatalog();
    return { success: true };
  });
  ipcMain.handle(
    IPC_CHANNELS.TOOL_MOVE,
    async (_event, sourcePath: string, targetParentPath: string | null) => {
      const result = customToolWorkspaceService.move(sourcePath, targetParentPath);
      await refreshCustomToolCatalog();
      return result;
    },
  );
  ipcMain.handle(IPC_CHANNELS.TOOL_OPEN_DIRECTORY, async (_event, toolPath: string) => {
    try {
      const directory = customToolWorkspaceService.resolveNodeDirectory(toolPath);
      const error = await shell.openPath(directory);
      return error ? { success: false, error } : { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
  ipcMain.handle(IPC_CHANNELS.TOOL_READ_SNAPEDIT_HTML, () =>
    customToolWorkspaceService.readSnapEditHtml(),
  );
}
