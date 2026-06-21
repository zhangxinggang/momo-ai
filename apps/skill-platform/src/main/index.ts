import {
  configureTrayDefaults,
  getAppConfig,
  getMainWindow,
  init,
  isMac,
  isWin,
  setMainWindow,
} from '@momo/electron';
import type { IRuntimeConfig } from '@momo/server';
import type { Database } from 'better-sqlite3';
import { app, dialog } from 'electron';
import path from 'path';
import 'reflect-metadata';
import { runAppStartup } from './bootstrap/startup';
import { closeDatabase, initDatabase } from './database';
import { registerBootstrapIPC } from './ipc';
import { markAppQuitting } from './ipc/window-chrome';
import { registerLocalMediaPrivilegedSchemes } from './protocol/local-media';
import {
  attachMainWindowCloseBehavior,
  loadMainWindowContent,
  setupMainWindowReadyBehavior,
} from './window/setup';

/** 根目录 appConf.js 中的桌面相关配置（与 @momo/electron README 约定一致） */
interface IDeskAppConf {
  loadURL?: string;
  openDevTools?: boolean;
  /** 为 false 时不启动 @momo/server 动态路由服务 */
  bundledNodeServer?: boolean;
}

const { appName, openDevTools } = getAppConfig() as IDeskAppConf & { appName?: string };

let appDb: Database | null = null;
/** 退出时停止静默技能同步定时器 */
let disposeSilentExternalSkillImport: (() => void) | undefined;

configureTrayDefaults({
  toolTip: appName,
  onBeforeAppQuit: () => {
    markAppQuitting();
  },
});

registerLocalMediaPrivilegedSchemes();
registerBootstrapIPC();

async function createWindow() {
  const win = await init({
    config: {
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
      frame: isWin ? false : true,
      titleBarStyle: isMac ? 'hiddenInset' : 'default',
      trafficLightPosition: isMac ? { x: 14, y: 22 } : undefined,
      backgroundColor: '#1a1d23',
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
        const db = await initDatabase();
        appDb = db;

        const startupResult = await runAppStartup(db);
        disposeSilentExternalSkillImport = startupResult.disposeSilentExternalSkillImport;
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

  setupMainWindowReadyBehavior(win, appDb);
  await loadMainWindowContent(win, openDevTools);
  attachMainWindowCloseBehavior(win);
}
createWindow();

app.on('before-quit', () => {
  markAppQuitting();
  disposeSilentExternalSkillImport?.();
  disposeSilentExternalSkillImport = undefined;
  void closeDatabase();
});

export { getMainWindow, setMainWindow };
