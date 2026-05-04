import {
  listWorkflowAgentDir,
  listWorkflowNodeFileTree,
  readWorkflowNodeFile,
} from './agent-files';

const MAX_TOTAL_CHARS = 80000;
const MAX_FILES = 30;

const TEXT_FILE_PATTERN = /\.(md|txt|json|js|ts|tsx|jsx|py|html|css|less|xml|yaml|yml|csv|log)$/i;

function isTextFilePath(relativePath: string): boolean {
  const base = relativePath.split('/').pop() || relativePath;
  if (TEXT_FILE_PATTERN.test(relativePath)) {
    return true;
  }
  return ['makefile', 'dockerfile', 'readme', 'license'].includes(base.toLowerCase());
}

/**
 * 构建工作流节点/根目录的 AI 工作区上下文（递归读取文本文件）
 * @param workflowName 工作流名称
 * @param nodeName 节点名称；为 null 时读取工作流根目录顶层文件
 */
export async function buildWorkflowWorkspaceContext(
  workflowName: string,
  nodeName: string | null,
): Promise<string> {
  if (!workflowName.trim()) {
    return '';
  }

  const blocks: string[] = [];
  let totalChars = 0;

  if (nodeName) {
    const entries = await listWorkflowNodeFileTree(workflowName, nodeName);
    const files = entries.filter((e) => !e.isDirectory && isTextFilePath(e.relativePath));

    for (const file of files.slice(0, MAX_FILES)) {
      if (totalChars >= MAX_TOTAL_CHARS) {
        break;
      }
      const content = await readWorkflowNodeFile(workflowName, nodeName, file.relativePath);
      if (!content.trim()) {
        continue;
      }
      const remaining = MAX_TOTAL_CHARS - totalChars;
      const clipped =
        content.length > remaining ? `${content.slice(0, remaining)}\n...(已截断)` : content;
      blocks.push(`--- 文件: ${file.relativePath} ---\n${clipped}`);
      totalChars += clipped.length;
    }

    const label = `${workflowName}/${nodeName}`;
    if (blocks.length === 0) {
      return `当前工作区目录：${label}\n（目录内无可读取的文本文件，请基于目录结构回答）`;
    }
    return [
      `当前工作区目录：${label}`,
      '以下为上一节点产出目录中的文件内容（可能已截断），回答时请优先参考：',
      ...blocks,
    ].join('\n\n');
  }

  const entries = await listWorkflowAgentDir(workflowName);
  const files = entries.filter((e) => e.type === 'file');

  for (const file of files.slice(0, MAX_FILES)) {
    if (totalChars >= MAX_TOTAL_CHARS) {
      break;
    }
    const readViaWorkspace = (await window.api?.workspace?.readFile?.(file.path)) as
      | { success?: boolean; content?: string; skipped?: boolean }
      | undefined;
    const text =
      readViaWorkspace?.success && !readViaWorkspace.skipped ? readViaWorkspace.content || '' : '';
    if (!text.trim()) {
      continue;
    }
    const remaining = MAX_TOTAL_CHARS - totalChars;
    const clipped = text.length > remaining ? `${text.slice(0, remaining)}\n...(已截断)` : text;
    blocks.push(`--- 文件: ${file.name} ---\n${clipped}`);
    totalChars += clipped.length;
  }

  const label = workflowName;
  if (blocks.length === 0) {
    return `当前工作区目录：agent/${label}\n（目录内无可读取的文本文件，请基于目录结构回答）`;
  }
  return [
    `当前工作区目录：agent/${label}`,
    '以下为工作流根目录中的文件内容（可能已截断），回答时请优先参考：',
    ...blocks,
  ].join('\n\n');
}
