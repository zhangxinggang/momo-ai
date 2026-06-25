import fs from 'fs';
import path from 'path';

import { isCodeEditorPath } from '@momo/file-editor/node';
import type { WorkspaceIgnoreFilter } from './gitignore-filter';

const MAX_GREP_HITS = 20;
const MAX_GREP_FILE_SIZE = 512 * 1024;

export interface IGrepHit {
  filePath: string;
  line: number;
  column: number;
  snippet: string;
}

export function grepWorkspace(
  workspaceRoot: string,
  keywords: string[],
  filter: WorkspaceIgnoreFilter,
): IGrepHit[] {
  const hits: IGrepHit[] = [];
  const lowered = keywords.map((k) => k.toLowerCase()).filter(Boolean);
  if (lowered.length === 0) {
    return hits;
  }

  function walk(dirAbs: string, relPrefix: string): void {
    if (hits.length >= MAX_GREP_HITS) {
      return;
    }
    let items: fs.Dirent[];
    try {
      items = fs.readdirSync(dirAbs, { withFileTypes: true });
    } catch {
      return;
    }
    for (const item of items) {
      if (hits.length >= MAX_GREP_HITS) {
        return;
      }
      const rel = relPrefix ? `${relPrefix}/${item.name}` : item.name;
      const ignorePath = item.isDirectory() ? `${rel}/` : rel;
      if (filter.isIgnored(ignorePath)) {
        continue;
      }
      const abs = path.join(dirAbs, item.name);
      if (item.isDirectory()) {
        walk(abs, rel);
        continue;
      }
      if (!isCodeEditorPath(item.name)) {
        continue;
      }
      let content: string;
      try {
        const stat = fs.statSync(abs);
        if (stat.size > MAX_GREP_FILE_SIZE) {
          continue;
        }
        content = fs.readFileSync(abs, 'utf-8');
      } catch {
        continue;
      }
      const lines = content.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        if (hits.length >= MAX_GREP_HITS) {
          return;
        }
        const lineLower = lines[i].toLowerCase();
        if (lowered.some((kw) => lineLower.includes(kw))) {
          hits.push({
            filePath: rel,
            line: i + 1,
            column: 0,
            snippet: lines[i].trim().slice(0, 200),
          });
        }
      }
    }
  }

  walk(workspaceRoot, '');
  return hits;
}
