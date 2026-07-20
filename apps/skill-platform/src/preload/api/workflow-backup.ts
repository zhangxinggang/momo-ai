import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type {
  IWorkflowBackupResourceDecision,
  IWorkflowExportResult,
  IWorkflowImportCommitResult,
  IWorkflowImportPreviewResult,
} from '@/types/modules';
import { ipcRenderer } from 'electron';

export const workflowBackupApi = {
  exportTemplate: (workflowId: string): Promise<IWorkflowExportResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_EXPORT_TEMPLATE, workflowId),
  previewImport: (): Promise<IWorkflowImportPreviewResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_PREVIEW_IMPORT),
  commitImport: (
    sessionId: string,
    decisions: IWorkflowBackupResourceDecision[],
  ): Promise<IWorkflowImportCommitResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_COMMIT_IMPORT, sessionId, decisions),
  cancelImport: (sessionId: string): Promise<{ canceled: true }> =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_CANCEL_IMPORT, sessionId),
};
