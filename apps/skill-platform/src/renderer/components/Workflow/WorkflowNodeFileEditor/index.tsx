import { FileEditor, useSyncedCodeEditorTheme } from '@momo/file-editor';
import { useToast } from '@renderer/components/ui/Toast';
import { createWorkflowFileEditorAdapter } from '@renderer/services/file-editor/workflow-adapter';
import { useCallback, useMemo } from 'react';

interface IProps {
  workflowName: string;
  businessId: string;
  nodeName: string;
  refreshToken?: number;
  onFilesChange?: () => void;
  filePreviewBaseUrl?: string;
}

/** 工作流节点文件编辑器（基于通用 @momo/file-editor） */
export function WorkflowNodeFileEditor({
  workflowName,
  businessId,
  nodeName,
  refreshToken = 0,
  onFilesChange,
  filePreviewBaseUrl,
}: IProps) {
  const { showToast } = useToast();
  const codeEditorTheme = useSyncedCodeEditorTheme();

  const adapter = useMemo(
    () => createWorkflowFileEditorAdapter(workflowName, businessId, nodeName),
    [businessId, nodeName, workflowName],
  );

  const handleNotify = useCallback(
    (payload: { message: string; type: 'success' | 'error' }) => {
      showToast(payload.message, payload.type);
    },
    [showToast],
  );

  return (
    <FileEditor
      adapter={adapter}
      codeEditorTheme={codeEditorTheme}
      defaultNewFileExtension='md'
      filePreviewBaseUrl={filePreviewBaseUrl}
      onFilesChange={onFilesChange}
      onNotify={handleNotify}
      refreshToken={refreshToken}
      treeTitle='文件'
    />
  );
}
