/** 获取 preload 暴露的领域 API */
export function getAppApi(): Window['api'] | undefined {
  return typeof window !== 'undefined' ? window.api : undefined;
}

/** 订阅 preload 白名单内主进程事件 */
export function subscribeAppApiEvent(
  channel: string,
  callback: (...args: unknown[]) => void,
): void {
  getAppApi()?.on?.(channel, callback);
}

/** 取消订阅 preload 白名单内主进程事件 */
export function unsubscribeAppApiEvent(
  channel: string,
  callback: (...args: unknown[]) => void,
): void {
  getAppApi()?.off?.(channel, callback);
}
