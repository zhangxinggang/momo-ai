/** 工作流 Agent 目录操作封装（渲染进程） */

import type { ISkillArtifactFile } from '@renderer/services/skill/skill-artifacts';

const getApi = () => window.api?.workflowAgent;

export interface IWorkflowAgentFileTreeEntry {
  relativePath: string;
  isDirectory: boolean;
  size?: number;
}

export async function ensureWorkflowAgentDir(workflowName: string): Promise<boolean> {
  const api = getApi();
  if (!api?.ensureDir) {
    return false;
  }
  const res = await api.ensureDir(workflowName);
  return res.success;
}

export async function deleteWorkflowAgentDir(workflowName: string): Promise<boolean> {
  const api = getApi();
  if (!api?.deleteDir) {
    return false;
  }
  const res = await api.deleteDir(workflowName);
  return res.success;
}

export async function renameWorkflowAgentDir(oldName: string, newName: string): Promise<boolean> {
  const api = getApi();
  if (!api?.renameDir) {
    return false;
  }
  const res = await api.renameDir(oldName, newName);
  return res.success;
}

export async function readWorkflowNodeFile(
  workflowName: string,
  nodeName: string,
  relativePath: string,
): Promise<string> {
  const api = getApi();
  if (!api?.readFile) {
    return '';
  }
  const res = await api.readFile(workflowName, nodeName, relativePath);
  return res.success && res.content ? res.content : '';
}

export async function writeWorkflowNodeFile(
  workflowName: string,
  nodeName: string,
  relativePath: string,
  content: string,
): Promise<boolean> {
  const api = getApi();
  if (!api?.writeFile) {
    return false;
  }
  const res = await api.writeFile(workflowName, nodeName, relativePath, content);
  return res.success;
}

export async function readWorkflowNodeMainMd(
  workflowName: string,
  nodeName: string,
): Promise<string> {
  return readWorkflowNodeFile(workflowName, nodeName, 'main.md');
}

export async function writeWorkflowNodeMainMd(
  workflowName: string,
  nodeName: string,
  content: string,
): Promise<boolean> {
  return writeWorkflowNodeFile(workflowName, nodeName, 'main.md', content);
}

export async function deleteWorkflowNodeAgentDir(
  workflowName: string,
  nodeName: string,
): Promise<boolean> {
  const api = getApi();
  if (!api?.deleteNodeDir) {
    return false;
  }
  const res = await api.deleteNodeDir(workflowName, nodeName);
  return res.success;
}

export async function listWorkflowAgentDir(
  workflowName: string,
  nodeName?: string,
): Promise<{ name: string; path: string; type: 'file' | 'directory'; size?: number }[]> {
  const api = getApi();
  if (!api?.listDir) {
    return [];
  }
  const res = await api.listDir(workflowName, nodeName);
  return res.success ? res.entries : [];
}

export async function listWorkflowNodeFileTree(
  workflowName: string,
  nodeName: string,
): Promise<IWorkflowAgentFileTreeEntry[]> {
  const api = getApi();
  if (!api?.listFileTree) {
    return [];
  }
  const res = await api.listFileTree(workflowName, nodeName);
  return res.success ? res.entries : [];
}

export async function deleteWorkflowNodeFile(
  workflowName: string,
  nodeName: string,
  relativePath: string,
): Promise<boolean> {
  const api = getApi();
  if (!api?.deleteFile) {
    return false;
  }
  const res = await api.deleteFile(workflowName, nodeName, relativePath);
  return res.success;
}

export async function createWorkflowNodeDir(
  workflowName: string,
  nodeName: string,
  relativePath: string,
): Promise<boolean> {
  const api = getApi();
  if (!api?.createDir) {
    return false;
  }
  const res = await api.createDir(workflowName, nodeName, relativePath);
  return res.success;
}

export async function moveWorkflowNodePath(
  workflowName: string,
  nodeName: string,
  fromRelativePath: string,
  toRelativePath: string,
): Promise<boolean> {
  const api = getApi();
  if (!api?.movePath) {
    return false;
  }
  const res = await api.movePath(workflowName, nodeName, fromRelativePath, toRelativePath);
  return res.success;
}

/** 将 artifact 块写入工作流节点目录 */
export async function writeWorkflowNodeArtifacts(
  workflowName: string,
  nodeName: string,
  artifacts: ISkillArtifactFile[],
): Promise<string[]> {
  const written: string[] = [];
  for (const artifact of artifacts) {
    const ok = await writeWorkflowNodeFile(workflowName, nodeName, artifact.path, artifact.content);
    if (ok) {
      written.push(artifact.path);
    }
  }
  return written;
}

/** 获取节点产出目录绝对路径 */
export async function renameWorkflowNodeAgentDir(
  workflowName: string,
  oldNodeName: string,
  newNodeName: string,
): Promise<boolean> {
  const api = getApi();
  if (!api?.renameNodeDir) {
    return false;
  }
  const res = await api.renameNodeDir(workflowName, oldNodeName, newNodeName);
  return res.success;
}

export async function getWorkflowNodeDirPath(
  workflowName: string,
  nodeName: string,
): Promise<string | null> {
  const api = getApi();
  if (!api?.listDir) {
    return null;
  }
  const res = await api.listDir(workflowName, nodeName);
  return res.dirPath ?? null;
}
