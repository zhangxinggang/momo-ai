import { getElectronApi } from '../electron/api';

export function minimizeWindow(): void {
  getElectronApi()?.minimize?.();
}

export function maximizeWindow(): void {
  getElectronApi()?.maximize?.();
}

export function closeWindow(): void {
  getElectronApi()?.close?.();
}

export async function isWindowFullscreen(): Promise<boolean> {
  return (await getElectronApi()?.isFullscreen?.()) ?? false;
}

/** 订阅主进程触发的关闭确认对话框 */
export function subscribeShowCloseDialog(callback: () => void): () => void {
  const unsubscribe = getElectronApi()?.onShowCloseDialog?.(callback);
  return typeof unsubscribe === 'function' ? unsubscribe : () => {};
}

export function sendCloseDialogCancel(): void {
  getElectronApi()?.sendCloseDialogCancel?.();
}

export function sendCloseDialogResult(action: 'minimize' | 'exit', remember: boolean): void {
  getElectronApi()?.sendCloseDialogResult?.(action, remember);
}
