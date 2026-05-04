/** 将完整路径格式化为输入栏可展示的短路径 */
export function formatWorkspaceDisplayPath(path: string | null | undefined): string {
  if (!path?.trim()) {
    return '无';
  }
  const normalized = path.replace(/\\/g, '/');
  const segments = normalized.split('/').filter(Boolean);
  if (segments.length <= 2) {
    return path;
  }
  return `.../${segments.slice(-2).join('/')}`;
}
