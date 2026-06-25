import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';

import { isCodeEditorPath } from '@momo/file-editor/node';
import { createIgnoreFilter } from '../services/workspace/gitignore-filter';
import { grepWorkspace } from '../services/workspace/grep';
import { formatTreeSummary, listWorkspaceTree } from '../services/workspace/list-tree';
import { readFileSnippet } from '../services/workspace/read-snippet';

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

function assertWorkspaceDirectory(dirPath: string): void {
  if (!dirPath || typeof dirPath !== 'string') {
    throw new Error('路径不能为空');
  }
  const stat = fs.statSync(dirPath);
  if (!stat.isDirectory()) {
    throw new Error('指定路径不是目录');
  }
}

export function registerWorkspaceIPC(): void {
  ipcMain.handle(IPC_CHANNELS.WORKSPACE_LIST_DIR, async (_event, dirPath: string) => {
    if (!dirPath || typeof dirPath !== 'string') {
      return { success: false, error: '路径不能为空', entries: [] };
    }
    try {
      assertWorkspaceDirectory(dirPath);
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

  ipcMain.handle(IPC_CHANNELS.WORKSPACE_LIST_TREE, async (_event, dirPath: string) => {
    if (!dirPath || typeof dirPath !== 'string') {
      return { success: false, error: '路径不能为空', entries: [], treeText: '' };
    }
    try {
      assertWorkspaceDirectory(dirPath);
      const filter = createIgnoreFilter(dirPath);
      const { entries, truncated } = listWorkspaceTree(dirPath, filter);
      let treeText = formatTreeSummary(entries);
      if (truncated) {
        treeText = `${treeText}\n...(已截断)`;
      }
      return { success: true, entries, truncated, treeText, dirPath };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        entries: [],
        treeText: '',
      };
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.WORKSPACE_GREP,
    async (_event, payload: { dirPath: string; keywords: string[] }) => {
      const dirPath = payload?.dirPath;
      const keywords = Array.isArray(payload?.keywords) ? payload.keywords : [];
      if (!dirPath || typeof dirPath !== 'string') {
        return { success: false, error: '路径不能为空', hits: [] };
      }
      try {
        assertWorkspaceDirectory(dirPath);
        const filter = createIgnoreFilter(dirPath);
        const hits = grepWorkspace(dirPath, keywords, filter);
        return { success: true, hits };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          hits: [],
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKSPACE_READ_SNIPPET,
    async (_event, payload: { dirPath: string; relativePath: string; line: number }) => {
      const dirPath = payload?.dirPath;
      const relativePath = payload?.relativePath;
      const line = payload?.line;
      if (!dirPath || typeof dirPath !== 'string') {
        return { success: false, error: '路径不能为空', content: '' };
      }
      if (!relativePath || typeof relativePath !== 'string') {
        return { success: false, error: '文件路径不能为空', content: '' };
      }
      try {
        assertWorkspaceDirectory(dirPath);
        const filter = createIgnoreFilter(dirPath);
        const content = readFileSnippet(dirPath, relativePath, line ?? 1, filter);
        return { success: Boolean(content), content: content ?? '' };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          content: '',
        };
      }
    },
  );

  ipcMain.handle(IPC_CHANNELS.WORKSPACE_READ_FILE, async (_event, filePath: string) => {
    if (!filePath || typeof filePath !== 'string') {
      return { success: false, error: '文件路径不能为空', content: '' };
    }
    try {
      if (!isCodeEditorPath(filePath)) {
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
