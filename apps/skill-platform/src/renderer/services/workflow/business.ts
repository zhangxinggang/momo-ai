import type {
  DCreateWorkflowBusiness,
  DUpdateWorkflowBusiness,
  IWorkflowBusiness,
} from '@/types/modules';

export async function fetchBusinessList(workflowId: string): Promise<IWorkflowBusiness[]> {
  return window.api?.workflowBusiness?.getAll(workflowId) ?? [];
}

export async function createBusiness(
  data: DCreateWorkflowBusiness,
): Promise<IWorkflowBusiness | null> {
  return window.api?.workflowBusiness?.create(data) ?? null;
}

export async function updateBusiness(
  id: string,
  data: DUpdateWorkflowBusiness,
): Promise<IWorkflowBusiness | null> {
  return window.api?.workflowBusiness?.update(id, data) ?? null;
}

export async function deleteBusiness(id: string): Promise<boolean> {
  return window.api?.workflowBusiness?.delete(id) ?? false;
}

export async function deleteBusinessesByWorkflow(workflowId: string): Promise<void> {
  await window.api?.workflowBusiness?.deleteByWorkflow(workflowId);
}

export async function workflowHasBusinesses(workflowId: string): Promise<boolean> {
  return window.api?.workflowBusiness?.hasAny(workflowId) ?? false;
}
