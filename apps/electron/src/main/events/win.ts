import { app, BrowserWindow, dialog, type WebContents } from 'electron';
import { getMainWindow, setMainWindow } from '../../main-window';
import { SYSTEM_EVENT } from '../../types';
import { getAppConfig, getSystemLogo } from '../../utils';

const appConf = getAppConfig();
const { openDevTools, closeConfirm } = appConf;
const { ico } = getSystemLogo();

const toolBrowserWindows = new Set<BrowserWindow>();

function isExternalHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function resolveHostWindow(contents: WebContents): BrowserWindow | null {
  const host = contents.hostWebContents;
  if (host && !host.isDestroyed()) {
    return BrowserWindow.fromWebContents(host);
  }
  return BrowserWindow.fromWebContents(contents);
}

function buildLoadErrorDataUrl(url: string): string {
  const safeUrl = url.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>页面加载失败</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, sans-serif;
      background: #1a1d23;
      color: #e5e7eb;
    }
    .panel { max-width: 32rem; padding: 1.5rem; text-align: center; }
    h1 { margin: 0 0 0.75rem; font-size: 1.125rem; }
    p { margin: 0; font-size: 0.875rem; color: #9ca3af; word-break: break-all; }
  </style>
</head>
<body>
  <div class="panel">
    <h1>页面加载失败</h1>
    <p>${safeUrl}</p>
  </div>
</body>
</html>`;
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

function shouldOpenLinkInChildWindow(contents: WebContents, targetUrl: string): boolean {
  const currentUrl = contents.getURL();
  if (!currentUrl || currentUrl === 'about:blank') {
    return false;
  }
  if (targetUrl === currentUrl) {
    return false;
  }
  try {
    const current = new URL(currentUrl);
    const target = new URL(targetUrl);
    // 仅 hash 锚点跳转仍留在当前页
    if (
      current.origin === target.origin &&
      current.pathname === target.pathname &&
      current.search === target.search
    ) {
      return false;
    }
  } catch {
    return true;
  }
  return true;
}

function isMainAppNavigationUrl(url: string): boolean {
  if (
    url.startsWith('file://') ||
    url.startsWith('devtools://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('local-image://') ||
    url.startsWith('local-video://')
  ) {
    return true;
  }
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function attachEmbeddedBrowsingLinkHandlers(
  contents: WebContents,
  parentWindow?: BrowserWindow | null,
): void {
  const resolveParent = () => {
    if (parentWindow && !parentWindow.isDestroyed()) {
      return parentWindow;
    }
    return resolveHostWindow(contents);
  };

  contents.setWindowOpenHandler(({ url }) => {
    const targetUrl = url?.trim();
    if (targetUrl && isExternalHttpUrl(targetUrl)) {
      openToolBrowserWindow(targetUrl, resolveParent());
    }
    return { action: 'deny' };
  });

  contents.on('will-navigate', (event, url) => {
    const targetUrl = url?.trim();
    if (!targetUrl || !isExternalHttpUrl(targetUrl)) {
      return;
    }
    // 首次加载或重定向过程中不拦截，避免 ERR_ABORTED
    if (contents.isLoading()) {
      return;
    }
    if (!shouldOpenLinkInChildWindow(contents, targetUrl)) {
      return;
    }
    event.preventDefault();
    openToolBrowserWindow(targetUrl, resolveParent());
  });
}

/** 在独立 BrowserWindow（新渲染进程）中打开链接 */
function openToolBrowserWindow(url: string, parent?: BrowserWindow | null): void {
  const targetUrl = url.trim();
  if (!isExternalHttpUrl(targetUrl)) {
    return;
  }

  const parentWindow = parent && !parent.isDestroyed() ? parent : (getMainWindow() ?? undefined);

  const win = new BrowserWindow({
    width: 1024,
    height: 720,
    minWidth: 480,
    minHeight: 360,
    frame: true,
    backgroundColor: '#1a1d23',
    ...(ico ? { icon: ico } : {}),
    ...(parentWindow ? { parent: parentWindow } : {}),
    show: false,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  toolBrowserWindows.add(win);
  attachEmbeddedBrowsingLinkHandlers(win.webContents, win);

  win.once('ready-to-show', () => {
    if (!win.isDestroyed()) {
      win.show();
    }
  });

  win.on('closed', () => {
    toolBrowserWindows.delete(win);
  });

  win.webContents.on('page-title-updated', (_event, title) => {
    if (title && !win.isDestroyed()) {
      win.setTitle(title);
    }
  });

  void win.loadURL(targetUrl).catch(() => {
    if (!win.isDestroyed()) {
      void win.loadURL(buildLoadErrorDataUrl(targetUrl));
    }
  });
}

/** 主窗口：外部 http(s) 链接统一在工具子窗口打开 */
function registerMainWindowBrowsingLinkHandlers(win: BrowserWindow): void {
  const contents = win.webContents;

  contents.setWindowOpenHandler(({ url }) => {
    const targetUrl = url?.trim();
    if (targetUrl && isExternalHttpUrl(targetUrl)) {
      openToolBrowserWindow(targetUrl, win);
    }
    return { action: 'deny' };
  });

  contents.on('will-navigate', (event, url) => {
    const targetUrl = url?.trim();
    if (!targetUrl || !isExternalHttpUrl(targetUrl)) {
      return;
    }
    if (isMainAppNavigationUrl(targetUrl)) {
      return;
    }
    event.preventDefault();
    openToolBrowserWindow(targetUrl, win);
  });
}

/** 为嵌入 webview 注册新窗口/页面链接打开（Electron 39+ 不再支持 renderer 侧 new-window 事件） */
function registerWebviewExternalLinkHandlers(): void {
  app.on('web-contents-created', (_event, contents) => {
    if (contents.getType() !== 'webview') {
      return;
    }
    attachEmbeddedBrowsingLinkHandlers(contents);
  });
}

let isWebviewLinkHandlersRegistered = false;

function ensureWebviewExternalLinkHandlers(): void {
  if (isWebviewLinkHandlersRegistered) {
    return;
  }
  isWebviewLinkHandlersRegistered = true;
  registerWebviewExternalLinkHandlers();
}

const winEvent = ({ win }: { win: BrowserWindow }) => {
  ensureWebviewExternalLinkHandlers();

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

  registerMainWindowBrowsingLinkHandlers(win);
};

export { winEvent };
