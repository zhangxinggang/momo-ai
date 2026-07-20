import type {
  IWorkflowBackupConflictItem,
  IWorkflowBackupResourceDecision,
} from '@/types/modules';

export interface IProps {
  open: boolean;
  workflowName: string;
  conflicts: IWorkflowBackupConflictItem[];
  onCancel: () => void;
  onConfirm: (decisions: IWorkflowBackupResourceDecision[]) => void;
}
