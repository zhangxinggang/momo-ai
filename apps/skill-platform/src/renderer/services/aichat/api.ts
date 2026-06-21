import { getAichatIpc } from '../ipc';

export function getAichatApi() {
  return getAichatIpc();
}

export function isAichatApiAvailable(): boolean {
  return !!getAichatIpc();
}

export function requireAichatIpc() {
  const api = getAichatIpc();
  if (!api) {
    throw new Error('当前环境不支持 Aichat IPC');
  }
  return api;
}
