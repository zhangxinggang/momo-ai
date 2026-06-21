import { getWorkflowAgentIpc } from '../ipc';

export function getWorkflowAgentApi() {
  return getWorkflowAgentIpc();
}

export function isWorkflowAgentAvailable(): boolean {
  return !!getWorkflowAgentIpc();
}

export function requireWorkflowAgentIpc() {
  const api = getWorkflowAgentIpc();
  if (!api) {
    throw new Error('当前环境不支持工作流 Agent IPC');
  }
  return api;
}
