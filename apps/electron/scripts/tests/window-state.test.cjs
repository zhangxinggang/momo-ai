const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { before, mock, test } = require('node:test');
const vm = require('node:vm');

let code;
before(async () => {
  const { transformWithEsbuild } = await import('vite');
  const filename = path.join(__dirname, '../../src/main/ipc/win.ts');
  ({ code } = await transformWithEsbuild(await fs.readFile(filename, 'utf8'), filename, {
    loader: 'ts',
    format: 'cjs',
    platform: 'node',
    target: 'node20',
  }));
});

function createWindowStateFixture({ fullscreen = false, maximized = false } = {}) {
  const listeners = new Map();
  const handlers = new Map();
  const win = {
    isFullScreen: mock.fn(() => fullscreen),
    setFullScreen: mock.fn((value) => {
      fullscreen = value;
    }),
    isMaximized: mock.fn(() => maximized),
    maximize: mock.fn(() => {
      maximized = true;
    }),
    unmaximize: mock.fn(() => {
      maximized = false;
    }),
    minimize: mock.fn(),
    close: mock.fn(),
    hide: mock.fn(),
    webContents: { toggleDevTools: mock.fn() },
  };
  const ipcMain = {
    on: mock.fn((channel, listener) => listeners.set(channel, listener)),
    handle: mock.fn((channel, handler) => handlers.set(channel, handler)),
  };
  const dependencies = {
    electron: {
      app: {
        setLoginItemSettings: mock.fn(),
        relaunch: mock.fn(),
        quit: mock.fn(),
      },
      ipcMain,
    },
    '../../main-window': { getMainWindow: () => win },
    '../../types': {
      SYSTEM_EVENT: {
        APP_RELAUNCH: 'app:relaunch',
        WINDOW_MAXIMIZE: 'window:maximize',
        WINDOW_MINIMIZE: 'window:minimize',
      },
    },
    '../database/service/LicenseService': {
      licenseService: { isAuthCodeValid: mock.fn(), saveLicenseRecord: mock.fn() },
    },
    '../events/page': { loadWindowContent: mock.fn() },
  };
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    console,
    process,
    setTimeout,
    require: (name) => {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected import: ${name}`);
      return dependencies[name];
    },
  });
  module.exports.registerWindowChromeIpc({
    getMinimizeToTray: () => false,
    setMinimizeToTray: mock.fn(),
    getCloseAction: () => 'ask',
    setCloseAction: mock.fn(),
    getPendingCloseAction: () => false,
    setPendingCloseAction: mock.fn(),
    getIsQuitting: () => false,
    setIsQuitting: mock.fn(),
    getIsDebugMode: () => false,
    setIsDebugMode: mock.fn(),
    createTray: mock.fn(),
    destroyTray: mock.fn(),
    toggleWindowForShowApp: mock.fn(),
    scheduleAppRelaunch: mock.fn(),
  });
  return { handlers, listeners, win };
}

test('maximize control exits fullscreen instead of trying to maximize', () => {
  const fixture = createWindowStateFixture({ fullscreen: true });

  fixture.listeners.get('window:maximize')();

  assert.equal(fixture.win.setFullScreen.mock.calls[0].arguments[0], false);
  assert.equal(fixture.win.maximize.mock.callCount(), 0);
  assert.equal(fixture.win.unmaximize.mock.callCount(), 0);
});

test('maximize control toggles native maximize state outside fullscreen', () => {
  const normal = createWindowStateFixture();
  normal.listeners.get('window:maximize')();
  assert.equal(normal.win.maximize.mock.callCount(), 1);

  const maximized = createWindowStateFixture({ maximized: true });
  maximized.listeners.get('window:maximize')();
  assert.equal(maximized.win.unmaximize.mock.callCount(), 1);
});

test('renderer can query the initial maximized state', () => {
  const fixture = createWindowStateFixture({ maximized: true });
  assert.equal(fixture.handlers.get('window:isMaximized')(), true);
});
