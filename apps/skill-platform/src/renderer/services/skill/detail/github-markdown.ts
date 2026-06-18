export interface IGitHubMarkdownBase {
  hrefBase: string;
  imageBase: string;
}

export function resolveGitHubMarkdownBase(
  sourceUrl?: string,
  contentUrl?: string,
): IGitHubMarkdownBase | null {
  const parseTreeUrl = (url: string): IGitHubMarkdownBase | null => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.toLowerCase() !== 'github.com') {
        return null;
      }
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length >= 4 && parts[2] === 'tree') {
        const owner = parts[0];
        const repo = parts[1];
        const branch = parts[3];
        const directoryPath = parts.slice(4).join('/');
        const normalizedDirectory = directoryPath ? `${directoryPath}/` : '';
        return {
          hrefBase: `https://github.com/${owner}/${repo}/blob/${branch}/${normalizedDirectory}`,
          imageBase: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${normalizedDirectory}`,
        };
      }
    } catch {
      return null;
    }
    return null;
  };

  const parseRawUrl = (url: string): IGitHubMarkdownBase | null => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.toLowerCase() !== 'raw.githubusercontent.com') {
        return null;
      }
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length >= 4) {
        const owner = parts[0];
        const repo = parts[1];
        const branch = parts[2];
        const directoryPath = parts.slice(3, -1).join('/');
        const normalizedDirectory = directoryPath ? `${directoryPath}/` : '';
        return {
          hrefBase: `https://github.com/${owner}/${repo}/blob/${branch}/${normalizedDirectory}`,
          imageBase: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${normalizedDirectory}`,
        };
      }
    } catch {
      return null;
    }
    return null;
  };

  if (sourceUrl) {
    const parsed = parseTreeUrl(sourceUrl);
    if (parsed) {
      return parsed;
    }
  }

  if (contentUrl) {
    const parsed = parseRawUrl(contentUrl);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

/** 将 Markdown 中的相对链接/图片地址解析为 GitHub 绝对地址 */
export function preprocessGitHubMarkdown(
  content: string,
  sourceUrl?: string,
  contentUrl?: string,
): string {
  const base = resolveGitHubMarkdownBase(sourceUrl, contentUrl);
  if (!base) {
    return content;
  }

  const withImages = content.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_match, alt: string, src: string) => {
      const resolved = resolveGitHubMarkdownUrl(src, base, 'image');
      return `![${alt}](${resolved})`;
    },
  );

  return withImages.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (_match, text: string, href: string) => {
    const resolved = resolveGitHubMarkdownUrl(href, base, 'link');
    return `[${text}](${resolved})`;
  });
}

export function resolveGitHubMarkdownUrl(
  rawUrl: string,
  base: IGitHubMarkdownBase | null,
  kind: 'link' | 'image',
): string {
  const trimmed = rawUrl.trim();
  if (!trimmed || !base) {
    return trimmed;
  }
  if (/^(https?:|data:|mailto:|tel:|#)/i.test(trimmed) || trimmed.startsWith('local-image://')) {
    return trimmed;
  }

  const normalized = trimmed.replace(/^\.\//, '');
  const baseUrl = kind === 'image' ? base.imageBase : base.hrefBase;
  try {
    return new URL(normalized, baseUrl).toString();
  } catch {
    return trimmed;
  }
}
