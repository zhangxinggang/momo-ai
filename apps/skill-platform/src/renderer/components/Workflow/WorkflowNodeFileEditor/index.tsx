import { FileEditor } from '@momo/file-editor';
import { useToast } from '@renderer/components/ui/Toast';
import { createWorkflowFileEditorAdapter } from '@renderer/services/file-editor/workflow-adapter';
import { useCallback, useMemo } from 'react';

interface IProps {
  workflowName: string;
  nodeName: string;
  refreshToken?: number;
  onFilesChange?: () => void;
}

/** 工作流节点文件编辑器（基于通用 @momo/file-editor） */
export function WorkflowNodeFileEditor({
  workflowName,
  nodeName,
  refreshToken = 0,
  onFilesChange,
}: IProps) {
  const { showToast } = useToast();

  const adapter = useMemo(
    () => createWorkflowFileEditorAdapter(workflowName, nodeName),
    [nodeName, workflowName],
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
      defaultNewFileExtension='md'
      onFilesChange={onFilesChange}
      onNotify={handleNotify}
      refreshToken={refreshToken}
      treeTitle='文件'
    />
  );
}
