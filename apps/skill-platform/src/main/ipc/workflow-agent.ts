import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';

import {
  getAgentDir,
  getWorkflowAgentDir,
  getWorkflowBusinessAgentDir,
  getWorkflowBusinessNodeAgentDir,
} from '../runtime-paths';

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

function resolveBusinessDir(workflowName: string, businessId: string): string {
  const dir = getWorkflowBusinessAgentDir(workflowName, businessId);
  const resolved = path.resolve(dir);
  const workflowDir = resolveWorkflowDir(workflowName);
  if (!resolved.startsWith(workflowDir)) {
    throw new Error('非法业务目录路径');
  }
  return resolved;
}

function resolveNodeDir(workflowName: string, businessId: string, nodeName: string): string {
  const dir = getWorkflowBusinessNodeAgentDir(workflowName, businessId, nodeName);
  const resolved = path.resolve(dir);
  const businessDir = resolveBusinessDir(workflowName, businessId);
  if (!resolved.startsWith(businessDir)) {
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

function listBusinessSubdirs(workflowName: string): string[] {
  const workflowDir = resolveWorkflowDir(workflowName);
  if (!fs.existsSync(workflowDir)) {
    return [];
  }
  return fs
    .readdirSync(workflowDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name);
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

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_AGENT_ENSURE_BUSINESS_DIR,
    async (_event, workflowName: string, businessId: string) => {
      try {
        const dir = resolveBusinessDir(workflowName, businessId);
        fs.mkdirSync(dir, { recursive: true });
        return { success: true, dirPath: dir };
      } catch (e) {
        return { success: false, error: (e as Error).message };
      }
    },
  );

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
    IPC_CHANNELS.WORKFLOW_AGENT_DELETE_BUSINESS_DIR,
    async (_event, workflowName: string, businessId: string) => {
      try {
        const dir = resolveBusinessDir(workflowName, businessId);
        removeDirRecursive(dir);
        return { success: true };
      } catch (e) {
        return { success: false, error: (e as Error).message };
      }
    },
  );

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
    async (_event, workflowName: string, businessId: string, nodeName?: string) => {
      try {
        const dir = nodeName
          ? resolveNodeDir(workflowName, businessId, nodeName)
          : resolveBusinessDir(workflowName, businessId);
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
    async (
      _event,
      workflowName: string,
      businessId: string,
      nodeName: string,
      relativePath: string,
    ) => {
      try {
        const dir = resolveNodeDir(workflowName, businessId, nodeName);
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
      businessId: string,
      nodeName: string,
      relativePath: string,
      content: string,
    ) => {
      try {
        const dir = resolveNodeDir(workflowName, businessId, nodeName);
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
    async (_event, workflowName: string, businessId: string, nodeName: string) => {
      try {
        const dir = resolveNodeDir(workflowName, businessId, sanitizeDirName(nodeName));
        removeDirRecursive(dir);
        return { success: true };
      } catch (e) {
        return { success: false, error: (e as Error).message };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_AGENT_RENAME_NODE_DIR,
    async (
      _event,
      workflowName: string,
      businessId: string,
      oldNodeName: string,
      newNodeName: string,
    ) => {
      try {
        const oldDir = resolveNodeDir(workflowName, businessId, oldNodeName);
        const newDir = resolveNodeDir(workflowName, businessId, newNodeName);
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
    IPC_CHANNELS.WORKFLOW_AGENT_DELETE_NODE_FOR_ALL_BUSINESSES,
    async (_event, workflowName: string, nodeName: string) => {
      try {
        const safeNode = sanitizeDirName(nodeName);
        for (const businessDirName of listBusinessSubdirs(workflowName)) {
          const nodeDir = path.join(resolveWorkflowDir(workflowName), businessDirName, safeNode);
          removeDirRecursive(nodeDir);
        }
        return { success: true };
      } catch (e) {
        return { success: false, error: (e as Error).message };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_AGENT_RENAME_NODE_FOR_ALL_BUSINESSES,
    async (_event, workflowName: string, oldNodeName: string, newNodeName: string) => {
      try {
        const safeOld = sanitizeDirName(oldNodeName);
        const safeNew = sanitizeDirName(newNodeName);
        for (const businessDirName of listBusinessSubdirs(workflowName)) {
          const workflowDir = resolveWorkflowDir(workflowName);
          const oldDir = path.join(workflowDir, businessDirName, safeOld);
          const newDir = path.join(workflowDir, businessDirName, safeNew);
          if (!fs.existsSync(oldDir)) {
            continue;
          }
          if (fs.existsSync(newDir)) {
            return { success: false, error: '目标节点目录已存在' };
          }
          fs.renameSync(oldDir, newDir);
        }
        return { success: true };
      } catch (e) {
        return { success: false, error: (e as Error).message };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_AGENT_LIST_FILE_TREE,
    async (_event, workflowName: string, businessId: string, nodeName: string) => {
      try {
        const dir = resolveNodeDir(workflowName, businessId, nodeName);
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
    async (
      _event,
      workflowName: string,
      businessId: string,
      nodeName: string,
      relativePath: string,
    ) => {
      try {
        const dir = resolveNodeDir(workflowName, businessId, nodeName);
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
    async (
      _event,
      workflowName: string,
      businessId: string,
      nodeName: string,
      relativePath: string,
    ) => {
      try {
        const dir = resolveNodeDir(workflowName, businessId, nodeName);
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
      businessId: string,
      nodeName: string,
      fromRelativePath: string,
      toRelativePath: string,
    ) => {
      try {
        const dir = resolveNodeDir(workflowName, businessId, nodeName);
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
