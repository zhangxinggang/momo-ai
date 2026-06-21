import type {
  DCreateWorkflowBusiness,
  DUpdateWorkflowBusiness,
  IWorkflowBusiness,
} from '@/types/modules';

import {
  getWorkflowBusinessApi,
  isWorkflowBusinessPersistenceAvailable,
} from '@renderer/services/workflow/business-api';

export async function fetchBusinessList(workflowId: string): Promise<IWorkflowBusiness[]> {
  return getWorkflowBusinessApi()?.getAll(workflowId) ?? [];
}

export async function createBusiness(
  data: DCreateWorkflowBusiness,
): Promise<IWorkflowBusiness | null> {
  return getWorkflowBusinessApi()?.create(data) ?? null;
}

export async function updateBusiness(
  id: string,
  data: DUpdateWorkflowBusiness,
): Promise<IWorkflowBusiness | null> {
  return getWorkflowBusinessApi()?.update(id, data) ?? null;
}

export async function deleteBusiness(id: string): Promise<boolean> {
  return getWorkflowBusinessApi()?.delete(id) ?? false;
}

export async function deleteBusinessesByWorkflow(workflowId: string): Promise<void> {
  await getWorkflowBusinessApi()?.deleteByWorkflow(workflowId);
}

export async function workflowHasBusinesses(workflowId: string): Promise<boolean> {
  return getWorkflowBusinessApi()?.hasAny(workflowId) ?? false;
}

export { isWorkflowBusinessPersistenceAvailable };
