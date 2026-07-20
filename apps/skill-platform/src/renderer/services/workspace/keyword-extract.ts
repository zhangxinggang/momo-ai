const MAX_KEYWORDS = 8;

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'this',
  'that',
  'with',
  'from',
  'please',
  'help',
  'me',
]);

/** 中文领域词 → 仓库内常见英文检索词 */
const CN_DOMAIN_GREP_TERMS: Array<{ pattern: RegExp; terms: string[] }> = [
  { pattern: /标签/, terms: ['tag', 'tags', 'SkillTag', 'SkillTagEditor', 'SkillTagFilter'] },
  { pattern: /技能/, terms: ['skill', 'Skill'] },
  { pattern: /批量/, terms: ['batch', 'bulk'] },
  { pattern: /列表/, terms: ['list', 'SkillList'] },
  { pattern: /工作区/, terms: ['workspace'] },
  { pattern: /知识库/, terms: ['kb', 'RAG'] },
  { pattern: /对话/, terms: ['chat', 'Chat'] },
];

/** 从用户消息提取 Grep 关键词 */
export function extractGrepKeywords(message: string): string[] {
  const keywords = new Set<string>();

  for (const item of CN_DOMAIN_GREP_TERMS) {
    if (item.pattern.test(message)) {
      for (const term of item.terms) {
        keywords.add(term);
      }
    }
  }

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
    if (!STOP_WORDS.has(match.toLowerCase())) {
      keywords.add(match);
    }
  }

  return [...keywords].slice(0, MAX_KEYWORDS);
}
