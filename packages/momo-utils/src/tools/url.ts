/**
 * 拼接 URL 路径段，忽略空段与多余斜杠
 */
export function joinUrlPath(...segments: Array<string | number | undefined | null>): string {
  return segments
    .flatMap((segment) => String(segment ?? '').split('/'))
    .filter(Boolean)
    .join('/');
}

/**
 * 拼接完整 HTTP URL
 */
export function buildHttpUrl(
  origin: string,
  ...pathSegments: Array<string | number | undefined | null>
): string {
  const normalizedOrigin = String(origin).replace(/\/+$/, '');
  const pathname = joinUrlPath(...pathSegments);
  return pathname ? `${normalizedOrigin}/${pathname}` : normalizedOrigin;
}
