const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const { before, mock, test } = require('node:test');
const vm = require('node:vm');

let code;
before(async () => {
  const { transformWithEsbuild } = await import('vite');
  const filename = path.join(__dirname, '../../src/main/events/win.ts');
  ({ code } = await transformWithEsbuild(await fs.readFile(filename, 'utf8'), filename, {
    loader: 'ts', format: 'cjs', platform: 'node', target: 'node20',
  }));
});

function createWindowFixture(closeConfirm = true) {
  const app = new EventEmitter();
  const win = new EventEmitter();
  win.webContents = new EventEmitter();
  win.webContents.setWindowOpenHandler = mock.fn();
  let mainWindow = win;
  const closed = mock.fn();
  win.on('closed', closed);
  const close = () => {
    const event = { preventDefault: mock.fn() };
    win.emit('close', event);
    return event;
  };
  app.quit = mock.fn(() => {
    const event = close();
    if (event.preventDefault.mock.callCount() === 0) win.emit('closed');
  });
  const dialog = { showMessageBox: mock.fn(async () => ({ response: 0 })) };
  const dependencies = {
    electron: { app, dialog },
    '../../main-window': {
      getMainWindow: () => mainWindow,
      setMainWindow: (value) => { mainWindow = value; },
    },
    '../../types': { SYSTEM_EVENT: {} },
    '../../utils': { getAppConfig: () => ({ closeConfirm }) },
    '../../utils/constant': { DEFAULT_WINDOW_ATTR: {} },
  };
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports, URL, console: { error: mock.fn() },
    require: (name) => {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected import: ${name}`);
      return dependencies[name];
    },
  });
  module.exports.winEvent({ win });
  return { app, dialog, close, closed, win, getMainWindow: () => mainWindow };
}

const settle = () => new Promise((resolve) => setImmediate(resolve));

test('confirming close lets app.quit close the window without a second dialog', async () => {
  const fixture = createWindowFixture();
  fixture.dialog.showMessageBox.mock.mockImplementationOnce(async () => ({ response: 1 }));
  assert.equal(fixture.close().preventDefault.mock.callCount(), 1);
  await settle();
  assert.equal(fixture.dialog.showMessageBox.mock.callCount(), 1);
  assert.equal(fixture.app.quit.mock.callCount(), 1);
  assert.equal(fixture.closed.mock.callCount(), 1);
  assert.equal(fixture.getMainWindow(), null);
});

test('cancelling close keeps the window and allows a later confirmation', async () => {
  const fixture = createWindowFixture();
  fixture.close();
  await settle();
  assert.equal(fixture.app.quit.mock.callCount(), 0);
  assert.equal(fixture.getMainWindow(), fixture.win);
  fixture.dialog.showMessageBox.mock.mockImplementationOnce(async () => ({ response: 1 }));
  fixture.close();
  await settle();
  assert.equal(fixture.dialog.showMessageBox.mock.callCount(), 2);
  assert.equal(fixture.closed.mock.callCount(), 1);
});

test('repeated close requests share the pending confirmation', async () => {
  const fixture = createWindowFixture();
  let answer;
  fixture.dialog.showMessageBox.mock.mockImplementationOnce(() => new Promise((resolve) => { answer = resolve; }));
  fixture.close();
  assert.equal(fixture.close().preventDefault.mock.callCount(), 1);
  assert.equal(fixture.dialog.showMessageBox.mock.callCount(), 1);
  answer({ response: 0 });
  await settle();
  fixture.close();
  await settle();
  assert.equal(fixture.dialog.showMessageBox.mock.callCount(), 2);
});

test('disabled close confirmation leaves the close event unblocked', () => {
  const fixture = createWindowFixture(false);
  assert.equal(fixture.close().preventDefault.mock.callCount(), 0);
  assert.equal(fixture.dialog.showMessageBox.mock.callCount(), 0);
});

test('quitting from the menu confirms once and then closes the window', async () => {
  const fixture = createWindowFixture();
  fixture.dialog.showMessageBox.mock.mockImplementationOnce(async () => ({ response: 1 }));
  fixture.app.quit();
  await settle();
  assert.equal(fixture.dialog.showMessageBox.mock.callCount(), 1);
  assert.equal(fixture.closed.mock.callCount(), 1);
});

test('a failed dialog resets the pending state and allows another close request', async () => {
  const fixture = createWindowFixture();
  fixture.dialog.showMessageBox.mock.mockImplementationOnce(async () => { throw new Error('Dialog failed'); });
  fixture.close();
  await settle();
  assert.equal(fixture.getMainWindow(), fixture.win);
  fixture.dialog.showMessageBox.mock.mockImplementationOnce(async () => ({ response: 1 }));
  fixture.close();
  await settle();
  assert.equal(fixture.dialog.showMessageBox.mock.callCount(), 2);
  assert.equal(fixture.closed.mock.callCount(), 1);
});
