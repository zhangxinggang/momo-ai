import type { IFileEditorAdapter } from '@momo/file-editor';

import {
  createWorkflowNodeDir,
  deleteWorkflowNodeFile,
  listWorkflowNodeFileTree,
  moveWorkflowNodePath,
  readWorkflowNodeFile,
  writeWorkflowNodeFile,
} from '@renderer/services/workflow/agent-files';

/** 工作流节点产出目录文件读写适配器 */
export function createWorkflowFileEditorAdapter(
  workflowName: string,
  businessId: string,
  nodeName: string,
): IFileEditorAdapter {
  return {
    listTree: () => listWorkflowNodeFileTree(workflowName, businessId, nodeName),
    readFile: (relativePath) =>
      readWorkflowNodeFile(workflowName, businessId, nodeName, relativePath),
    writeFile: (relativePath, content) =>
      writeWorkflowNodeFile(workflowName, businessId, nodeName, relativePath, content),
    deletePath: (relativePath) =>
      deleteWorkflowNodeFile(workflowName, businessId, nodeName, relativePath),
    createDirectory: (relativePath) =>
      createWorkflowNodeDir(workflowName, businessId, nodeName, relativePath),
    movePath: (fromRelativePath, toRelativePath) =>
      moveWorkflowNodePath(workflowName, businessId, nodeName, fromRelativePath, toRelativePath),
  };
}
