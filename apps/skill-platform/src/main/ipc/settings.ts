import { IPC_CHANNELS } from '@/types/constants';
import {
  getPlatformById,
  normalizeLegacySkillPathToRootTemplate,
} from '@/types/constants/platforms';
import type { ISettings } from '@/types/modules';
import { DEFAULT_SETTINGS } from '@/types/modules';
import type { Database } from 'better-sqlite3';
import { ipcMain } from 'electron';

/**
 * Get minimizeOnLaunch setting from database
 * 从数据库读取启动时最小化设置
 * @param db Database instance
 * @returns boolean - whether to minimize on launch
 */
export function getMinimizeOnLaunchSetting(db: Database): boolean {
  try {
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    const row = stmt.get('minimizeOnLaunch') as { value: string } | undefined;
    if (row) {
      return JSON.parse(row.value) === true;
    }
  } catch (e) {
    console.error('Failed to read minimizeOnLaunch setting:', e);
  }
  return false; // Default to false
}

/**
 * Register settings-related IPC handlers
 * 注册设置相关 IPC 处理器
 */
export function registerSettingsIPC(db: Database): void {
  // Get settings
  // 获取设置
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async () => {
    const settings: ISettings = { ...DEFAULT_SETTINGS };

    const stmt = db.prepare('SELECT key, value FROM settings');
    const rows = stmt.all() as { key: string; value: string }[];

    for (const row of rows) {
      try {
        (settings as any)[row.key] = JSON.parse(row.value);
      } catch {
        (settings as any)[row.key] = row.value;
      }
    }

    if (
      (!settings.customPlatformRootPaths ||
        Object.keys(settings.customPlatformRootPaths).length === 0) &&
      settings.customSkillPlatformPaths &&
      Object.keys(settings.customSkillPlatformPaths).length > 0
    ) {
      settings.customPlatformRootPaths = Object.fromEntries(
        Object.entries(settings.customSkillPlatformPaths).map(([platformId, skillPath]) => {
          const platform = getPlatformById(platformId);
          if (!platform) {
            return [platformId, skillPath];
          }
          return [platformId, normalizeLegacySkillPathToRootTemplate(platform, skillPath)];
        }),
      );
    }

    // device 仅用于旧版 SQLite 行；设备策略已迁移到 Web localStorage，不向渲染层透出
    delete (settings as unknown as Record<string, unknown>).device;

    return settings;
  });

  // Save settings
  // 保存设置
  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, async (_event, newSettings: Partial<ISettings>) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
    `);

    const transaction = db.transaction(() => {
      for (const [key, value] of Object.entries(newSettings)) {
        stmt.run(key, JSON.stringify(value));
      }
    });

    transaction();
    return true;
  });
}
