/** 从相对路径提取文件后缀（小写），无后缀或隐藏文件返回空字符串 */
export function getPathExtension(relativePath: string): string {
  const baseName = relativePath.split(/[/\\]/).pop() ?? '';
  const dotIndex = baseName.lastIndexOf('.');
  if (dotIndex <= 0) {
    return '';
  }
  return baseName.slice(dotIndex + 1).toLowerCase();
}
