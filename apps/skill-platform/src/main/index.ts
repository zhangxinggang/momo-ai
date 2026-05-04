import {
  attachWindowCloseTrayBehavior,
  configureAppUserDataPath,
  configureTrayDefaults,
  createTray,
  destroyTray,
  getAppConfig,
  getMainWindow,
  getSystemLogo,
  init,
  inspectDataPath,
  isDev,
  isMac,
  isWin,
  readConfiguredDataPath,
  registerWindowChromeIpc,
  setMainWindow,
  writeConfiguredDataPath,
} from '@momo/electron';
import type { IRuntimeConfig } from '@momo/server';
import type { Database } from 'better-sqlite3';
import BetterSqlite3 from 'better-sqlite3';
import {
  BrowserWindow,
  Notification,
  app,
  dialog,
  ipcMain,
  protocol,
  session,
  shell,
} from 'electron';
import fs from 'fs';
import path from 'path';
import 'reflect-metadata';
import {
  FolderDB,
  PromptDB,
  SkillDB,
  closeDatabase,
  initDatabase,
  withBetterSqlite3NativeBinding,
} from './database';
import { registerAllIPC } from './ipc';
import { registerNoteIPC } from './ipc/note';
import { getMinimizeOnLaunchSetting } from './ipc/settings';
import { createMenu } from './menu';
import { getImagesDir, getVideosDir } from './runtime-paths';
import {
  bootstrapPromptWorkspace,
  detectResidualLegacyEntries,
  migrateLegacyDataLayout,
  startSilentExternalSkillImportSchedule,
} from './services';
import { registerWebviewExternalLinkHandlers } from './webview-external-links';

/** 根目录 appConf.js 中的桌面相关配置（与 @momo/electron README 约定一致） */
interface IDeskAppConf {
  loadURL?: string;
  openDevTools?: boolean;
  /** 为 false 时不启动 @momo/server 动态路由服务 */
  bundledNodeServer?: boolean;
}

const deskAppConf = getAppConfig() as IDeskAppConf;

// Disable GPU acceleration (optional; may be needed on some systems)
// 禁用 GPU 加速（可选，某些系统上可能需要）
// app.disableHardwareAcceleration();

let minimizeToTray = false;
let appDb: Database | null = null;
let isQuitting = false;
/** 退出时停止静默技能同步定时器 */
let disposeSilentExternalSkillImport: (() => void) | undefined;
// Close action: 'ask' = ask every time, 'minimize' = minimize to tray, 'exit' = exit directly
// 关闭行为: 'ask' = 每次询问, 'minimize' = 最小化到托盘, 'exit' = 直接退出
let closeAction: 'ask' | 'minimize' | 'exit' = 'ask';
// Whether we are waiting for the user to choose a close behavior
// 是否正在等待用户选择关闭行为
let pendingCloseAction = false;
let isDebugMode = false;
const { ico } = getSystemLogo();

configureTrayDefaults({
  toolTip: 'PromptHub',
  onBeforeAppQuit: () => {
    isQuitting = true;
  },
});

function emitWindowVisibility(isVisible: boolean) {
  const w = getMainWindow();
  if (w && !w.isDestroyed() && !w.webContents.isDestroyed()) {
    w.webContents.send('window:visibility-changed', isVisible);
  }
}

// Register privileged schemes (must be called before app is ready)
// 注册特权协议（必须在 app ready 之前调用）
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'local-image',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
  {
    scheme: 'local-video',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

configureAppUserDataPath({
  productName: 'PromptHub',
  configDirName: 'PromptHub',
  dataMarkers: [
    'prompthub.db',
    'data',
    'config',
    'backups',
    'logs',
    'workspace',
    'IndexedDB',
    'Local Storage',
    'Session Storage',
    'images',
    'videos',
    'skills',
    'shortcuts.json',
    'shortcut-mode.json',
  ],
});

const projectConfig = {
  appDataPath: app.getPath('appData'),
  userDataPath: app.getPath('userData'),
  productName: 'PromptHub',
  exePath: process.execPath,
  isPackaged: app.isPackaged,
  platform: process.platform,
};

registerWebviewExternalLinkHandlers();

async function createWindow() {
  const win = await init({
    config: {
      ...(ico ? { icon: ico } : {}),
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webviewTag: true,
      },
      // Use frameless window on Windows, native title bar on macOS
      // Windows 使用无边框窗口，macOS 使用原生标题栏
      frame: isWin ? false : true,
      titleBarStyle: isMac ? 'hiddenInset' : 'default',
      trafficLightPosition: isMac ? { x: 14, y: 22 } : undefined,
      // Dark background for Windows title bar
      // Windows 深色标题栏
      backgroundColor: '#1a1d23',
      // Don't show immediately - wait for ready-to-show to check minimizeOnLaunch setting
      // 不立即显示 - 等待 ready-to-show 事件检查 minimizeOnLaunch 设置
      show: false,
    },
    serverConfig: {
      services: {
        httpServer: {
          routes: {
            dynamicRouteDirs: [
              {
                rootDir: path.join(__dirname, '../../server'),
                rootPath: 'skills',
                auth: false,
              },
            ],
          },
        },
      },
    } as IRuntimeConfig,
    onAppReady: async () => {
      try {
        // 注册 local-image 协议
        session.defaultSession.protocol.registerFileProtocol('local-image', (request, callback) => {
          let url = request.url.replace('local-image://', '');
          // Strip leading slashes to avoid absolute path interpretation
          // 移除开头的斜杠（防止路径被解析为绝对路径）
          url = url.replace(/^\/+/, '');
          // Strip trailing slashes
          // 移除结尾的斜杠
          url = url.replace(/\/+$/, '');

          try {
            const decodedUrl = decodeURIComponent(url);
            const baseDir = getImagesDir();
            const normalized = path.normalize(decodedUrl).replace(/^([\\/])+/g, '');
            const imagePath = path.join(baseDir, normalized);

            // Prevent path traversal
            // 防止路径穿越
            if (!imagePath.startsWith(baseDir + path.sep) && imagePath !== baseDir) {
              console.warn('Blocked local-image path traversal:', decodedUrl);
              return callback({ path: '' });
            }

            callback({ path: imagePath });
          } catch (error) {
            console.error('Failed to register protocol', error);
            callback({ path: '' });
          }
        });

        // Register local-video protocol
        // 注册 local-video 协议
        session.defaultSession.protocol.registerFileProtocol('local-video', (request, callback) => {
          let url = request.url.replace('local-video://', '');
          // Strip leading slashes to avoid absolute path interpretation
          // 移除开头的斜杠（防止路径被解析为绝对路径）
          url = url.replace(/^\/+/, '');
          // Strip trailing slashes
          // 移除结尾的斜杠
          url = url.replace(/\/+$/, '');

          try {
            const decodedUrl = decodeURIComponent(url);
            const baseDir = getVideosDir();
            const normalized = path.normalize(decodedUrl).replace(/^([\/\\])+/g, '');
            const videoPath = path.join(baseDir, normalized);

            // Prevent path traversal
            // 防止路径穿越
            if (!videoPath.startsWith(baseDir + path.sep) && videoPath !== baseDir) {
              console.warn('Blocked local-video path traversal:', decodedUrl);
              return callback({ path: '' });
            }

            callback({ path: videoPath });
          } catch (error) {
            console.error('Failed to register local-video protocol', error);
            callback({ path: '' });
          }
        });

        try {
          const layoutMigration = await migrateLegacyDataLayout(
            app.getPath('userData'),
            app.getVersion(),
          );

          // 若有旧版条目因迁移失败而残留在根目录，记录警告；源目录仍会保留以防数据丢失
          if (layoutMigration.failedEntries.length > 0) {
            const residual = detectResidualLegacyEntries(app.getPath('userData'));
            if (residual.length > 0) {
              console.warn(
                '[startup] Some legacy data directories could not be moved automatically. ' +
                  'Source directories are preserved — no data was lost.',
                { residualEntries: residual },
              );
            }
          }
        } catch (error) {
          console.warn('[startup] data layout migration bootstrap failed, continuing:', error);
        }

        // Initialize database
        // 初始化数据库
        const db = await initDatabase();

        // v0.5.3: Wrap bootstrapPromptWorkspace in try/catch to prevent startup crash
        // if workspace directory operations fail (e.g., permission issues on Windows
        // upgrades). A workspace bootstrap failure should not block the app — users
        // can still access their data via the DB; workspace files can resync later.
        // v0.5.3: 用 try/catch 包裹 bootstrapPromptWorkspace，避免工作区目录操作失败
        // （如 Windows 升级后权限问题）阻塞整个启动流程。工作区引导失败不应阻塞应用，
        // 用户仍可通过数据库访问数据，工作区文件可稍后重新同步。
        try {
          const bootstrapResult = await bootstrapPromptWorkspace(new PromptDB(), new FolderDB());
          if (bootstrapResult.quadrant === 'empty') {
            console.warn(
              '[startup] Both database and workspace are empty. ' +
                'If this is an upgrade, restore data manually from backups or installer artifacts.',
            );
          }
        } catch (error) {
          console.error(
            '[startup] bootstrapPromptWorkspace failed, continuing without workspace sync:',
            error,
          );
        }
        appDb = db;
        registerAllIPC(db);

        disposeSilentExternalSkillImport?.();
        disposeSilentExternalSkillImport = startSilentExternalSkillImportSchedule(new SkillDB());

        // Create application menu
        // 创建菜单
        createMenu();

        registerNoteIPC();
      } catch (error) {
        console.error('Failed to initialize app:', error);
        dialog.showErrorBox(
          'Startup Error / 启动错误',
          `An error occurred during application startup:\n\n${error instanceof Error ? error.message : String(error)}\n\nStack:\n${error instanceof Error ? error.stack : ''}`,
        );
        app.quit();
      }
    },
  });
  setMainWindow(win);

  // Handle window ready-to-show: check if we should minimize on launch
  // 窗口准备就绪时：检查是否应该启动时最小化
  win.once('ready-to-show', () => {
    if (!appDb) {
      // No database available, show window normally
      // 数据库不可用，正常显示窗口
      win.show();
      emitWindowVisibility(true);
      return;
    }

    const shouldMinimize = getMinimizeOnLaunchSetting(appDb);
    if (shouldMinimize) {
      // Minimize to tray on launch
      // 启动时最小化到托盘
      createTray();
      emitWindowVisibility(false);
      // Don't show window, just keep it hidden
      // 不显示窗口，保持隐藏
    } else {
      // Show window normally
      // 正常显示窗口
      win.show();
      emitWindowVisibility(true);
    }
  });

  win.on('show', () => emitWindowVisibility(true));
  win.on('hide', () => emitWindowVisibility(false));
  win.on('minimize', () => emitWindowVisibility(false));
  win.on('restore', () => emitWindowVisibility(true));
  if (isDev) {
    // Dev mode: try to load Vite dev server
    // 开发模式：尝试连接 Vite 开发服务器
    const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    console.log('Loading dev server:', devServerUrl);
    try {
      await win.loadURL(devServerUrl);
      if (deskAppConf.openDevTools !== false) {
        win.webContents.openDevTools();
      }
    } catch (error) {
      console.error('Failed to load dev server:', error);
    }
  } else {
    await win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // 关闭行为：根据设置决定最小化到托盘或退出（实现位于 @momo/electron tray 模块）
  attachWindowCloseTrayBehavior(win, {
    getIsQuitting: () => isQuitting,
    getCloseAction: () => closeAction,
    getPendingCloseAction: () => pendingCloseAction,
    setPendingCloseAction: (value) => {
      pendingCloseAction = value;
    },
    getMinimizeToTray: () => minimizeToTray,
    notifyShowCloseDialog: (w) => {
      if (!w.webContents.isDestroyed()) {
        w.webContents.send('window:showCloseDialog');
      }
    },
  });
}
createWindow();

// Select folder dialog
// 选择文件夹对话框
ipcMain.handle('dialog:selectFolder', async () => {
  const result = await dialog.showOpenDialog(getMainWindow()!, {
    properties: ['openDirectory'],
    title: '选择数据目录',
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Get current data directory
// 获取当前数据目录
ipcMain.handle('data:getPath', () => {
  return app.getPath('userData');
});

ipcMain.handle('data:getStatus', () => {
  const currentPath = app.getPath('userData');
  const configuredPath = readConfiguredDataPath(projectConfig);
  const resolvedCurrentPath = path.resolve(currentPath);
  const resolvedConfiguredPath = configuredPath ? path.resolve(configuredPath) : null;

  return {
    configuredPath,
    currentPath,
    needsRestart: !!resolvedConfiguredPath && resolvedConfiguredPath !== resolvedCurrentPath,
  };
});

/**
 * Build the list of candidate paths where a previous database might reside.
 * On Windows this includes %APPDATA%/PromptHub (the Electron default).
 */
type DataPathChangeAction = 'migrate' | 'switch' | 'overwrite';

interface IDataPathSummary {
  promptCount: number;
  folderCount: number;
  skillCount: number;
  available: boolean;
  error?: string;
}

const DATA_PATH_MIGRATION_ITEMS = [
  'prompthub.db',
  'data',
  'config',
  'backups',
  'logs',
  'workspace',
  'IndexedDB',
  'Local Storage',
  'Session Storage',
  'images',
  'videos',
  'skills',
  'shortcuts.json',
  'shortcut-mode.json',
];

function getObjectNumberValue(source: unknown, key: string): number {
  if (!source || typeof source !== 'object') {
    return 0;
  }

  const value = Reflect.get(source, key);
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function databaseTableExists(db: Database, tableName: string): boolean {
  const row = db
    .prepare("SELECT 1 AS exists_flag FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(tableName);
  return getObjectNumberValue(row, 'exists_flag') === 1;
}

function countDatabaseTable(db: Database, tableName: string): number {
  if (!databaseTableExists(db, tableName)) {
    return 0;
  }

  const row = db.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get();
  return getObjectNumberValue(row, 'count');
}

function summarizeDatabase(db: Database): IDataPathSummary {
  return {
    promptCount: countDatabaseTable(db, 'prompts'),
    folderCount: countDatabaseTable(db, 'folders'),
    skillCount: countDatabaseTable(db, 'skills'),
    available: true,
  };
}

function summarizeDataPath(targetPath: string): IDataPathSummary {
  const resolvedTargetPath = path.resolve(targetPath);
  const currentPath = path.resolve(app.getPath('userData'));

  try {
    if (appDb && resolvedTargetPath === currentPath) {
      return summarizeDatabase(appDb);
    }

    const dbPath = path.join(resolvedTargetPath, 'prompthub.db');
    if (!fs.existsSync(dbPath)) {
      return {
        promptCount: 0,
        folderCount: 0,
        skillCount: 0,
        available: false,
      };
    }

    const db = new BetterSqlite3(dbPath, withBetterSqlite3NativeBinding({ readonly: true }));
    try {
      return summarizeDatabase(db);
    } finally {
      db.close();
    }
  } catch (error) {
    return {
      promptCount: 0,
      folderCount: 0,
      skillCount: 0,
      available: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function isSensitiveDataPathTarget(resolvedNewPath: string): string | null {
  const sensitiveRoots = [
    '/etc',
    '/usr',
    '/bin',
    '/sbin',
    '/var',
    '/tmp',
    '/System',
    '/Library',
    'C:\\Windows',
    'C:\\Program Files',
  ];

  return (
    sensitiveRoots.find((root) => resolvedNewPath.toLowerCase().startsWith(root.toLowerCase())) ??
    null
  );
}

function isPathInside(parentPath: string, childPath: string): boolean {
  const resolvedParent = path.resolve(parentPath);
  const resolvedChild = path.resolve(childPath);
  return (
    resolvedChild !== resolvedParent && resolvedChild.startsWith(`${resolvedParent}${path.sep}`)
  );
}

type ShowAppWindowLike = Pick<
  BrowserWindow,
  'isMinimized' | 'restore' | 'isVisible' | 'show' | 'hide' | 'focus'
>;

function toggleWindowForShowApp(win: ShowAppWindowLike): void {
  if (win.isMinimized()) {
    win.restore();
    win.show();
    win.focus();
    return;
  }

  if (win.isVisible()) {
    win.hide();
    return;
  }

  win.show();
  win.focus();
}

function scheduleAppRelaunch(delayMs = 0): void {
  const relaunch = () => {
    app.relaunch();
    app.quit();
  };

  if (delayMs > 0) {
    setTimeout(relaunch, delayMs);
    return;
  }

  relaunch();
}

registerWindowChromeIpc({
  getMinimizeToTray: () => minimizeToTray,
  setMinimizeToTray: (value) => {
    minimizeToTray = value;
  },
  getCloseAction: () => closeAction,
  setCloseAction: (value) => {
    closeAction = value;
  },
  getPendingCloseAction: () => pendingCloseAction,
  setPendingCloseAction: (value) => {
    pendingCloseAction = value;
  },
  getIsQuitting: () => isQuitting,
  setIsQuitting: (value) => {
    isQuitting = value;
  },
  getIsDebugMode: () => isDebugMode,
  setIsDebugMode: (value) => {
    isDebugMode = value;
  },
  createTray,
  destroyTray,
  toggleWindowForShowApp,
  scheduleAppRelaunch,
});

function copyFileForDataPath(sourcePath: string, destPath: string, overwrite: boolean): void {
  if (fs.existsSync(destPath)) {
    if (!overwrite) {
      throw new Error(`Target already contains ${path.basename(destPath)}`);
    }
    fs.rmSync(destPath, { recursive: true, force: true });
  }

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(sourcePath, destPath);
}

function copyDirForDataPath(sourcePath: string, destPath: string, overwrite: boolean): void {
  if (fs.existsSync(destPath)) {
    if (!overwrite) {
      throw new Error(`Target already contains ${path.basename(destPath)}`);
    }
    fs.rmSync(destPath, { recursive: true, force: true });
  }

  const entries = fs.readdirSync(sourcePath, { withFileTypes: true });
  fs.mkdirSync(destPath, { recursive: true });

  for (const entry of entries) {
    const nextSourcePath = path.join(sourcePath, entry.name);
    const nextDestPath = path.join(destPath, entry.name);

    if (entry.isDirectory()) {
      copyDirForDataPath(nextSourcePath, nextDestPath, false);
    } else {
      copyFileForDataPath(nextSourcePath, nextDestPath, false);
    }
  }
}

function copyDataPathItem(sourcePath: string, destPath: string, overwrite: boolean): void {
  const sourceStat = fs.statSync(sourcePath);
  if (sourceStat.isDirectory()) {
    copyDirForDataPath(sourcePath, destPath, overwrite);
    return;
  }

  copyFileForDataPath(sourcePath, destPath, overwrite);
}

async function applyDataPathChange(
  newPath: string,
  action: DataPathChangeAction,
): Promise<{
  success: boolean;
  message?: string;
  newPath?: string;
  needsRestart?: boolean;
  error?: string;
}> {
  if (typeof newPath !== 'string' || newPath.trim().length === 0) {
    return {
      success: false,
      error: 'data path change requires a non-empty newPath string',
    };
  }
  if (action !== 'migrate' && action !== 'switch' && action !== 'overwrite') {
    return {
      success: false,
      error: `Unsupported data path change action: ${action}`,
    };
  }

  const currentPath = app.getPath('userData');
  const resolvedTargetPath = path.resolve(newPath);
  if (path.resolve(currentPath) === resolvedTargetPath) {
    return {
      success: true,
      message: 'Data directory is already current',
      newPath: resolvedTargetPath,
      needsRestart: false,
    };
  }

  const sensitiveRoot = isSensitiveDataPathTarget(resolvedTargetPath);
  if (sensitiveRoot) {
    return {
      success: false,
      error: `Cannot use system directory as data directory: ${resolvedTargetPath}`,
    };
  }

  if (action !== 'switch' && isPathInside(currentPath, resolvedTargetPath)) {
    return {
      success: false,
      error: 'Cannot migrate data into a child directory of the current data directory',
    };
  }

  const targetInspection = inspectDataPath(projectConfig, resolvedTargetPath);
  if (action === 'switch') {
    if (!targetInspection.exists) {
      return {
        success: false,
        error: `Cannot switch to a directory that does not exist: ${resolvedTargetPath}`,
      };
    }

    writeConfiguredDataPath(projectConfig, resolvedTargetPath);
    return {
      success: true,
      message: 'Data directory switched',
      newPath: resolvedTargetPath,
      needsRestart: true,
    };
  }

  if (action === 'migrate' && targetInspection.hasExistingData) {
    return {
      success: false,
      error:
        'Target directory already contains PromptHub data. Switch to it or choose overwrite instead.',
    };
  }

  try {
    if (!fs.existsSync(resolvedTargetPath)) {
      fs.mkdirSync(resolvedTargetPath, { recursive: true });
    }

    let migratedCount = 0;
    for (const item of DATA_PATH_MIGRATION_ITEMS) {
      const sourcePath = path.join(currentPath, item);
      const destPath = path.join(resolvedTargetPath, item);
      if (!fs.existsSync(sourcePath)) {
        continue;
      }

      copyDataPathItem(sourcePath, destPath, action === 'overwrite');
      migratedCount++;
    }

    writeConfiguredDataPath(projectConfig, resolvedTargetPath);

    return {
      success: true,
      message: `Successfully migrated ${migratedCount} items`,
      newPath: resolvedTargetPath,
      needsRestart: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

ipcMain.handle('data:previewDataPathChange', async (_event, newPath: string) => {
  if (typeof newPath !== 'string' || newPath.trim().length === 0) {
    return {
      success: false,
      error: 'data:previewDataPathChange requires a non-empty newPath string',
    };
  }

  const currentPath = app.getPath('userData');
  const resolvedTargetPath = path.resolve(newPath);
  const inspection = inspectDataPath(projectConfig, resolvedTargetPath);
  const isCurrentPath = path.resolve(currentPath) === resolvedTargetPath;

  return {
    success: true,
    targetPath: resolvedTargetPath,
    currentPath,
    exists: inspection.exists,
    hasExistingData: inspection.hasExistingData,
    isCurrentPath,
    markers: inspection.markers,
    currentSummary: summarizeDataPath(currentPath),
    targetSummary: summarizeDataPath(resolvedTargetPath),
    recommendedAction: isCurrentPath ? 'switch' : inspection.hasExistingData ? 'switch' : 'migrate',
  };
});

ipcMain.handle(
  'data:applyDataPathChange',
  async (_event, params: { newPath?: unknown; action?: unknown }) => {
    const newPath = typeof params?.newPath === 'string' ? params.newPath : '';
    const action =
      params?.action === 'switch' || params?.action === 'overwrite' || params?.action === 'migrate'
        ? params.action
        : 'migrate';
    return applyDataPathChange(newPath, action);
  },
);

// Migrate data to a new directory
// 迁移数据到新目录
ipcMain.handle('data:migrate', async (_event, newPath: string) => {
  return applyDataPathChange(newPath, 'migrate');
});

// Open a folder in the system file manager
// 在文件管理器中打开文件夹
ipcMain.handle('shell:openPath', async (_event, folderPath: string) => {
  if (typeof folderPath !== 'string' || folderPath.trim().length === 0) {
    return {
      success: false,
      error: 'shell:openPath requires a non-empty folderPath string',
    };
  }
  // Expand special path tokens
  // 处理特殊路径
  let realPath = folderPath;
  if (folderPath.startsWith('~')) {
    realPath = folderPath.replace('~', app.getPath('home'));
  } else if (folderPath.includes('%APPDATA%')) {
    realPath = folderPath.replace('%APPDATA%', app.getPath('appData'));
  }

  // Security: only allow opening directories, not executable files
  // 安全：只允许打开目录，不允许打开可执行文件
  try {
    const stat = fs.statSync(realPath);
    if (!stat.isDirectory()) {
      return { success: false, error: 'Only directories can be opened' };
    }
  } catch (statError) {
    // Path doesn't exist yet — let shell.openPath handle the error
  }

  try {
    await shell.openPath(realPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// 在系统默认浏览器中打开外部链接
ipcMain.handle('shell:openExternal', async (_event, url: string) => {
  if (typeof url !== 'string' || url.trim().length === 0) {
    return {
      success: false,
      error: 'shell:openExternal requires a non-empty url string',
    };
  }

  const normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    return {
      success: false,
      error: 'Only http/https links are allowed',
    };
  }

  try {
    await shell.openExternal(normalized);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// Show system notification
// 发送系统通知
ipcMain.handle('notification:show', async (_event, options: { title: string; body: string }) => {
  if (!options || typeof options !== 'object') {
    throw new Error('notification:show requires a non-null options object');
  }
  if (typeof options.title !== 'string' || typeof options.body !== 'string') {
    throw new Error('notification:show requires title and body to be strings');
  }
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: options.title,
      body: options.body,
      icon: ico,
    });
    notification.show();
    return true;
  }
  return false;
});

// Cleanup before quitting
// 应用退出前清理
app.on('before-quit', () => {
  isQuitting = true;
  disposeSilentExternalSkillImport?.();
  disposeSilentExternalSkillImport = undefined;
  void closeDatabase();
});

// 主窗口引用由 @momo/electron 的 getMainWindow / setMainWindow 维护
export { getMainWindow, setMainWindow };
