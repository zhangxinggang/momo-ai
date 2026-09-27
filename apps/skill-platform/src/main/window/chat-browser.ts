import type { BrowserWindow } from 'electron';

export const CHAT_BROWSER_PARTITION = 'persist:momo-chat-browser';
export function isBrowserUrl(url: string) {
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}
/** Guest pages have no preload bridge and cannot navigate to local files or privileged protocols. */
export function setupChatBrowser(window: BrowserWindow) {
  window.webContents.on('will-attach-webview', (event, preferences, params) => {
    if (params.partition !== CHAT_BROWSER_PARTITION || !isBrowserUrl(params.src)) {
      event.preventDefault();
      return;
    }
    delete preferences.preload;
    preferences.nodeIntegration = false;
    preferences.contextIsolation = true;
    preferences.sandbox = true;
    preferences.webSecurity = true;
  });
  window.webContents.on('did-attach-webview', (_event, contents) => {
    const preventPrivilegedNavigation = (event: Electron.Event, url: string) => {
      if (!isBrowserUrl(url)) event.preventDefault();
    };
    contents.on('will-navigate', preventPrivilegedNavigation);
    contents.on('will-redirect', preventPrivilegedNavigation);
    contents.setWindowOpenHandler(({ url }) => {
      if (isBrowserUrl(url)) void contents.loadURL(url).catch(() => {});
      return { action: 'deny' };
    });
    contents.session.setPermissionRequestHandler((_contents, _permission, callback) =>
      callback(false),
    );
  });
}
