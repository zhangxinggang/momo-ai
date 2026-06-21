import { getElectronApi } from '../electron/api';

export function setAutoLaunch(enabled: boolean, minimizeOnLaunch?: boolean): void {
  getElectronApi()?.setAutoLaunch?.(enabled, minimizeOnLaunch);
}

export function setMinimizeToTray(enabled: boolean): void {
  getElectronApi()?.setMinimizeToTray?.(enabled);
}

export function setCloseAction(action: 'ask' | 'minimize' | 'exit'): void {
  getElectronApi()?.setCloseAction?.(action);
}

export function setDebugMode(enabled: boolean): void {
  getElectronApi()?.setDebugMode?.(enabled);
}
