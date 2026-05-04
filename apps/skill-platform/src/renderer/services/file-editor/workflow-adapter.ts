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
  nodeName: string,
): IFileEditorAdapter {
  return {
    listTree: () => listWorkflowNodeFileTree(workflowName, nodeName),
    readFile: (relativePath) => readWorkflowNodeFile(workflowName, nodeName, relativePath),
    writeFile: (relativePath, content) =>
      writeWorkflowNodeFile(workflowName, nodeName, relativePath, content),
    deletePath: (relativePath) => deleteWorkflowNodeFile(workflowName, nodeName, relativePath),
    createDirectory: (relativePath) => createWorkflowNodeDir(workflowName, nodeName, relativePath),
    movePath: (fromRelativePath, toRelativePath) =>
      moveWorkflowNodePath(workflowName, nodeName, fromRelativePath, toRelativePath),
  };
}
