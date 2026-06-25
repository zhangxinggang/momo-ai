/** 从相对路径提取文件后缀（小写），无后缀或隐藏文件返回空字符串 */
export function getPathExtension(relativePath: string): string {
  const baseName = relativePath.split(/[/\\]/).pop() ?? '';
  const dotIndex = baseName.lastIndexOf('.');
  if (dotIndex <= 0) {
    return '';
  }
  return baseName.slice(dotIndex + 1).toLowerCase();
}

/** 从相对路径提取文件名（小写），无文件名或隐藏文件返回空字符串 */
export function getPathBasename(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, '/');
  return normalized.slice(normalized.lastIndexOf('/') + 1).toLowerCase();
}
