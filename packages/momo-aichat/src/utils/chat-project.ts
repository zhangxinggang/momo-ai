/** 规范化文件夹路径：trim、去空、去重、排序 */
export function normalizeFolderPaths(paths: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of paths) {
    const trimmed = raw.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result.sort((a, b) => a.localeCompare(b));
}

/** 项目业务唯一键：名称 + 规范化路径集合 */
export function buildChatProjectUniqueKey(name: string, folderPaths: string[]): string {
  const normalizedName = name.trim();
  const paths = normalizeFolderPaths(folderPaths);
  return `${normalizedName}\0${paths.join('\0')}`;
}

/** 侧栏展示名：有名称用名称，否则取首路径最后一级 */
export function getChatProjectDisplayName(project: {
  name: string;
  folderPaths: string[];
}): string {
  const trimmed = project.name.trim();
  if (trimmed) {
    return trimmed;
  }
  const first = project.folderPaths.find((p) => p.trim())?.trim();
  if (!first) {
    return '未命名项目';
  }
  const parts = first.replace(/\\/g, '/').split('/').filter(Boolean);
  return parts[parts.length - 1] ?? first;
}
