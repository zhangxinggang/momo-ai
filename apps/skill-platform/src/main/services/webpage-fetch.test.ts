import { EventEmitter } from 'node:events';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fetchWebPage } from './webpage-fetch';

const mocks = vi.hoisted(() => ({
  window: undefined as any,
  options: undefined as any,
  fromPartition: vi.fn(),
}));
vi.mock('electron', () => ({
  BrowserWindow: class {
    constructor(options: unknown) {
      mocks.options = options;
      return mocks.window;
    }
  },
  session: { fromPartition: mocks.fromPartition },
}));
let isolatedSession: any;
beforeEach(() => {
  vi.useFakeTimers();
  isolatedSession = Object.assign(new EventEmitter(), {
    setPermissionRequestHandler: vi.fn(),
    setPermissionCheckHandler: vi.fn(),
    closeAllConnections: vi.fn().mockResolvedValue(undefined),
  });
  mocks.fromPartition.mockReset().mockReturnValue(isolatedSession);
  mocks.options = undefined;
  mocks.window = {
    loadURL: vi.fn().mockResolvedValue(undefined),
    isDestroyed: vi.fn().mockReturnValue(false),
    destroy: vi.fn(),
    webContents: Object.assign(new EventEmitter(), {
      setWindowOpenHandler: vi.fn(),
      executeJavaScript: vi.fn().mockResolvedValue({
        url: 'https://example.com/final',
        title: '文章',
        content: '渲染后正文',
        truncated: false,
      }),
    }),
  };
});
afterEach(() => {
  vi.useRealTimers();
});

it('extracts rendered content in a hidden isolated sandbox, follows HTTP redirects and closes it', async () => {
  const page = await fetchWebPage('https://example.com/start', new AbortController().signal);
  expect(page).toMatchObject({ url: 'https://example.com/final', content: '渲染后正文' });
  expect(mocks.options).toMatchObject({
    show: false,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      session: isolatedSession,
    },
  });
  expect(mocks.options.webPreferences.preload).toBeUndefined();
  expect(mocks.fromPartition).toHaveBeenCalledWith(expect.stringMatching(/^momo-web-fetch-/));
  expect(mocks.window.destroy).toHaveBeenCalledOnce();
  expect(isolatedSession.closeAllConnections).toHaveBeenCalledOnce();
});

it('rejects non-HTTP links before launching a window and blocks redirects to local files', async () => {
  await expect(fetchWebPage('file:///secret.txt', new AbortController().signal)).rejects.toThrow(
    'HTTP',
  );
  expect(mocks.options).toBeUndefined();
  const event = { preventDefault: vi.fn() };
  mocks.window.loadURL.mockImplementation(async () =>
    mocks.window.webContents.emit('will-redirect', event, 'file:///secret.txt'),
  );
  await expect(
    fetchWebPage('https://example.com/start', new AbortController().signal),
  ).rejects.toThrow('HTTP');
  expect(event.preventDefault).toHaveBeenCalledOnce();
  expect(mocks.window.destroy).toHaveBeenCalledOnce();
});

it.each(['cancel', 'timeout', 'http-error', 'empty', 'load-error'])(
  'cleans up a failed fetch: %s',
  async (failure) => {
    const controller = new AbortController();
    if (failure === 'empty')
      mocks.window.webContents.executeJavaScript.mockResolvedValue({
        url: 'https://example.com',
        content: '',
      });
    else if (failure === 'http-error')
      mocks.window.loadURL.mockImplementation(async () =>
        mocks.window.webContents.emit('did-navigate', {}, 'https://example.com', 404),
      );
    else if (failure === 'load-error')
      mocks.window.loadURL.mockRejectedValue(new Error('加载失败'));
    else mocks.window.loadURL.mockReturnValue(new Promise(() => {}));
    const pending = fetchWebPage('https://example.com', controller.signal);
    const rejected = expect(pending).rejects.toThrow();
    if (failure === 'cancel' || failure === 'timeout')
      await vi.waitFor(() => expect(mocks.window.loadURL).toHaveBeenCalled(), { interval: 1 });
    if (failure === 'cancel') controller.abort(new Error('已取消'));
    if (failure === 'timeout') await vi.advanceTimersByTimeAsync(20000);
    await rejected;
    expect(mocks.window.destroy).toHaveBeenCalledOnce();
    expect(isolatedSession.closeAllConnections).toHaveBeenCalledOnce();
  },
);
