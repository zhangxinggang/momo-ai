import { getSystemIpc } from '../ipc';

export function getSystemApi() {
  return getSystemIpc();
}

export function isSystemApiAvailable(): boolean {
  return !!getSystemIpc();
}
