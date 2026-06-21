import { MAIN_IPC_EVENT_CHANNELS } from '@/types/constants/main-events';
import { ipcRenderer } from 'electron';

const listenerMap = new Map<(...args: any[]) => void, (...args: any[]) => void>();

/** 构建暴露给渲染进程的 api 对象（领域 API + 事件监听） */
export function createPreloadApi<T extends Record<string, unknown>>(domainApis: T) {
  return {
    ...domainApis,
    on: (channel: string, callback: (...args: any[]) => void) => {
      if (!MAIN_IPC_EVENT_CHANNELS.includes(channel as (typeof MAIN_IPC_EVENT_CHANNELS)[number])) {
        console.warn(`Blocked listening to unauthorized channel: ${channel}`);
        return;
      }
      const wrapper = (_event: any, ...args: any[]) => callback(...args);
      listenerMap.set(callback, wrapper);
      ipcRenderer.on(channel, wrapper);
    },
    off: (channel: string, callback: (...args: any[]) => void) => {
      const wrapper = listenerMap.get(callback);
      if (wrapper) {
        ipcRenderer.removeListener(channel, wrapper);
        listenerMap.delete(callback);
      }
    },
  };
}
