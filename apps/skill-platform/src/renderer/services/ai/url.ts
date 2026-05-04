/** API URL 解析与规范化 */

export function getBaseUrl(apiUrl: string): string {
  if (!apiUrl) return '';

  let url = apiUrl.trim();

  // Handle # suffix: if ends with #, treat as explicit and remove # for display
  // 处理 # 后缀：如果以 # 结尾，视为显式指定，显示时移除 #
  if (url.endsWith('#')) {
    return url.slice(0, -1);
  }

  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  // Remove common endpoint suffixes
  // 移除常见的端点后缀
  const suffixes = [
    '/chat/completions',
    '/completions',
    '/models',
    '/embeddings',
    '/images/generations',
  ];
  for (const suffix of suffixes) {
    if (url.endsWith(suffix)) {
      url = url.slice(0, -suffix.length);
      break;
    }
  }

  return url;
}

/**
 * Normalize user input for persisted API URL storage
 * 保持用户显式的 # 标记，同时把完整 endpoint 收敛为 base URL
 */
export function normalizeApiUrlInput(apiUrl: string): string {
  if (!apiUrl) return '';

  const trimmed = apiUrl.trim();
  const explicit = trimmed.endsWith('#');
  const rawValue = explicit ? trimmed.slice(0, -1) : trimmed;
  const normalized = getBaseUrl(rawValue);

  if (!normalized) {
    return explicit ? '#' : '';
  }

  return explicit ? `${normalized}#` : normalized;
}
