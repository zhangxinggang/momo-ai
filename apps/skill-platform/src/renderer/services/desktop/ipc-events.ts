import type { TMainIpcEventChannel } from '@/types/constants/main-events';

import { subscribeAppApiEvent, unsubscribeAppApiEvent } from '../app-api';

/** 订阅主进程事件（经 preload 白名单校验） */
export function subscribeMainEvent(
  channel: TMainIpcEventChannel,
  callback: (...args: unknown[]) => void,
): void {
  subscribeAppApiEvent(channel, callback);
}

/** 取消订阅主进程事件 */
export function unsubscribeMainEvent(
  channel: TMainIpcEventChannel,
  callback: (...args: unknown[]) => void,
): void {
  unsubscribeAppApiEvent(channel, callback);
}

/** 订阅 OS 全屏状态变化 */
export function subscribeFullscreenChanged(callback: (isFullscreen: boolean) => void): () => void {
  subscribeMainEvent('window:fullscreen-changed', callback as (...args: unknown[]) => void);
  return () =>
    unsubscribeMainEvent('window:fullscreen-changed', callback as (...args: unknown[]) => void);
}
