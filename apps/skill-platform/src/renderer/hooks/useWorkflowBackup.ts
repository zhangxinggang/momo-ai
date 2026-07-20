import type {
  IWorkflowBackupConflictItem,
  IWorkflowBackupResourceDecision,
} from '@/types/modules';
import { useToast } from '@renderer/components/ui/Toast';
import {
  cancelWorkflowImport,
  commitWorkflowImport,
  exportWorkflowTemplate,
  isWorkflowBackupApiAvailable,
  previewWorkflowImport,
} from '@renderer/services/workflow/backup-api';
import { usePromptStore, useSkillStore, useWorkflowStore } from '@renderer/store';
import { useCallback, useState } from 'react';

export function useWorkflowBackup() {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictSessionId, setConflictSessionId] = useState<string | null>(null);
  const [conflictWorkflowName, setConflictWorkflowName] = useState('');
  const [conflicts, setConflicts] = useState<IWorkflowBackupConflictItem[]>([]);
  const [pendingStrippedCount, setPendingStrippedCount] = useState(0);

  const refreshAfterImport = useCallback(async () => {
    await useWorkflowStore.getState().fetchWorkflows();
    await useWorkflowStore.getState().refreshTree();
    await usePromptStore.getState().fetchPrompts();
    await usePromptStore.getState().refreshTree();
    await useSkillStore.getState().loadSkills();
  }, []);

  const finishImportSuccess = useCallback(
    async (options: {
      workflowName?: string;
      promptCount?: number;
      skillCount?: number;
      strippedLocalPathCount?: number;
    }) => {
      await refreshAfterImport();
      showToast(
        `已导入工作流「${options.workflowName ?? ''}」（提示词 ${options.promptCount ?? 0}、Skill ${options.skillCount ?? 0}）`,
        'success',
      );
      const stripped = options.strippedLocalPathCount ?? 0;
      if (stripped > 0) {
        showToast(`已清除 ${stripped} 处本机路径，请重新配置`, 'info');
      }
    },
    [refreshAfterImport, showToast],
  );

  const exportWorkflow = useCallback(
    async (workflowId: string) => {
      if (!isWorkflowBackupApiAvailable()) {
        throw new Error('当前环境不支持工作流导出');
      }
      setIsExporting(true);
      try {
        const result = await exportWorkflowTemplate(workflowId);
        if (result.canceled) {
          return result;
        }
        showToast(
          `已导出工作流（提示词 ${result.promptCount ?? 0}、Skill ${result.skillCount ?? 0}）`,
          'success',
        );
        if ((result.missingCount ?? 0) > 0) {
          showToast(`有 ${result.missingCount} 个资源缺失，未写入包`, 'warning');
        }
        if (result.skillFileWarnings?.length) {
          showToast(result.skillFileWarnings.join('；'), 'warning');
        }
        return result;
      } finally {
        setIsExporting(false);
      }
    },
    [showToast],
  );

  const runCommit = useCallback(
    async (sessionId: string, decisions: IWorkflowBackupResourceDecision[]) => {
      const result = await commitWorkflowImport(sessionId, decisions);
      if (result.error) {
        showToast(result.error, 'error');
        return result;
      }
      await finishImportSuccess({
        workflowName: result.workflowName,
        promptCount: result.promptCount,
        skillCount: result.skillCount,
        strippedLocalPathCount: result.strippedLocalPathCount ?? pendingStrippedCount,
      });
      return result;
    },
    [finishImportSuccess, pendingStrippedCount, showToast],
  );

  const importWorkflow = useCallback(async () => {
    if (!isWorkflowBackupApiAvailable()) {
      throw new Error('当前环境不支持工作流导入');
    }
    setIsImporting(true);
    try {
      const preview = await previewWorkflowImport();
      if (preview.canceled) {
        return preview;
      }
      if (preview.error || !preview.sessionId) {
        showToast(preview.error || '导入预览失败', 'error');
        return preview;
      }

      setPendingStrippedCount(preview.strippedLocalPathCount ?? 0);

      if (!preview.conflicts?.length) {
        await runCommit(preview.sessionId, []);
        return preview;
      }

      setConflictSessionId(preview.sessionId);
      setConflictWorkflowName(preview.workflowName ?? '');
      setConflicts(preview.conflicts);
      setConflictOpen(true);
      return preview;
    } finally {
      setIsImporting(false);
    }
  }, [runCommit, showToast]);

  const handleConflictCancel = useCallback(async () => {
    const sessionId = conflictSessionId;
    setConflictOpen(false);
    setConflicts([]);
    setConflictSessionId(null);
    if (sessionId) {
      await cancelWorkflowImport(sessionId);
    }
  }, [conflictSessionId]);

  const handleConflictConfirm = useCallback(
    async (decisions: IWorkflowBackupResourceDecision[]) => {
      const sessionId = conflictSessionId;
      setConflictOpen(false);
      setConflicts([]);
      setConflictSessionId(null);
      if (!sessionId) {
        return;
      }
      setIsImporting(true);
      try {
        await runCommit(sessionId, decisions);
      } finally {
        setIsImporting(false);
      }
    },
    [conflictSessionId, runCommit],
  );

  return {
    isExporting,
    isImporting,
    exportWorkflow,
    importWorkflow,
    conflictModalProps: {
      open: conflictOpen,
      workflowName: conflictWorkflowName,
      conflicts,
      onCancel: () => {
        void handleConflictCancel();
      },
      onConfirm: (decisions: IWorkflowBackupResourceDecision[]) => {
        void handleConflictConfirm(decisions);
      },
    },
  };
}
