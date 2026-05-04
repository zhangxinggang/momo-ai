import { contextBridge, ipcRenderer } from 'electron';

const api = {
  send: (channel: string, data?: unknown) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel: string, callback: (...args: unknown[]) => void) => {
    const handler = (_event: unknown, ...args: unknown[]): void => callback(...args);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  },
  invoke: <T = unknown>(channel: string, ...args: unknown[]): Promise<T> =>
    ipcRenderer.invoke(channel, ...args) as Promise<T>,
};

contextBridge.exposeInMainWorld('electronAPI', api);

export type TApi = typeof api;
