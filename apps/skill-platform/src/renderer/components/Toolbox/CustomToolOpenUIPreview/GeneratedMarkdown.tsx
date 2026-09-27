import { MarkdownPreview } from '@renderer/components/ui/MarkdownPreview';
import styles from './index.module.less';

/** Legacy ASCII diagrams are presentation, not source files with code-editor chrome. */
export function splitPresentationMarkdown(
  value: string,
): Array<{ kind: 'markdown' | 'diagram'; text: string }> {
  const parts: Array<{ kind: 'markdown' | 'diagram'; text: string }> = [];
  const fence = /(?:^|\n)[ \t]*(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\n[ \t]*\1[ \t]*(?=\n|$)/g;
  let cursor = 0;
  for (const match of value.matchAll(fence)) {
    const language = match[2].trim().toLowerCase();
    if (!['', 'text', 'txt', 'plaintext', 'ascii'].includes(language)) continue;
    if (match.index! > cursor)
      parts.push({ kind: 'markdown', text: value.slice(cursor, match.index) });
    parts.push({ kind: 'diagram', text: match[3] });
    cursor = match.index! + match[0].length;
  }
  if (cursor < value.length) parts.push({ kind: 'markdown', text: value.slice(cursor) });
  return parts;
}

export function GeneratedMarkdown({ value, theme }: { value: string; theme: 'light' | 'dark' }) {
  return (
    <>
      {splitPresentationMarkdown(value).map((part, index) =>
        part.kind === 'diagram' ? (
          <figure key={index} className={styles.presentationDiagram} aria-label='示意图'>
            <div>{part.text}</div>
          </figure>
        ) : (
          <MarkdownPreview key={index} value={part.text} theme={theme} previewTheme='default' />
        ),
      )}
    </>
  );
}
