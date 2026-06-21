import { getAiIpc } from '../ipc';

export function getAiApi() {
  return getAiIpc();
}

export function isAiApiAvailable(): boolean {
  return !!getAiIpc();
}
