const MAX_KEYWORDS = 5;

/** 从用户消息提取 Grep 关键词 */
export function extractGrepKeywords(message: string): string[] {
  const keywords = new Set<string>();

  const pathMatches = message.match(/[\w.-]+\/[\w./-]+|[\w.-]+\.(ts|tsx|js|jsx|md|json)/gi) ?? [];
  for (const match of pathMatches.slice(0, 2)) {
    const segment = match.split('/').pop();
    if (segment) {
      keywords.add(segment.replace(/\.\w+$/i, ''));
    }
  }

  const pascalMatches = message.match(/\b[A-Z][a-zA-Z0-9]{2,}\b/g) ?? [];
  for (const match of pascalMatches.slice(0, 3)) {
    keywords.add(match);
  }

  const camelMatches = message.match(/\b[a-z][a-zA-Z0-9]{2,}\b/g) ?? [];
  for (const match of camelMatches.slice(0, 2)) {
    if (!['the', 'and', 'for', 'this', 'that', 'with', 'from'].includes(match.toLowerCase())) {
      keywords.add(match);
    }
  }

  return [...keywords].slice(0, MAX_KEYWORDS);
}
