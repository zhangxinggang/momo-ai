import { app, BrowserWindow, dialog, shell, type WebContents } from 'electron';

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

function confirmOpenExternal(parent: BrowserWindow | null, url: string): void {
  void dialog
    .showMessageBox(parent ?? undefined, {
      type: 'info',
      title: '打开外部链接',
      message: '是否在系统默认浏览器中打开该链接？',
      detail: url,
      buttons: ['打开', '取消'],
      defaultId: 0,
      cancelId: 1,
    })
    .then((result) => {
      if (result.response === 0) {
        void shell.openExternal(url);
      }
    });
}

/** 为嵌入 webview 注册新窗口/外链打开（Electron 39+ 不再支持 renderer 侧 new-window 事件） */
export function registerWebviewExternalLinkHandlers(): void {
  app.on('web-contents-created', (_event, contents) => {
    if (contents.getType() !== 'webview') {
      return;
    }

    contents.setWindowOpenHandler(({ url }) => {
      const targetUrl = url?.trim();
      if (targetUrl && isExternalHttpUrl(targetUrl)) {
        confirmOpenExternal(resolveHostWindow(contents), targetUrl);
      }
      return { action: 'deny' };
    });
  });
}
