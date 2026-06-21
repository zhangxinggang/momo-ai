import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { isTextFilePath } from '@/utils/text-file';
import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';

const MAX_FILE_SIZE = 1024 * 50;

interface IDirEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
}

function listDirectory(
  dirPath: string,
  maxDepth: number = 2,
  currentDepth: number = 0,
): IDirEntry[] {
  if (currentDepth >= maxDepth) return [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const result: IDirEntry[] = [];
    for (const entry of entries) {
      if (
        entry.name.startsWith('.') ||
        entry.name === 'node_modules' ||
        entry.name === '__pycache__'
      )
        continue;
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        result.push({ name: entry.name, path: fullPath, type: 'directory' });
      } else if (entry.isFile()) {
        try {
          const stat = fs.statSync(fullPath);
          result.push({ name: entry.name, path: fullPath, type: 'file', size: stat.size });
        } catch {
          result.push({ name: entry.name, path: fullPath, type: 'file' });
        }
      }
    }
    return result;
  } catch {
    return [];
  }
}

export function registerWorkspaceIPC(): void {
  ipcMain.handle(IPC_CHANNELS.WORKSPACE_LIST_DIR, async (_event, dirPath: string) => {
    if (!dirPath || typeof dirPath !== 'string') {
      return { success: false, error: '路径不能为空', entries: [] };
    }
    try {
      const stat = fs.statSync(dirPath);
      if (!stat.isDirectory()) {
        return { success: false, error: '指定路径不是目录', entries: [] };
      }
      const entries = listDirectory(dirPath);
      return { success: true, entries, dirPath };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        entries: [],
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WORKSPACE_READ_FILE, async (_event, filePath: string) => {
    if (!filePath || typeof filePath !== 'string') {
      return { success: false, error: '文件路径不能为空', content: '' };
    }
    try {
      if (!isTextFilePath(filePath)) {
        return { success: false, error: '非文本文件，跳过', content: '', skipped: true };
      }
      const stat = fs.statSync(filePath);
      if (stat.size > MAX_FILE_SIZE) {
        const content = fs.readFileSync(filePath, 'utf-8').slice(0, MAX_FILE_SIZE);
        return { success: true, content, truncated: true, size: stat.size, filePath };
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      return { success: true, content, truncated: false, size: stat.size, filePath };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        content: '',
      };
    }
  });
}
