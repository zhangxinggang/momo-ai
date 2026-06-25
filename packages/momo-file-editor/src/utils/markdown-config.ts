/** 是否为 Markdown 文件路径 */
export function isMarkdownPath(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return ['md', 'mdx', 'markdown'].includes(ext);
}
