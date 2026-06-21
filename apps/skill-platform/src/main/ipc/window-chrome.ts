import { createTray, destroyTray, getMainWindow, registerWindowChromeIpc } from '@momo/electron';
import type { BrowserWindow } from 'electron';
import { app } from 'electron';

type ShowAppWindowLike = Pick<
  BrowserWindow,
  'isMinimized' | 'restore' | 'isVisible' | 'show' | 'hide' | 'focus'
>;

let minimizeToTray = false;
let isQuitting = false;
let closeAction: 'ask' | 'minimize' | 'exit' = 'ask';
let pendingCloseAction = false;
let isDebugMode = false;

export function getIsQuitting(): boolean {
  return isQuitting;
}

export function setIsQuitting(value: boolean): void {
  isQuitting = value;
}

export function markAppQuitting(): void {
  isQuitting = true;
}

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

export function emitWindowVisibility(isVisible: boolean): void {
  const w = getMainWindow();
  if (w && !w.isDestroyed() && !w.webContents.isDestroyed()) {
    w.webContents.send('window:visibility-changed', isVisible);
  }
}

export function attachWindowVisibilityListeners(win: BrowserWindow): void {
  win.on('show', () => emitWindowVisibility(true));
  win.on('hide', () => emitWindowVisibility(false));
  win.on('minimize', () => emitWindowVisibility(false));
  win.on('restore', () => emitWindowVisibility(true));
}

export interface IWindowCloseTrayBehaviorOptions {
  getIsQuitting: () => boolean;
  getCloseAction: () => 'ask' | 'minimize' | 'exit';
  getPendingCloseAction: () => boolean;
  setPendingCloseAction: (value: boolean) => void;
  getMinimizeToTray: () => boolean;
  notifyShowCloseDialog: (win: BrowserWindow) => void;
}

export function getWindowCloseTrayBehaviorOptions(): IWindowCloseTrayBehaviorOptions {
  return {
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
  };
}

/** 注册窗口与应用外壳相关 IPC */
export function registerWindowChromeIPC(): void {
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
}
