const STOP_WORDS = new Set([
  'about',
  'after',
  'before',
  'could',
  'from',
  'have',
  'into',
  'please',
  'should',
  'that',
  'these',
  'this',
  'what',
  'when',
  'where',
  'which',
  'with',
  '帮我',
  '一下',
  '这个',
  '那个',
  '如何',
  '什么',
  '是否',
]);

const MAX_KEYWORDS = 8;

function pushKeyword(result: string[], seen: Set<string>, value: string): void {
  const normalized = value.trim().replace(/^[./\\]+|[.,:;!?，。；：！？]+$/g, '');
  const key = normalized.toLowerCase();
  if (normalized.length < 2 || STOP_WORDS.has(key) || seen.has(key)) {
    return;
  }
  seen.add(key);
  result.push(normalized);
}

/**
 * 从原始用户问题中提取可解释的文本检索词。
 * 不包含产品领域词表，避免通过关键词猜测用户意图。
 */
export function extractGrepKeywords(message: string): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  const patterns = [
    /`([^`\r\n]{2,80})`/g,
    /["“”']([^"“”'\r\n]{2,80})["“”']/g,
    /(?:^|\s)((?:[\w.-]+[\\/])+[\w./-]+)/g,
    /\b[A-Za-z_$][A-Za-z0-9_$]{2,}\b/g,
    /[\u4e00-\u9fff]{2,12}/g,
  ];

  for (const pattern of patterns) {
    for (const match of message.matchAll(pattern)) {
      pushKeyword(result, seen, match[1] || match[0]);
      if (result.length >= MAX_KEYWORDS) {
        return result;
      }
    }
  }
  return result;
}

/** 仅在用户明确询问目录、文件结构时读取目录树。 */
export function asksForWorkspaceTree(message: string): boolean {
  return /目录树|目录结构|文件结构|项目结构|仓库结构|有哪些文件|list files|folder structure|directory tree/i.test(
    message,
  );
}
