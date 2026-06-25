import {
  attachWindowCloseTrayBehavior,
  createTray,
  isDev,
  loadWindowContent,
} from '@momo/electron';
import type { Database } from 'better-sqlite3';
import type { BrowserWindow } from 'electron';
import { getMinimizeOnLaunchSetting } from '../ipc/settings';
import {
  attachWindowVisibilityListeners,
  emitWindowVisibility,
  getWindowCloseTrayBehaviorOptions,
} from '../ipc/window-chrome';

/** 窗口 ready-to-show 时根据设置决定显示或最小化到托盘 */
export function setupMainWindowReadyBehavior(win: BrowserWindow, appDb: Database | null): void {
  win.once('ready-to-show', () => {
    if (!appDb) {
      win.show();
      emitWindowVisibility(true);
      return;
    }

    const shouldMinimize = getMinimizeOnLaunchSetting(appDb);
    if (shouldMinimize) {
      createTray();
      emitWindowVisibility(false);
    } else {
      win.show();
      emitWindowVisibility(true);
    }
  });

  attachWindowVisibilityListeners(win);
}

/** 加载开发服务器或生产构建页面 */
export async function loadMainWindowContent(win: BrowserWindow): Promise<void> {
  let url = '';
  if (isDev) {
    url = 'http://localhost:5173';
  }
  await loadWindowContent(win, url);
}

/** 挂载窗口关闭行为（最小化到托盘 / 退出） */
export function attachMainWindowCloseBehavior(win: BrowserWindow): void {
  attachWindowCloseTrayBehavior(win, getWindowCloseTrayBehaviorOptions());
}
