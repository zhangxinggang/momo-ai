import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';

import { getAgentDir, getWorkflowAgentDir, getWorkflowNodeAgentDir } from '../runtime-paths';

const TEXT_EXTENSIONS = new Set([
  '.md',
  '.txt',
  '.json',
  '.js',
  '.ts',
  '.tsx',
  '.jsx',
  '.py',
  '.html',
  '.css',
  '.less',
  '.xml',
  '.yaml',
  '.yml',
  '.csv',
  '.log',
]);

function sanitizeDirName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'unnamed';
}

function resolveWorkflowDir(workflowName: string): string {
  const dir = getWorkflowAgentDir(workflowName);
  const resolved = path.resolve(dir);
  const agentRoot = path.resolve(getAgentDir());
  if (!resolved.startsWith(agentRoot)) {
    throw new Error('非法工作流目录路径');
  }
  return resolved;
}

function resolveNodeDir(workflowName: string, nodeName: string): string {
  const dir = getWorkflowNodeAgentDir(workflowName, nodeName);
  const resolved = path.resolve(dir);
  const workflowDir = resolveWorkflowDir(workflowName);
  if (!resolved.startsWith(workflowDir)) {
    throw new Error('非法节点目录路径');
  }
  return resolved;
}

function resolveRelativePathInDir(dir: string, relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('..')) {
    throw new Error('非法文件路径');
  }
  const resolved = path.resolve(dir, normalized);
  const base = path.resolve(dir);
  if (resolved !== base && !resolved.startsWith(`${base}${path.sep}`)) {
    throw new Error('非法文件路径');
  }
  return resolved;
}

function removeDirRecursive(dir: string): void {
  if (!fs.existsSync(dir)) {
    return;
  }
  fs.rmSync(dir, { recursive: true, force: true });
}

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

function walkFileTree(dir: string, baseDir: string, entries: IWorkflowAgentFileTreeEntry[]): void {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.name.startsWith('.')) {
      continue;
    }
    const fullPath = path.join(dir, item.name);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    if (item.isDirectory()) {
      entries.push({ relativePath, isDirectory: true });
      walkFileTree(fullPath, baseDir, entries);
    } else {
      const stat = fs.statSync(fullPath);
      entries.push({ relativePath, isDirectory: false, size: stat.size });
    }
  }
}

/**
 * 注册工作流 Agent 目录 IPC
 */
export function registerWorkflowAgentIPC(): void {
  ipcMain.handle(IPC_CHANNELS.WORKFLOW_AGENT_ENSURE_DIR, async (_event, workflowName: string) => {
    try {
      const dir = resolveWorkflowDir(workflowName);
      fs.mkdirSync(dir, { recursive: true });
      return { success: true, dirPath: dir };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WORKFLOW_AGENT_DELETE_DIR, async (_event, workflowName: string) => {
    try {
      const dir = resolveWorkflowDir(workflowName);
      removeDirRecursive(dir);
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_AGENT_RENAME_DIR,
    async (_event, oldName: string, newName: string) => {
      try {
        const oldDir = resolveWorkflowDir(oldName);
        const newDir = resolveWorkflowDir(newName);
        if (fs.existsSync(newDir)) {
          return { success: false, error: '目标目录已存在' };
        }
        if (!fs.existsSync(oldDir)) {
          fs.mkdirSync(newDir, { recursive: true });
          return { success: true, dirPath: newDir };
        }
        fs.renameSync(oldDir, newDir);
        return { success: true, dirPath: newDir };
      } catch (e) {
        return { success: false, error: (e as Error).message };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_AGENT_LIST_DIR,
    async (_event, workflowName: string, nodeName?: string) => {
      try {
        const dir = nodeName
          ? resolveNodeDir(workflowName, nodeName)
          : resolveWorkflowDir(workflowName);
        if (!fs.existsSync(dir)) {
          return { success: true, entries: [] as IWorkflowAgentDirEntry[], dirPath: dir };
        }
        const entries: IWorkflowAgentDirEntry[] = fs
          .readdirSync(dir, { withFileTypes: true })
          .filter((e) => !e.name.startsWith('.'))
          .map((e) => {
            const fullPath = path.join(dir, e.name);
            const stat = e.isFile() ? fs.statSync(fullPath) : undefined;
            return {
              name: e.name,
              path: fullPath,
              type: e.isDirectory() ? 'directory' : 'file',
              size: stat?.size,
            };
          });
        return { success: true, entries, dirPath: dir };
      } catch (e) {
        return { success: false, error: (e as Error).message, entries: [] };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_AGENT_READ_FILE,
    async (_event, workflowName: string, nodeName: string, relativePath: string) => {
      try {
        const dir = resolveNodeDir(workflowName, nodeName);
        const filePath = resolveRelativePathInDir(dir, relativePath);
        if (!fs.existsSync(filePath)) {
          return { success: false, error: '文件不存在' };
        }
        const ext = path.extname(filePath).toLowerCase();
        if (!TEXT_EXTENSIONS.has(ext)) {
          return { success: false, error: '不支持的文件类型', skipped: true };
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        return { success: true, content, filePath };
      } catch (e) {
        return { success: false, error: (e as Error).message };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_AGENT_WRITE_FILE,
    async (
      _event,
      workflowName: string,
      nodeName: string,
      relativePath: string,
      content: string,
    ) => {
      try {
        const dir = resolveNodeDir(workflowName, nodeName);
        const filePath = resolveRelativePathInDir(dir, relativePath);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content, 'utf-8');
        return { success: true, filePath };
      } catch (e) {
        return { success: false, error: (e as Error).message };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_AGENT_DELETE_NODE_DIR,
    async (_event, workflowName: string, nodeName: string) => {
      try {
        const dir = resolveNodeDir(workflowName, sanitizeDirName(nodeName));
        removeDirRecursive(dir);
        return { success: true };
      } catch (e) {
        return { success: false, error: (e as Error).message };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_AGENT_RENAME_NODE_DIR,
    async (_event, workflowName: string, oldNodeName: string, newNodeName: string) => {
      try {
        const oldDir = resolveNodeDir(workflowName, oldNodeName);
        const newDir = resolveNodeDir(workflowName, newNodeName);
        if (fs.existsSync(newDir)) {
          return { success: false, error: '目标节点目录已存在' };
        }
        if (!fs.existsSync(oldDir)) {
          fs.mkdirSync(newDir, { recursive: true });
          return { success: true, dirPath: newDir };
        }
        fs.renameSync(oldDir, newDir);
        return { success: true, dirPath: newDir };
      } catch (e) {
        return { success: false, error: (e as Error).message };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_AGENT_LIST_FILE_TREE,
    async (_event, workflowName: string, nodeName: string) => {
      try {
        const dir = resolveNodeDir(workflowName, nodeName);
        fs.mkdirSync(dir, { recursive: true });
        const entries: IWorkflowAgentFileTreeEntry[] = [];
        walkFileTree(dir, dir, entries);
        return { success: true, entries, dirPath: dir };
      } catch (e) {
        return { success: false, error: (e as Error).message, entries: [] };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_AGENT_DELETE_FILE,
    async (_event, workflowName: string, nodeName: string, relativePath: string) => {
      try {
        const dir = resolveNodeDir(workflowName, nodeName);
        const filePath = resolveRelativePathInDir(dir, relativePath);
        if (!fs.existsSync(filePath)) {
          return { success: false, error: '文件不存在' };
        }
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
        return { success: true };
      } catch (e) {
        return { success: false, error: (e as Error).message };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_AGENT_CREATE_DIR,
    async (_event, workflowName: string, nodeName: string, relativePath: string) => {
      try {
        const dir = resolveNodeDir(workflowName, nodeName);
        const target = resolveRelativePathInDir(dir, relativePath);
        fs.mkdirSync(target, { recursive: true });
        return { success: true, dirPath: target };
      } catch (e) {
        return { success: false, error: (e as Error).message };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_AGENT_MOVE_PATH,
    async (
      _event,
      workflowName: string,
      nodeName: string,
      fromRelativePath: string,
      toRelativePath: string,
    ) => {
      try {
        const dir = resolveNodeDir(workflowName, nodeName);
        const fromPath = resolveRelativePathInDir(dir, fromRelativePath);
        const toPath = resolveRelativePathInDir(dir, toRelativePath);
        if (!fs.existsSync(fromPath)) {
          return { success: false, error: '源路径不存在' };
        }
        if (fs.existsSync(toPath)) {
          return { success: false, error: '目标路径已存在' };
        }
        fs.mkdirSync(path.dirname(toPath), { recursive: true });
        fs.renameSync(fromPath, toPath);
        return { success: true };
      } catch (e) {
        return { success: false, error: (e as Error).message };
      }
    },
  );
}
