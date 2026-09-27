import { expect, it, vi } from 'vitest';
import { CHAT_BROWSER_PARTITION, setupChatBrowser } from './chat-browser';
it('attaches only HTTP browser guests and removes access to the host bridge', () => {
  const handlers = new Map<string, Function>();
  setupChatBrowser({
    webContents: { on: (type: string, handler: Function) => handlers.set(type, handler) },
  } as never);
  const event = { preventDefault: vi.fn() };
  const prefs = { preload: 'privileged.js', nodeIntegration: true };
  handlers.get('will-attach-webview')!(event, prefs, {
    src: 'https://example.com',
    partition: CHAT_BROWSER_PARTITION,
  });
  expect(event.preventDefault).not.toHaveBeenCalled();
  expect(prefs).toMatchObject({
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    webSecurity: true,
  });
  expect(prefs).not.toHaveProperty('preload');
  handlers.get('will-attach-webview')!(
    event,
    {},
    { src: 'file:///C:/secret.txt', partition: CHAT_BROWSER_PARTITION },
  );
  handlers.get('will-attach-webview')!(
    event,
    {},
    { src: 'https://example.com', partition: 'other' },
  );
  expect(event.preventDefault).toHaveBeenCalledTimes(2);
});
it('keeps popup links in the browser and denies privileged navigation', () => {
  const handlers = new Map<string, Function>();
  const guestHandlers = new Map<string, Function>();
  setupChatBrowser({
    webContents: { on: (type: string, handler: Function) => handlers.set(type, handler) },
  } as never);
  const guest = {
    on: (type: string, handler: Function) => guestHandlers.set(type, handler),
    loadURL: vi.fn().mockResolvedValue(undefined),
    setWindowOpenHandler: vi.fn(),
    session: { setPermissionRequestHandler: vi.fn() },
  };
  handlers.get('did-attach-webview')!({}, guest);
  const open = guest.setWindowOpenHandler.mock.calls[0][0];
  expect(open({ url: 'https://example.com/next' })).toEqual({ action: 'deny' });
  expect(guest.loadURL).toHaveBeenCalledWith('https://example.com/next');
  open({ url: 'javascript:alert(1)' });
  expect(guest.loadURL).toHaveBeenCalledTimes(1);
  const event = { preventDefault: vi.fn() };
  guestHandlers.get('will-navigate')!(event, 'file:///secret');
  expect(event.preventDefault).toHaveBeenCalledTimes(1);
});
