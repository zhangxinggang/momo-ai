import {
  attachWindowCloseTrayBehavior,
  configureTrayDefaults,
  createTray,
  destroyTray,
  getAppConfig,
  getMainWindow,
  getSystemLogo,
  init,
  isDev,
  isMac,
  isWin,
  registerWindowChromeIpc,
  setMainWindow,
} from '@momo/electron';
import type { IRuntimeConfig } from '@momo/server';
import type { Database } from 'better-sqlite3';
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
import { FolderDB, PromptDB, SkillDB, closeDatabase, initDatabase } from './database';
import { registerAllIPC } from './ipc';
import { registerNoteIPC } from './ipc/note';
import { getMinimizeOnLaunchSetting } from './ipc/settings';
import { createMenu } from './menu';
import { getImagesDir, getVideosDir } from './runtime-paths';
import { bootstrapPromptWorkspace, startSilentExternalSkillImportSchedule } from './services';
import { noteWorkspaceService } from './services/note';

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
            console.warn('[startup] Both database and workspace are empty.');
          }
        } catch (error) {
          console.error(
            '[startup] bootstrapPromptWorkspace failed, continuing without workspace sync:',
            error,
          );
        }

        try {
          noteWorkspaceService.bootstrapCursorRulesFromProject();
        } catch (error) {
          console.error('[startup] bootstrapCursorRulesFromProject failed:', error);
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

ipcMain.handle('dialog:selectFolders', async () => {
  const result = await dialog.showOpenDialog(getMainWindow()!, {
    properties: ['openDirectory', 'multiSelections'],
    title: '选择工作区目录',
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths;
  }
  return [];
});

ipcMain.handle('fs:pathExists', async (_event, targetPath: string) => {
  if (!targetPath?.trim()) {
    return false;
  }
  try {
    return fs.existsSync(targetPath);
  } catch {
    return false;
  }
});

// Get current data directory
// 获取当前数据目录
ipcMain.handle('data:getPath', () => {
  return app.getPath('userData');
});

ipcMain.handle('data:getStatus', () => {
  return {
    currentPath: app.getPath('userData'),
  };
});

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
