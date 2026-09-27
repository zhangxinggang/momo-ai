import type { IWebPageContext } from '@/types/modules/webpage';
import { randomUUID } from 'node:crypto';
import { getHttpUrl, READ_WEB_PAGE_SCRIPT } from './webpage-content';

/** 独立沙箱窗口加载链接，读取渲染后正文；不暴露宿主 API 或沿用用户登录态。 */
export async function fetchWebPage(url: string, signal: AbortSignal): Promise<IWebPageContext> {
  const target = getHttpUrl(url).href;
  signal.throwIfAborted();
  const { BrowserWindow, session } = await import('electron');
  signal.throwIfAborted();
  const isolatedSession = session.fromPartition(`momo-web-fetch-${randomUUID()}`);
  isolatedSession.setPermissionRequestHandler((_contents, _permission, callback) =>
    callback(false),
  );
  isolatedSession.setPermissionCheckHandler(() => false);
  isolatedSession.on('will-download', (event, item) => {
    event.preventDefault();
    item.cancel();
  });
  const window = new BrowserWindow({
    show: false,
    width: 1280,
    height: 900,
    webPreferences: {
      session: isolatedSession,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  let timer: ReturnType<typeof setTimeout> | undefined;
  let abort: () => void = () => {};
  const interrupted = new Promise<never>((_resolve, reject) => {
    abort = () => reject(signal.reason ?? new Error('网页抓取已取消'));
    signal.addEventListener('abort', abort, { once: true });
    timer = setTimeout(() => reject(new Error('抓取网页超时，请稍后重试')), 20000);
    const guardNavigation = (event: Electron.Event, destination: string) => {
      try {
        getHttpUrl(destination);
      } catch (error) {
        event.preventDefault();
        reject(error);
      }
    };
    window.webContents.on('will-navigate', guardNavigation);
    window.webContents.on('will-redirect', guardNavigation);
    window.webContents.on('did-navigate', (_event, _url, status) => {
      if (status >= 400) reject(new Error(`抓取网页失败（HTTP ${status}）`));
    });
    window.webContents.once('render-process-gone', () => reject(new Error('网页加载进程已退出')));
  });
  try {
    signal.throwIfAborted();
    const page = await Promise.race([
      window.loadURL(target).then(async () => {
        return window.webContents.executeJavaScript(
          READ_WEB_PAGE_SCRIPT,
        ) as Promise<IWebPageContext>;
      }),
      interrupted,
    ]);
    getHttpUrl(page.url);
    if (!page.content?.trim()) throw new Error('该链接没有可读取的网页正文');
    return page;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', abort);
    if (!window.isDestroyed()) window.destroy();
    await isolatedSession.closeAllConnections().catch(() => {});
  }
}
