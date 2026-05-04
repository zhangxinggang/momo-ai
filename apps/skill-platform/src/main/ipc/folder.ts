import { IPC_CHANNELS } from '@/types/constants';
import type { DCreateFolder, DUpdateFolder, IFolder } from '@/types/modules';
import { ipcMain } from 'electron';
import { FolderDB, PromptDB } from '../database';
import { syncPromptWorkspaceFromDatabase } from '../services/prompt';

/**
 * Register folder-related IPC handlers
 * 注册文件夹相关 IPC 处理器
 */
export function registerFolderIPC(db: FolderDB, promptDb: PromptDB): void {
  const syncWorkspace = async () => {
    await syncPromptWorkspaceFromDatabase(promptDb, db);
  };

  // Create folder
  // 创建文件夹
  ipcMain.handle(IPC_CHANNELS.FOLDER_CREATE, async (_event, data: DCreateFolder) => {
    const created = await db.create(data);
    await syncWorkspace();
    return created;
  });

  // Get all folders
  // 获取所有文件夹
  ipcMain.handle(IPC_CHANNELS.FOLDER_GET_ALL, async () => {
    return db.getAll();
  });

  // Update folder
  // 更新文件夹
  ipcMain.handle(IPC_CHANNELS.FOLDER_UPDATE, async (_event, id: string, data: DUpdateFolder) => {
    const updated = await db.update(id, data);
    if (updated) {
      await syncWorkspace();
    }
    return updated;
  });

  // Delete folder
  // 删除文件夹
  ipcMain.handle(IPC_CHANNELS.FOLDER_DELETE, async (_event, id: string) => {
    const deleted = await db.delete(id);
    if (deleted) {
      await syncWorkspace();
    }
    return deleted;
  });

  // Reorder folders
  // 重新排序文件夹
  ipcMain.handle(IPC_CHANNELS.FOLDER_REORDER, async (_event, ids: string[]) => {
    await db.reorder(ids);
    await syncWorkspace();
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.FOLDER_INSERT_DIRECT, async (_event, folder: IFolder) => {
    await db.insertFolderDirect(folder);
    return true;
  });
}
