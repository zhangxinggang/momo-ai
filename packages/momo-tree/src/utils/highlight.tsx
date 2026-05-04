import type { ReactNode } from 'react';

/** 将文本中匹配搜索词的部分用 mark 包裹，用于树节点标题高亮 */
export function renderHighlightedText(
  text: string,
  query: string,
  markClassName: string,
): ReactNode {
  const keyword = query.trim();
  if (!keyword) {
    return text;
  }

  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const parts: ReactNode[] = [];
  let start = 0;
  let matchIndex = lowerText.indexOf(lowerKeyword, start);

  while (matchIndex !== -1) {
    if (matchIndex > start) {
      parts.push(text.slice(start, matchIndex));
    }
    parts.push(
      <mark key={matchIndex} className={markClassName}>
        {text.slice(matchIndex, matchIndex + keyword.length)}
      </mark>,
    );
    start = matchIndex + keyword.length;
    matchIndex = lowerText.indexOf(lowerKeyword, start);
  }

  if (start < text.length) {
    parts.push(text.slice(start));
  }

  return parts.length > 0 ? parts : text;
}
