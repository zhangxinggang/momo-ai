import type { IFileTreeEntry } from '../types/adapter';

export interface IFileTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: IFileTreeNode[];
}

/** 规范化相对路径为 POSIX 风格 */
export function normalizeRelativePath(path: string): string {
  return path
    .split(/[/\\]+/)
    .filter(Boolean)
    .join('/');
}

/**
 * 新建文件时若未带后缀，则追加默认扩展名（如 md）
 */
export function ensurePathWithExtension(path: string, defaultExtension: string): string {
  const normalized = normalizeRelativePath(path.trim());
  if (!normalized) {
    return '';
  }
  const fileName = normalized.split('/').pop() ?? normalized;
  if (fileName.includes('.')) {
    return normalized;
  }
  const ext = defaultExtension.startsWith('.') ? defaultExtension.slice(1) : defaultExtension;
  return `${normalized}.${ext}`;
}

/** 将扁平条目构建为树 */
export function buildFileTree(entries: IFileTreeEntry[]): IFileTreeNode[] {
  const root: IFileTreeNode[] = [];
  const sorted = [...entries].sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  for (const entry of sorted) {
    const parts = entry.relativePath.split('/');
    let level = root;

    for (let i = 0; i < parts.length; i++) {
      const partName = parts[i];
      const partPath = parts.slice(0, i + 1).join('/');
      const isLast = i === parts.length - 1;
      let existing = level.find((n) => n.name === partName);

      if (!existing) {
        existing = {
          name: partName,
          path: partPath,
          isDirectory: isLast ? entry.isDirectory : true,
          children: [],
        };
        level.push(existing);
      }

      if (!isLast) {
        level = existing.children;
      }
    }
  }

  return root;
}

/** 获取路径最后一段名称 */
export function getBaseName(relativePath: string): string {
  const normalized = normalizeRelativePath(relativePath);
  const parts = normalized.split('/');
  return parts[parts.length - 1] || normalized;
}

/** 获取父级目录路径，根级返回空字符串 */
export function getParentPath(relativePath: string): string {
  const normalized = normalizeRelativePath(relativePath);
  const parts = normalized.split('/');
  parts.pop();
  return parts.join('/');
}

/** 拼接目录与名称 */
export function joinRelativePath(parentPath: string, name: string): string {
  const parent = normalizeRelativePath(parentPath);
  const child = name.trim().replace(/[/\\]+/g, '');
  if (!parent) {
    return child;
  }
  if (!child) {
    return parent;
  }
  return `${parent}/${child}`;
}
