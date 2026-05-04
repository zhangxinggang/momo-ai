import type { BrowserWindow } from 'electron';
import type { IElectronShellInitOptions } from './main';

export type { IElectronShellInitOptions };

export async function init(options: IElectronShellInitOptions): Promise<BrowserWindow | null> {
  const { default: runInit } = await import('./main');
  return runInit(options);
}
export { getMainWindow, setMainWindow } from './main-window';
export * from './main/database';
export {
  attachWindowCloseTrayBehavior,
  configureTrayDefaults,
  createTray,
  destroyTray,
} from './main/events/tray';
export type { IAttachWindowCloseTrayBehaviorOptions, ICreateTrayOptions } from './main/events/tray';
export * from './main/ipc';
export * from './utils';
