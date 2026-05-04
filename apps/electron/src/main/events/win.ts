import { app, dialog, shell } from 'electron';
import { getMainWindow, setMainWindow } from '../../main-window';
import { SYSTEM_EVENT } from '../../types';
import { getAppConfig } from '../../utils';

function isExternalHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isAppNavigationUrl(url: string): boolean {
  return (
    url.startsWith('file://') ||
    url.startsWith('devtools://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('local-image://') ||
    url.startsWith('local-video://')
  );
}
const appConf = getAppConfig();
const { openDevTools, closeConfirm } = appConf;

const winEvent = ({ win }) => {
  win.on('close', async (event) => {
    if (!closeConfirm) return;
    event?.preventDefault();
    const result = await dialog.showMessageBox(win, {
      type: 'question',
      buttons: ['取消', '确认关闭'],
      defaultId: 0,
      cancelId: 0,
      title: '确认关闭',
      message: '确定要关闭吗?',
    });
    if (result.response === 1) {
      setMainWindow(null);
      app.quit();
    }
  });
  win.on('closed', () => {
    setMainWindow(null);
  });
  win.on('enter-full-screen', () => {
    if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
      win.webContents.send(SYSTEM_EVENT.FULL_SCREEN_CHANGED, true);
    }
  });
  win.on('leave-full-screen', () => {
    if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
      win.webContents.send(SYSTEM_EVENT.FULL_SCREEN_CHANGED, false);
    }
  });

  win.webContents.on('before-input-event', (event, input) => {
    // Check for DevTools shortcuts: F12, Ctrl+Shift+I, Cmd+Option+I
    // 检查是否为开发者工具快捷键
    const isDevToolsShortcut =
      input.key === 'F12' ||
      (input.control && input.shift && input.key.toLowerCase() === 'i') ||
      (input.meta && input.alt && input.key.toLowerCase() === 'i');

    if (isDevToolsShortcut) {
      // 调试模式已启用：主动打开/关闭开发者工具
      getMainWindow()?.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  if (openDevTools) {
    win.webContents.openDevTools({ mode: 'right' });
  }

  // 外部链接：在系统浏览器打开，禁止应用内新开全屏窗口
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternalHttpUrl(url)) {
      void dialog
        .showMessageBox(win, {
          type: 'info',
          title: '打开外部链接',
          message: '将在系统默认浏览器中打开该链接，便于预览与关闭。',
          buttons: ['在浏览器中打开', '取消'],
          defaultId: 0,
          cancelId: 1,
        })
        .then((result) => {
          if (result.response === 0) {
            void shell.openExternal(url);
          }
        });
    }
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (isAppNavigationUrl(url)) {
      return;
    }
    if (!isExternalHttpUrl(url)) {
      return;
    }
    event.preventDefault();
    void dialog
      .showMessageBox(win, {
        type: 'info',
        title: '打开外部链接',
        message: '应用内不支持直接浏览外部网页。请在系统浏览器中打开链接。',
        buttons: ['在浏览器中打开', '取消'],
        defaultId: 0,
        cancelId: 1,
      })
      .then((result) => {
        if (result.response === 0) {
          void shell.openExternal(url);
        }
      });
  });
};

export { winEvent };
