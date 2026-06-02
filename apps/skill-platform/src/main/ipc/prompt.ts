import { IPC_CHANNELS } from '@/types/constants';
import type {
  DCreatePrompt,
  DPromptSearch,
  DUpdatePrompt,
  IPrompt,
  IPromptVersion,
} from '@/types/modules';
import { ipcMain } from 'electron';
import { FolderDB, PromptDB } from '../database';
import { syncPromptWorkspaceFromDatabase } from '../services/prompt';

/**
 * Register IPrompt-related IPC handlers
 * 注册 IPrompt 相关 IPC 处理器
 */
export function registerPromptIPC(db: PromptDB, folderDb: FolderDB): void {
  const syncWorkspace = async () => {
    await syncPromptWorkspaceFromDatabase(db, folderDb);
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
