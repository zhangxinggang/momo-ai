import { getWorkspaceIpc } from '../ipc';

export function getWorkspaceApi() {
  return getWorkspaceIpc();
}

export function isWorkspaceApiAvailable(): boolean {
  return !!getWorkspaceIpc();
}
