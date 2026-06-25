import fs from 'fs';
import path from 'path';

import { isCodeEditorPath } from '@momo/file-editor/node';
import type { WorkspaceIgnoreFilter } from './gitignore-filter';

const SNIPPET_CONTEXT_LINES = 8;
const MAX_SNIPPET_CHARS = 4000;

export function readFileSnippet(
  workspaceRoot: string,
  relativePath: string,
  centerLine: number,
  filter: WorkspaceIgnoreFilter,
): string | null {
  const normalized = relativePath.replace(/\\/g, '/');
  if (filter.isIgnored(normalized)) {
    return null;
  }
  const abs = path.join(workspaceRoot, normalized);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    return null;
  }
  if (!isCodeEditorPath(abs)) {
    return null;
  }
  let content: string;
  try {
    content = fs.readFileSync(abs, 'utf-8');
  } catch {
    return null;
  }
  const lines = content.split(/\r?\n/);
  const centerIndex = Math.max(1, centerLine) - 1;
  const start = Math.max(0, centerIndex - SNIPPET_CONTEXT_LINES);
  const end = Math.min(lines.length, centerIndex + SNIPPET_CONTEXT_LINES + 1);
  const chunk = lines
    .slice(start, end)
    .map((text, idx) => `${start + idx + 1}| ${text}`)
    .join('\n');
  if (chunk.length > MAX_SNIPPET_CHARS) {
    return `${chunk.slice(0, MAX_SNIPPET_CHARS)}\n...(已截断)`;
  }
  return chunk;
}
