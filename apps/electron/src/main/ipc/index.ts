import { ipcMain } from 'electron';

import { registerLicenseIpc } from './win';

export { registerLicenseIpc, registerWindowChromeIpc } from './win';
export type { IWindowChromeIpcDeps } from './win';

/** 注册主进程 IPC（授权、遗留库操作等） */
export function registerIpcHandlers(): void {
  registerLicenseIpc();

  ipcMain.handle('delete-library', (_event, id: number) => {
    return 0;
  });

  ipcMain.handle('clear-all-data', (event) => {
    event.sender.send('comics-updated');
  });
}
