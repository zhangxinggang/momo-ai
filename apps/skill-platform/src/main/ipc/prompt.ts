import { IPC_CHANNELS } from '@/types/constants';
import type {
  DCreatePrompt,
  DPromptSearch,
  DUpdatePrompt,
  IFolder,
  IPrompt,
  IPromptVersion,
} from '@/types/modules';
import { ipcMain } from 'electron';
import { FolderDB, PromptDB } from '../database';
import { runInTransaction } from '../database/repository/sql-runner';
import { syncPromptWorkspaceFromDatabase } from '../services/prompt';

/**
 * Register IPrompt-related IPC handlers
 * 注册 IPrompt 相关 IPC 处理器
 */
export function registerPromptIPC(db: PromptDB, folderDb: FolderDB): void {
  const syncWorkspace = async () => {
    await syncPromptWorkspaceFromDatabase(db, folderDb);
  };

  const sortFoldersForInsert = (folders: IFolder[]): IFolder[] => {
    const pending = new Map(folders.map((folder) => [folder.id, folder]));
    const ordered: IFolder[] = [];
    const emitted = new Set<string>();

    while (pending.size > 0) {
      let progressed = false;

      for (const [id, folder] of pending) {
        if (!folder.parentId || emitted.has(folder.parentId) || !pending.has(folder.parentId)) {
          ordered.push(folder);
          emitted.add(id);
          pending.delete(id);
          progressed = true;
        }
      }

      if (progressed) {
        continue;
      }

      const remaining = [...pending.values()].sort((left, right) =>
        left.id.localeCompare(right.id),
      );
      ordered.push(...remaining);
      break;
    }

    return ordered;
  };

  // Create IPrompt
  // 创建 IPrompt
  ipcMain.handle(IPC_CHANNELS.PROMPT_CREATE, async (_, data: DCreatePrompt) => {
    const created = await db.create(data);
    await syncWorkspace();
    return created;
  });

  // Get single IPrompt
  // 获取单个 IPrompt
  ipcMain.handle(IPC_CHANNELS.PROMPT_GET, async (_, id: string) => {
    return db.getById(id);
  });

  // Get all Prompts
  // 获取所有 Prompts
  ipcMain.handle(IPC_CHANNELS.PROMPT_GET_ALL, async () => {
    return db.getAll();
  });

  // Update IPrompt
  // 更新 IPrompt
  ipcMain.handle(IPC_CHANNELS.PROMPT_UPDATE, async (_, id: string, data: DUpdatePrompt) => {
    const updated = await db.update(id, data);
    if (updated) {
      await syncWorkspace();
    }
    return updated;
  });

  // Delete IPrompt
  // 删除 IPrompt
  ipcMain.handle(IPC_CHANNELS.PROMPT_DELETE, async (_, id: string) => {
    const deleted = await db.delete(id);
    if (deleted) {
      await syncWorkspace();
    }
    return deleted;
  });

  // Search Prompts
  // 搜索 IPrompt
  ipcMain.handle(IPC_CHANNELS.PROMPT_SEARCH, async (_, query: DPromptSearch) => {
    return db.search(query);
  });

  // Copy IPrompt (after variable replacement)
  // 复制 IPrompt（替换变量后）
  ipcMain.handle(
    IPC_CHANNELS.PROMPT_COPY,
    async (_, id: string, variables: Record<string, string>) => {
      const prompt = await db.getById(id);
      if (!prompt) return null;

      // Replace variables
      // 替换变量
      let content = prompt.userPrompt;
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      }

      // Update usage count
      // 更新使用次数
      await db.incrementUsage(id);

      return content;
    },
  );

  ipcMain.handle(IPC_CHANNELS.PROMPT_INSERT_DIRECT, async (_, prompt: IPrompt) => {
    await db.insertPromptDirect(prompt);
    return true;
  });

  /**
   * Atomic batch IDB→SQLite migration.
   * All inserts (folders + prompts + versions) are wrapped in a single SQLite
   * transaction so there are no partial writes. If the target DB already has
   * prompts the call is a safe no-op and returns { imported: false }.
   *
   * 原子批量迁移：将 IndexedDB 数据一次性写入 SQLite（单事务，无部分写入风险）。
   * 若 SQLite 已有数据，直接返回 { imported: false }（防覆盖保护）。
   */
  ipcMain.handle(
    IPC_CHANNELS.PROMPT_MIGRATE_IDB_BATCH,
    async (
      _,
      payload: {
        folders: IFolder[];
        prompts: IPrompt[];
        versions: IPromptVersion[];
      },
    ): Promise<{
      imported: boolean;
      promptCount: number;
      folderCount: number;
      versionCount: number;
    }> => {
      // 输入保护：拒绝 null 或非对象入参。
      if (!payload || typeof payload !== 'object') {
        return { imported: false, promptCount: 0, folderCount: 0, versionCount: 0 };
      }

      // 保护：若 SQLite 已有 prompt，不覆盖。
      const existing = await db.getAll();
      if (existing.length > 0) {
        return { imported: false, promptCount: 0, folderCount: 0, versionCount: 0 };
      }

      const { folders = [], prompts = [], versions = [] } = payload;

      if (prompts.length === 0 && folders.length === 0) {
        return { imported: false, promptCount: 0, folderCount: 0, versionCount: 0 };
      }

      // 使用 TypeORM 单事务包裹所有插入，确保原子性。
      await runInTransaction(async (manager) => {
        for (const folder of sortFoldersForInsert(folders)) {
          await folderDb.insertFolderDirect(folder, manager);
        }
        for (const prompt of prompts) {
          await db.insertPromptDirect(prompt, manager);
        }
        for (const version of versions) {
          await db.insertVersionDirect(version, manager);
        }
      });

      await syncWorkspace();

      return {
        imported: true,
        promptCount: prompts.length,
        folderCount: folders.length,
        versionCount: versions.length,
      };
    },
  );

  ipcMain.handle(IPC_CHANNELS.PROMPT_SYNC_WORKSPACE, async () => {
    await syncWorkspace();
    return true;
  });

  // Get all versions
  // 获取所有版本
  ipcMain.handle(IPC_CHANNELS.VERSION_GET_ALL, async (_, promptId: string) => {
    return db.getVersions(promptId);
  });

  // Create version
  // 创建版本
  ipcMain.handle(IPC_CHANNELS.VERSION_CREATE, async (_, promptId: string, note?: string) => {
    const created = await db.createVersion(promptId, note);
    await syncWorkspace();
    return created;
  });

  // Rollback version
  // 回滚版本
  ipcMain.handle(IPC_CHANNELS.VERSION_ROLLBACK, async (_, promptId: string, version: number) => {
    const rolledBack = await db.rollback(promptId, version);
    if (rolledBack) {
      await syncWorkspace();
    }
    return rolledBack;
  });

  ipcMain.handle(IPC_CHANNELS.VERSION_DELETE, async (_, versionId: string) => {
    const deleted = await db.deleteVersion(versionId);
    if (deleted) {
      await syncWorkspace();
    }
    return deleted;
  });

  ipcMain.handle(IPC_CHANNELS.VERSION_INSERT_DIRECT, async (_, version: IPromptVersion) => {
    await db.insertVersionDirect(version);
    return true;
  });
}
