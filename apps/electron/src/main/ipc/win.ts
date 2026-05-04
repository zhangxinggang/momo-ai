import type { BrowserWindow } from 'electron';
import { app, ipcMain } from 'electron';
import { getMainWindow } from '../../main-window';
import { SYSTEM_EVENT } from '../../types';
import { licenseService } from '../database/service/LicenseService';
import { loadWindowContent } from '../events/page';

export interface IWindowChromeIpcDeps {
  getMinimizeToTray: () => boolean;
  setMinimizeToTray: (value: boolean) => void;
  getCloseAction: () => 'ask' | 'minimize' | 'exit';
  setCloseAction: (value: 'ask' | 'minimize' | 'exit') => void;
  getPendingCloseAction: () => boolean;
  setPendingCloseAction: (value: boolean) => void;
  getIsQuitting: () => boolean;
  setIsQuitting: (value: boolean) => void;
  getIsDebugMode: () => boolean;
  setIsDebugMode: (value: boolean) => void;
  createTray: () => void;
  destroyTray: () => void;
  toggleWindowForShowApp: (win: BrowserWindow) => void;
  scheduleAppRelaunch: (delayMs?: number) => void;
}

/** 授权页：写入授权码、进入主应用 */
export function registerLicenseIpc(): void {
  ipcMain.handle('license:save', async (_event, authCode: unknown) => {
    if (typeof authCode !== 'string' || !authCode.trim()) {
      return { ok: false, message: '授权码无效' };
    }
    if (!licenseService.isAuthCodeValid(authCode)) {
      return { ok: false, message: '授权码校验失败' };
    }
    try {
      await licenseService.saveLicenseRecord(authCode);
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : '保存授权失败';
      return { ok: false, message };
    }
  });

  ipcMain.handle('license:enter-app', async () => {
    const win = getMainWindow();
    if (!win) {
      return { ok: false, message: '主窗口不存在' };
    }
    await loadWindowContent(win);
    return { ok: true };
  });
}

/**
 * 注册主进程窗口与应用外壳相关的 ipcMain.on / 部分 handle
 * （原 index.ts 顶层注册，集中到此文件）
 */
export function registerWindowChromeIpc(deps: IWindowChromeIpcDeps): void {
  ipcMain.on(SYSTEM_EVENT.WINDOW_MINIMIZE, () => {
    getMainWindow()?.minimize();
  });

  ipcMain.on(SYSTEM_EVENT.WINDOW_MAXIMIZE, () => {
    const w = getMainWindow();
    if (w?.isMaximized()) {
      w.unmaximize();
    } else {
      w?.maximize();
    }
  });

  ipcMain.on('window:close', () => {
    getMainWindow()?.close();
  });

  ipcMain.on('window:enterFullscreen', () => {
    getMainWindow()?.setFullScreen(true);
  });

  ipcMain.on('window:exitFullscreen', () => {
    getMainWindow()?.setFullScreen(false);
  });

  ipcMain.handle('window:isFullscreen', () => {
    return getMainWindow()?.isFullScreen() ?? false;
  });

  ipcMain.handle('window:isVisible', () => {
    return getMainWindow()?.isVisible() ?? false;
  });

  ipcMain.on('window:toggleVisibility', () => {
    const w = getMainWindow();
    if (w) {
      deps.toggleWindowForShowApp(w);
    }
  });

  ipcMain.on('window:toggleFullscreen', () => {
    const w = getMainWindow();
    if (w) {
      w.setFullScreen(!w.isFullScreen());
    }
  });

  ipcMain.on('app:setAutoLaunch', (_event, enabled: boolean, minimizeOnLaunch?: boolean) => {
    if (typeof enabled !== 'boolean') {
      console.error('app:setAutoLaunch requires enabled to be a boolean');
      return;
    }
    app.setLoginItemSettings({
      openAtLogin: enabled,
      openAsHidden: enabled && minimizeOnLaunch === true,
    });
  });

  ipcMain.handle(SYSTEM_EVENT.APP_RELAUNCH, () => {
    deps.scheduleAppRelaunch();
    return { success: true };
  });

  ipcMain.on('app:setMinimizeToTray', (_event, enabled: boolean) => {
    deps.setMinimizeToTray(enabled);
    if (enabled) {
      deps.createTray();
    } else {
      deps.destroyTray();
    }
  });

  ipcMain.on('app:setCloseAction', (_event, action: 'ask' | 'minimize' | 'exit') => {
    if (action !== 'ask' && action !== 'minimize' && action !== 'exit') {
      console.error("app:setCloseAction requires action to be 'ask', 'minimize', or 'exit'");
      return;
    }
    deps.setCloseAction(action);
    if (action === 'minimize' && process.platform === 'win32') {
      deps.createTray();
    }
  });

  ipcMain.on('app:setDebugMode', (_event, enabled: boolean) => {
    deps.setIsDebugMode(enabled);
  });

  ipcMain.on('window:toggleDevTools', () => {
    getMainWindow()?.webContents.toggleDevTools();
  });

  ipcMain.on(
    'window:closeDialogResult',
    (_event, data: { action: 'minimize' | 'exit'; remember: boolean }) => {
      if (!data || typeof data !== 'object') {
        console.error('window:closeDialogResult requires a non-null data object');
        deps.setPendingCloseAction(false);
        return;
      }
      if (data.action !== 'minimize' && data.action !== 'exit') {
        console.error("window:closeDialogResult requires action to be 'minimize' or 'exit'");
        deps.setPendingCloseAction(false);
        return;
      }
      deps.setPendingCloseAction(false);

      if (data.remember) {
        deps.setCloseAction(data.action);
      }

      if (data.action === 'minimize') {
        getMainWindow()?.hide();
        deps.createTray();
      } else {
        deps.setIsQuitting(true);
        getMainWindow()?.close();
      }
    },
  );

  ipcMain.on('window:closeDialogCancel', () => {
    deps.setPendingCloseAction(false);
  });
}
