import { getWorkspaceApi } from '@renderer/services/workspace/api';
import { useChatWorkspaceStore } from '@renderer/store/chat';

import { extractGrepKeywords } from './keyword-extract';
import { isWorkspaceRelatedQuestion } from './relevance-heuristic';

const MAX_SNIPPET_TOTAL_CHARS = 24000;

interface IListTreeResult {
  success: boolean;
  treeText?: string;
  truncated?: boolean;
  error?: string;
}

interface IGrepHit {
  filePath: string;
  line: number;
  column: number;
  snippet: string;
}

interface IGrepResult {
  success: boolean;
  hits?: IGrepHit[];
}

interface IReadSnippetResult {
  success: boolean;
  content?: string;
}

/** 构建单个工作区的目录树摘要（不含文件内容） */
async function buildWorkspaceTreeSummary(workspacePath: string): Promise<string> {
  const treeResult = (await getWorkspaceApi()?.listTree?.(workspacePath)) as
    | IListTreeResult
    | undefined;
  if (!treeResult?.success || !treeResult.treeText?.trim()) {
    return `当前工作区：${workspacePath}\n（目录为空或不可读）`;
  }
  const truncatedHint = treeResult.truncated ? '\n（目录树已截断）' : '';
  return `当前工作区：${workspacePath}\n目录结构（不含文件内容）：\n${treeResult.treeText}${truncatedHint}`;
}

/** 按关键词 Grep 并读取相关代码片段 */
async function buildWorkspaceGrepSnippets(
  workspacePaths: string[],
  userMessage: string,
): Promise<string[]> {
  if (!isWorkspaceRelatedQuestion(userMessage)) {
    return [];
  }

  const keywords = extractGrepKeywords(userMessage);
  if (keywords.length === 0) {
    return [];
  }

  const snippetBlocks: string[] = [];
  let totalChars = 0;

  for (const root of workspacePaths) {
    const grepResult = (await getWorkspaceApi()?.grep?.(root, keywords)) as IGrepResult | undefined;
    if (!grepResult?.success || !grepResult.hits?.length) {
      continue;
    }

    const seenFiles = new Set<string>();
    for (const hit of grepResult.hits) {
      if (seenFiles.has(hit.filePath)) {
        continue;
      }
      seenFiles.add(hit.filePath);

      const snip = (await getWorkspaceApi()?.readSnippet?.(root, hit.filePath, hit.line)) as
        | IReadSnippetResult
        | undefined;
      if (!snip?.success || !snip.content?.trim()) {
        continue;
      }

      const block = `--- ${hit.filePath} (L${hit.line}) ---\n${snip.content}`;
      if (totalChars + block.length > MAX_SNIPPET_TOTAL_CHARS) {
        break;
      }
      snippetBlocks.push(block);
      totalChars += block.length;
    }
  }

  return snippetBlocks;
}

interface IPersistedWorkspaceState {
  workspaceEnabled: boolean;
  workspacePaths: string[];
}

function readWorkspaceStateFromStorage(storageKey: string): IPersistedWorkspaceState {
  if (typeof window === 'undefined') {
    return { workspaceEnabled: false, workspacePaths: [] };
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return { workspaceEnabled: false, workspacePaths: [] };
    }
    const parsed = JSON.parse(raw) as Partial<IPersistedWorkspaceState> & {
      workspacePath?: string | null;
    };
    const legacyPath = typeof parsed.workspacePath === 'string' ? parsed.workspacePath.trim() : '';
    const workspacePaths = Array.isArray(parsed.workspacePaths)
      ? parsed.workspacePaths.filter((item) => typeof item === 'string' && item.trim())
      : legacyPath
        ? [legacyPath]
        : [];
    return {
      workspaceEnabled: Boolean(parsed.workspaceEnabled),
      workspacePaths,
    };
  } catch {
    return { workspaceEnabled: false, workspacePaths: [] };
  }
}

async function buildWorkspaceContextForPaths(
  workspacePaths: string[],
  userMessage?: string,
): Promise<string> {
  const blocks: string[] = [];

  for (const workspacePath of workspacePaths) {
    const summary = await buildWorkspaceTreeSummary(workspacePath);
    if (summary.trim()) {
      blocks.push(summary);
    }
  }

  const lastMessage = userMessage?.trim() ?? '';
  if (lastMessage) {
    const snippets = await buildWorkspaceGrepSnippets(workspacePaths, lastMessage);
    if (snippets.length > 0) {
      blocks.push('以下为用户问题相关的代码片段（由 Grep 检索，可能已截断）：', ...snippets);
    }
  }

  return blocks.join('\n\n');
}

/** 从指定 localStorage 键读取工作区并构建 AI 上下文（笔记 AI 写作等场景） */
export async function getWorkspaceContextFromStorageKey(
  storageKey: string,
  userMessage?: string,
): Promise<string> {
  const { workspaceEnabled, workspacePaths } = readWorkspaceStateFromStorage(storageKey);
  if (!workspaceEnabled || workspacePaths.length === 0) {
    return '';
  }
  return buildWorkspaceContextForPaths(workspacePaths, userMessage);
}

/**
 * 若用户已启用工作区，则返回 AI 上下文：
 * - 始终包含目录树摘要
 * - 相关问题追加 Grep 命中片段
 */
export async function getEnabledWorkspaceContext(userMessage?: string): Promise<string> {
  const { workspacePaths, workspaceEnabled } = useChatWorkspaceStore.getState();
  if (!workspaceEnabled || workspacePaths.length === 0) {
    return '';
  }
  return buildWorkspaceContextForPaths(workspacePaths, userMessage);
}
