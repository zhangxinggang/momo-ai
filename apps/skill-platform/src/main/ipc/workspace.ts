import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { ipcMain } from 'electron';
import fs from 'fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'path';

import { isCodeEditorPath } from '@momo/file-editor/node';
import { createIgnoreFilter } from '../services/workspace/gitignore-filter';
import { grepWorkspace } from '../services/workspace/grep';
import { formatTreeSummary, listWorkspaceTree } from '../services/workspace/list-tree';
import { readFileSnippet } from '../services/workspace/read-snippet';
import {
  assertFileWithinWorkspaceRoot,
  assertGrantedWorkspaceDirectory,
  assertGrantedWorkspaceFile,
} from '../services/workspace/root-permissions';

const MAX_FILE_SIZE = 1024 * 50;
const execFileAsync = promisify(execFile);

interface IDirEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
}

async function listDirectory(dirPath: string): Promise<IDirEntry[]> {
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
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
        result.push({ name: entry.name, path: fullPath, type: 'file' });
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
      const grantedPath = assertGrantedWorkspaceDirectory(dirPath);
      const entries = await listDirectory(grantedPath);
      return { success: true, entries, dirPath: grantedPath };
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
      const grantedPath = assertGrantedWorkspaceDirectory(dirPath);
      const filter = createIgnoreFilter(grantedPath);
      const { entries, truncated } = listWorkspaceTree(grantedPath, filter);
      let treeText = formatTreeSummary(entries);
      if (truncated) {
        treeText = `${treeText}\n...(已截断)`;
      }
      return { success: true, entries, truncated, treeText, dirPath: grantedPath };
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
        const grantedPath = assertGrantedWorkspaceDirectory(dirPath);
        const filter = createIgnoreFilter(grantedPath);
        const hits = grepWorkspace(grantedPath, keywords, filter);
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
        const grantedPath = assertGrantedWorkspaceDirectory(dirPath);
        const filePath = assertFileWithinWorkspaceRoot(
          grantedPath,
          path.resolve(grantedPath, relativePath),
        );
        const safeRelativePath = path.relative(grantedPath, filePath);
        const filter = createIgnoreFilter(grantedPath);
        const content = readFileSnippet(grantedPath, safeRelativePath, line ?? 1, filter);
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
      const grantedFilePath = assertGrantedWorkspaceFile(filePath);
      if (!isCodeEditorPath(grantedFilePath)) {
        return { success: false, error: '非文本文件，跳过', content: '', skipped: true };
      }
      const stat = fs.statSync(grantedFilePath);
      if (stat.size > MAX_FILE_SIZE) {
        const content = fs.readFileSync(grantedFilePath, 'utf-8').slice(0, MAX_FILE_SIZE);
        return {
          success: true,
          content,
          truncated: true,
          size: stat.size,
          filePath: grantedFilePath,
        };
      }
      const content = fs.readFileSync(grantedFilePath, 'utf-8');
      return {
        success: true,
        content,
        truncated: false,
        size: stat.size,
        filePath: grantedFilePath,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        content: '',
      };
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.WORKSPACE_REVIEW_FILE,
    async (_event, payload: { dirPath: string; filePath: string }) => {
      const dirPath = payload?.dirPath;
      const requestedPath = payload?.filePath;
      if (!dirPath || !requestedPath) {
        return { success: false, error: '工作区和文件路径不能为空' };
      }

      try {
        const workspaceRoot = assertGrantedWorkspaceDirectory(dirPath);
        const targetPath = assertFileWithinWorkspaceRoot(
          workspaceRoot,
          path.isAbsolute(requestedPath)
            ? requestedPath
            : path.resolve(workspaceRoot, requestedPath),
        );
        const stat = fs.statSync(targetPath);
        if (!stat.isFile()) {
          return { success: false, error: '目标不是文件' };
        }
        if (stat.size > 1024 * 1024) {
          return { success: false, error: '文件超过 1 MB，无法在审阅面板中打开' };
        }

        const currentContent = fs.readFileSync(targetPath, 'utf-8');
        let baseContent = '';
        let hasBase = false;

        try {
          const { stdout: gitRootOutput } = await execFileAsync(
            'git',
            ['-C', workspaceRoot, 'rev-parse', '--show-toplevel'],
            { encoding: 'utf8', maxBuffer: 1024 * 1024 },
          );
          const gitRoot = gitRootOutput.trim();
          const gitRelativePath = path.relative(gitRoot, targetPath).split(path.sep).join('/');
          if (
            gitRelativePath &&
            !gitRelativePath.startsWith('../') &&
            !path.isAbsolute(gitRelativePath)
          ) {
            const { stdout } = await execFileAsync(
              'git',
              ['-C', gitRoot, 'show', `HEAD:${gitRelativePath}`],
              {
                encoding: 'utf8',
                maxBuffer: 2 * 1024 * 1024,
              },
            );
            baseContent = stdout;
            hasBase = true;
          }
        } catch {
          // Untracked files and non-Git workspaces have no baseline; review still shows AI output.
        }

        return {
          success: true,
          filePath: targetPath,
          relativePath: path.relative(workspaceRoot, targetPath).split(path.sep).join('/'),
          currentContent,
          baseContent,
          hasBase,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  );
}
