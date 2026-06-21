import { getWorkflowBusinessIpc } from '../ipc';

export function getWorkflowBusinessApi() {
  return getWorkflowBusinessIpc();
}

export function isWorkflowBusinessApiAvailable(): boolean {
  return !!getWorkflowBusinessIpc();
}

/** 是否支持业务持久化（创建/删除等） */
export function isWorkflowBusinessPersistenceAvailable(): boolean {
  return !!getWorkflowBusinessIpc()?.create;
}
