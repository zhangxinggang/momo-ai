import type { IRuntimeConfig } from '@momo/server';
import type { BrowserWindowConstructorOptions } from 'electron';
import { app, BrowserWindow, dialog } from 'electron';
import { join } from 'path';
import { getMainWindow, setMainWindow } from '../main-window';
import { getAppConfig, getSystemLogo, isMac } from '../utils';
import { loadWindowContent } from './events/page';
import { winEvent } from './events/win';
import { registerIpcHandlers } from './ipc';
import startServer from './server';
import { buildMenu } from './system/menu';

const appConf = getAppConfig();
const { openDevTools, browserWindow = {} } = appConf;

interface ICreateShellWindowOptions {
  config?: BrowserWindowConstructorOptions;
}

async function createWindow({ config = {} }: ICreateShellWindowOptions): Promise<BrowserWindow> {
  const getWebPreferences = () => {
    const fromConfig = config.webPreferences ?? {};
    return {
      preload: join(__dirname, '../preload/index.cjs'),
      sandbox: false,
      webSecurity: false,
      ...fromConfig,
    };
  };
  const { ico } = getSystemLogo();
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'ELE',
    icon: ico,
    webPreferences: getWebPreferences(),
    ...config,
    ...browserWindow,
  });
  setMainWindow(win);
  winEvent({ win });
  await loadWindowContent(win);
  if (openDevTools) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
  return win;
}

/** 壳入口 init 参数（与包入口 re-export） */
export interface IElectronShellInitOptions {
  config?: BrowserWindowConstructorOptions;
  serverConfig?: IRuntimeConfig;
  onAppReady?: () => void | Promise<void>;
}

function init({
  config,
  serverConfig,
  onAppReady,
}: IElectronShellInitOptions): Promise<BrowserWindow | null> {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
  } else {
    app.on('second-instance', () => {
      const focused = BrowserWindow.getFocusedWindow();
      if (focused) {
        if (focused.isMinimized()) focused.restore();
        focused.focus();
        return;
      }
      const first = getMainWindow();
      if (!first) return;
      if (first.isMinimized()) first.restore();
      first.focus();
    });
  }
  return new Promise<BrowserWindow | null>((resolve) => {
    app.commandLine.appendSwitch('lang', 'zh-CN');
    const appWhenReady = async () => {
      if (!gotTheLock) {
        app.quit();
        resolve(null);
        return;
      }
      await startServer(serverConfig);
      registerIpcHandlers();
      buildMenu();
      const win = await createWindow({ config });
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          void createWindow({ config });
        }
      });
      await onAppReady?.();
      resolve(win);
    };
    app.whenReady().then(() => {
      void appWhenReady().catch((error) => {
        console.error('Failed to initialize app:', error);
        dialog.showErrorBox(
          '启动错误',
          `应用启动时发生错误：\n\n${error instanceof Error ? error.message : String(error)}\n\n堆栈：\n${error instanceof Error ? error.stack : ''}`,
        );
        app.quit();
      });
    });
    app.on('window-all-closed', () => {
      if (!isMac) app.quit();
    });
  });
}

export default init;
