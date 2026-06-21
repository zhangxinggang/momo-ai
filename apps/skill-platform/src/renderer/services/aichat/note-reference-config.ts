import type { INoteReferencesConfig } from '@momo/aichat';
import { resolveNoteMentionsInContent } from '@momo/aichat';

import { listNoteTree, readNoteFile } from '@renderer/services/note/api';

async function readNoteContent(path: string): Promise<string> {
  const result = await readNoteFile(path);
  if (typeof result === 'string') {
    return result;
  }
  return result.content ?? '';
}

/** 构建 AI 对话 @ 笔记引用配置 */
export function createNoteReferencesConfig(): INoteReferencesConfig | undefined {
  return {
    listTree: listNoteTree,
    resolveContent: async (content: string) => resolveNoteMentionsInContent(content, readNoteContent),
  };
}
