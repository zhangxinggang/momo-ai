import fs from 'fs';
import path from 'path';

import type { WorkspaceIgnoreFilter } from './gitignore-filter';

const MAX_TREE_DEPTH = 4;
const MAX_TREE_NODES = 500;

export interface ITreeEntry {
  path: string;
  type: 'file' | 'directory';
}

export function listWorkspaceTree(
  workspaceRoot: string,
  filter: WorkspaceIgnoreFilter,
): { entries: ITreeEntry[]; truncated: boolean } {
  const entries: ITreeEntry[] = [];
  let truncated = false;

  function walk(dirAbs: string, relPrefix: string, depth: number): void {
    if (depth > MAX_TREE_DEPTH || entries.length >= MAX_TREE_NODES) {
      truncated = true;
      return;
    }
    let items: fs.Dirent[];
    try {
      items = fs.readdirSync(dirAbs, { withFileTypes: true });
    } catch {
      return;
    }
    for (const item of items) {
      if (entries.length >= MAX_TREE_NODES) {
        truncated = true;
        return;
      }
      const rel = relPrefix ? `${relPrefix}/${item.name}` : item.name;
      const ignorePath = item.isDirectory() ? `${rel}/` : rel;
      if (filter.isIgnored(ignorePath)) {
        continue;
      }
      entries.push({ path: rel, type: item.isDirectory() ? 'directory' : 'file' });
      if (item.isDirectory()) {
        walk(path.join(dirAbs, item.name), rel, depth + 1);
      }
    }
  }

  walk(workspaceRoot, '', 0);
  return { entries, truncated };
}

/** 将扁平 entries 格式化为缩进目录树文本 */
export function formatTreeSummary(entries: ITreeEntry[]): string {
  if (entries.length === 0) {
    return '（空）';
  }
  const lines: string[] = [];
  for (const entry of entries) {
    const depth = entry.path.split('/').length - 1;
    const indent = '  '.repeat(depth);
    const suffix = entry.type === 'directory' ? '/' : '';
    const name = entry.path.split('/').pop() ?? entry.path;
    lines.push(`${indent}${name}${suffix}`);
  }
  return lines.join('\n');
}
