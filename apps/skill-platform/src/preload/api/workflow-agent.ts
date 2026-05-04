import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { ipcRenderer } from 'electron';

export interface IWorkflowAgentDirEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
}

export interface IWorkflowAgentFileTreeEntry {
  relativePath: string;
  isDirectory: boolean;
  size?: number;
}

export const workflowAgentApi = {
  ensureDir: (workflowName: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_AGENT_ENSURE_DIR, workflowName) as Promise<{
      success: boolean;
      dirPath?: string;
      error?: string;
    }>,
  deleteDir: (workflowName: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_AGENT_DELETE_DIR, workflowName) as Promise<{
      success: boolean;
      error?: string;
    }>,
  renameDir: (oldName: string, newName: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_AGENT_RENAME_DIR, oldName, newName) as Promise<{
      success: boolean;
      dirPath?: string;
      error?: string;
    }>,
  listDir: (workflowName: string, nodeName?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_AGENT_LIST_DIR, workflowName, nodeName) as Promise<{
      success: boolean;
      entries: IWorkflowAgentDirEntry[];
      dirPath?: string;
      error?: string;
    }>,
  readFile: (workflowName: string, nodeName: string, relativePath: string) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.WORKFLOW_AGENT_READ_FILE,
      workflowName,
      nodeName,
      relativePath,
    ) as Promise<{
      success: boolean;
      content?: string;
      filePath?: string;
      error?: string;
      skipped?: boolean;
    }>,
  writeFile: (workflowName: string, nodeName: string, relativePath: string, content: string) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.WORKFLOW_AGENT_WRITE_FILE,
      workflowName,
      nodeName,
      relativePath,
      content,
    ) as Promise<{
      success: boolean;
      filePath?: string;
      error?: string;
    }>,
  deleteNodeDir: (workflowName: string, nodeName: string) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.WORKFLOW_AGENT_DELETE_NODE_DIR,
      workflowName,
      nodeName,
    ) as Promise<{
      success: boolean;
      error?: string;
    }>,
  renameNodeDir: (workflowName: string, oldNodeName: string, newNodeName: string) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.WORKFLOW_AGENT_RENAME_NODE_DIR,
      workflowName,
      oldNodeName,
      newNodeName,
    ) as Promise<{ success: boolean; dirPath?: string; error?: string }>,
  listFileTree: (workflowName: string, nodeName: string) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.WORKFLOW_AGENT_LIST_FILE_TREE,
      workflowName,
      nodeName,
    ) as Promise<{
      success: boolean;
      entries: IWorkflowAgentFileTreeEntry[];
      dirPath?: string;
      error?: string;
    }>,
  deleteFile: (workflowName: string, nodeName: string, relativePath: string) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.WORKFLOW_AGENT_DELETE_FILE,
      workflowName,
      nodeName,
      relativePath,
    ) as Promise<{ success: boolean; error?: string }>,
  createDir: (workflowName: string, nodeName: string, relativePath: string) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.WORKFLOW_AGENT_CREATE_DIR,
      workflowName,
      nodeName,
      relativePath,
    ) as Promise<{ success: boolean; dirPath?: string; error?: string }>,
  movePath: (
    workflowName: string,
    nodeName: string,
    fromRelativePath: string,
    toRelativePath: string,
  ) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.WORKFLOW_AGENT_MOVE_PATH,
      workflowName,
      nodeName,
      fromRelativePath,
      toRelativePath,
    ) as Promise<{ success: boolean; error?: string }>,
};
