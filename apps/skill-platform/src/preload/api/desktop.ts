import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { ipcRenderer } from 'electron';

/** 桌面外壳 API：窗口控制、对话框、Shell、通知、数据目录 */
export const desktopApi = {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  toggleVisibility: () => ipcRenderer.send('window:toggleVisibility'),
  enterFullscreen: () => ipcRenderer.send('window:enterFullscreen'),
  exitFullscreen: () => ipcRenderer.send('window:exitFullscreen'),
  toggleFullscreen: () => ipcRenderer.send('window:toggleFullscreen'),
  isFullscreen: () => ipcRenderer.invoke('window:isFullscreen'),
  isVisible: () => ipcRenderer.invoke('window:isVisible'),
  setAutoLaunch: (enabled: boolean, minimizeOnLaunch?: boolean) =>
    ipcRenderer.send('app:setAutoLaunch', enabled, minimizeOnLaunch),
  relaunchApp: () => ipcRenderer.invoke(IPC_CHANNELS.APP_RELAUNCH),
  setDebugMode: (enabled: boolean) => ipcRenderer.send('app:setDebugMode', enabled),
  toggleDevTools: () => ipcRenderer.send('window:toggleDevTools'),
  setMinimizeToTray: (enabled: boolean) => ipcRenderer.send('app:setMinimizeToTray', enabled),
  setCloseAction: (action: 'ask' | 'minimize' | 'exit') =>
    ipcRenderer.send('app:setCloseAction', action),
  onShowCloseDialog: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on('window:showCloseDialog', listener);
    return () => {
      ipcRenderer.removeListener('window:showCloseDialog', listener);
    };
  },
  sendCloseDialogResult: (action: 'minimize' | 'exit', remember: boolean) => {
    ipcRenderer.send('window:closeDialogResult', { action, remember });
  },
  sendCloseDialogCancel: () => {
    ipcRenderer.send('window:closeDialogCancel');
  },
  selectFolder: () => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SELECT_FOLDER),
  selectFolders: () => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SELECT_FOLDERS) as Promise<string[]>,
  pathExists: (targetPath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FS_PATH_EXISTS, targetPath) as Promise<boolean>,
  openPath: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.SHELL_OPEN_PATH, path),
  openExternal: (url: string) => ipcRenderer.invoke(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, url),
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_SHOW, { title, body }),
  getDataPath: () => ipcRenderer.invoke(IPC_CHANNELS.DATA_GET_PATH),
  getDataPathStatus: () => ipcRenderer.invoke(IPC_CHANNELS.DATA_GET_STATUS),
};
