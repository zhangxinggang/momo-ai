import type {
  IWorkflowBackupResourceDecision,
  IWorkflowExportResult,
  IWorkflowImportCommitResult,
  IWorkflowImportPreviewResult,
} from '@/types/modules';

import { getWorkflowBackupIpc } from '../ipc';

export function isWorkflowBackupApiAvailable(): boolean {
  return !!getWorkflowBackupIpc();
}

export async function exportWorkflowTemplate(workflowId: string): Promise<IWorkflowExportResult> {
  const api = getWorkflowBackupIpc();
  if (!api?.exportTemplate) {
    throw new Error('当前环境不支持工作流导出');
  }
  return api.exportTemplate(workflowId);
}

export async function previewWorkflowImport(): Promise<IWorkflowImportPreviewResult> {
  const api = getWorkflowBackupIpc();
  if (!api?.previewImport) {
    throw new Error('当前环境不支持工作流导入');
  }
  return api.previewImport();
}

export async function commitWorkflowImport(
  sessionId: string,
  decisions: IWorkflowBackupResourceDecision[],
): Promise<IWorkflowImportCommitResult> {
  const api = getWorkflowBackupIpc();
  if (!api?.commitImport) {
    throw new Error('当前环境不支持工作流导入提交');
  }
  return api.commitImport(sessionId, decisions);
}

export async function cancelWorkflowImport(sessionId: string): Promise<void> {
  const api = getWorkflowBackupIpc();
  if (!api?.cancelImport) {
    return;
  }
  await api.cancelImport(sessionId);
}
