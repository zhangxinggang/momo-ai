import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { ICustomToolCreateInput, ICustomToolSaveInput } from '@/types/modules';
import type { IWebPageContext } from '@/types/modules/webpage';
import { ipcRenderer } from 'electron';

export const customToolApi = {
  checkIdentifier: (identifier: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_CHECK_IDENTIFIER, identifier),
  validatePlugin: (input: ICustomToolSaveInput) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_VALIDATE_PLUGIN, input),
  invokePlugin: (toolPath: string, input: unknown) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_INVOKE_PLUGIN, toolPath, input),
  readWebPage: (frameName: string): Promise<IWebPageContext> =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_READ_WEB_PAGE, frameName),
  listTree: () => ipcRenderer.invoke(IPC_CHANNELS.TOOL_LIST_TREE),
  createFolder: (parentPath: string | null, name: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_CREATE_FOLDER, parentPath, name),
  createFile: (parentPath: string | null, name: string, input?: ICustomToolCreateInput) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_CREATE_FILE, parentPath, name, input),
  readFile: (toolPath: string) => ipcRenderer.invoke(IPC_CHANNELS.TOOL_READ_FILE, toolPath),
  writeFile: (toolPath: string, input: ICustomToolSaveInput) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_WRITE_FILE, toolPath, input),
  rename: (nodePath: string, newName: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_RENAME, nodePath, newName),
  delete: (nodePath: string) => ipcRenderer.invoke(IPC_CHANNELS.TOOL_DELETE, nodePath),
  move: (sourcePath: string, targetParentPath: string | null) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_MOVE, sourcePath, targetParentPath),
  openDirectory: (toolPath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_OPEN_DIRECTORY, toolPath),
  readSnapEditHtml: () => ipcRenderer.invoke(IPC_CHANNELS.TOOL_READ_SNAPEDIT_HTML),
};
