import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { ICustomToolGeneratedFile, ICustomToolRuntimeInfo } from '@/types/modules';
import { ipcRenderer } from 'electron';

export const customToolApi = {
  listTree: () => ipcRenderer.invoke(IPC_CHANNELS.TOOL_LIST_TREE),
  createFolder: (parentPath: string | null, name: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_CREATE_FOLDER, parentPath, name),
  createFile: (parentPath: string | null, name: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_CREATE_FILE, parentPath, name),
  readFile: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.TOOL_READ_FILE, filePath),
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_WRITE_FILE, filePath, content),
  rename: (nodePath: string, newName: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_RENAME, nodePath, newName),
  delete: (nodePath: string) => ipcRenderer.invoke(IPC_CHANNELS.TOOL_DELETE, nodePath),
  move: (sourcePath: string, targetParentPath: string | null) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_MOVE, sourcePath, targetParentPath),
  readSnapEditHtml: () => ipcRenderer.invoke(IPC_CHANNELS.TOOL_READ_SNAPEDIT_HTML),
  writeGeneratedFiles: (
    toolPath: string,
    files: ICustomToolGeneratedFile[],
    options?: { activate?: boolean },
  ) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.TOOL_WRITE_GENERATED_FILES,
      toolPath,
      files,
      options,
    ) as Promise<ICustomToolRuntimeInfo | null>,
  activate: (toolPath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_ACTIVATE, toolPath) as Promise<ICustomToolRuntimeInfo>,
  deactivate: (toolPath?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_DEACTIVATE, toolPath) as Promise<void>,
  runtimeStatus: (toolPath: string) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.TOOL_RUNTIME_STATUS,
      toolPath,
    ) as Promise<ICustomToolRuntimeInfo | null>,
  readContextFiles: (toolPath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_READ_CONTEXT_FILES, toolPath) as Promise<
      ICustomToolGeneratedFile[]
    >,
};
