import { getWorkspaceApi } from '@renderer/services/workspace/api';
import { useChatWorkspaceStore } from '@renderer/store/chat';

const MAX_TOTAL_CHARS = 80000;
const MAX_FILES = 30;

interface IDirEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
}

interface IListDirResult {
  success: boolean;
  entries?: IDirEntry[];
  error?: string;
}

interface IReadFileResult {
  success: boolean;
  content?: string;
  truncated?: boolean;
  skipped?: boolean;
  error?: string;
  filePath?: string;
}

/** 读取工作区目录内文本文件，拼接为 AI 上下文 */
export async function buildWorkspaceContext(workspacePath: string): Promise<string> {
  if (!workspacePath.trim()) {
    return '';
  }

  const listResult = (await getWorkspaceApi()?.listDir?.(workspacePath)) as
    | IListDirResult
    | undefined;
  if (!listResult?.success || !listResult.entries?.length) {
    return '';
  }

  const textFiles = listResult.entries.filter((entry) => entry.type === 'file').slice(0, MAX_FILES);

  const blocks: string[] = [];
  let totalChars = 0;

  for (const file of textFiles) {
    if (totalChars >= MAX_TOTAL_CHARS) {
      break;
    }

    const readResult = (await getWorkspaceApi()?.readFile?.(file.path)) as
      | IReadFileResult
      | undefined;
    if (!readResult?.success || readResult.skipped || !readResult.content) {
      continue;
    }

    const remaining = MAX_TOTAL_CHARS - totalChars;
    const content =
      readResult.content.length > remaining
        ? `${readResult.content.slice(0, remaining)}\n...(已截断)`
        : readResult.content;

    blocks.push(`--- 文件: ${file.name} ---\n${content}`);
    totalChars += content.length;
  }

  if (blocks.length === 0) {
    return `当前工作区目录：${workspacePath}\n（目录内无可读取的文本文件，请基于目录结构回答）`;
  }

  return [
    `当前工作区目录：${workspacePath}`,
    '以下为工作区中的文件内容（可能已截断），回答、编码、总结时请优先参考：',
    ...blocks,
  ].join('\n\n');
}

/** 若用户已启用工作区，则读取并返回 AI 上下文文本 */
export async function getEnabledWorkspaceContext(): Promise<string> {
  const { workspacePaths, workspaceEnabled } = useChatWorkspaceStore.getState();
  if (!workspaceEnabled || workspacePaths.length === 0) {
    return '';
  }

  const blocks: string[] = [];
  for (const workspacePath of workspacePaths) {
    const context = await buildWorkspaceContext(workspacePath);
    if (context.trim()) {
      blocks.push(context);
    }
  }

  return blocks.join('\n\n---\n\n');
}
