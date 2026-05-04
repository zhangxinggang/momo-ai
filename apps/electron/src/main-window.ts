import type { BrowserWindow } from 'electron';

/** 主窗口引用，与基座 init 完成后持有的窗口一致 */
let mainWindow: BrowserWindow | null = null;

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function setMainWindow(win: BrowserWindow | null): void {
  mainWindow = win;
}
