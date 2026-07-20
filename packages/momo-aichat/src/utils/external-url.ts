/** 消息内 http(s) 链接识别与可点击增强 */

const HTTP_URL_RE = /https?:\/\/[^\s<>"']+/gi;

const TRAILING_PUNCT_RE = /[.,;:!?)。，；：！？]+$/;

const SKIP_ENHANCE_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'A']);

interface IUrlMatch {
  start: number;
  end: number;
  value: string;
}

/** 判断是否为允许打开的 http(s) 链接 */
export function isHttpUrl(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 2048) {
    return false;
  }
  return /^https?:\/\/[^\s<>"']+$/i.test(trimmed);
}

/** 去掉 URL 尾部常见标点（中英文句号、括号等） */
export function trimUrlTrailingPunctuation(rawUrl: string): string {
  let url = rawUrl;
  while (url.length > 0 && TRAILING_PUNCT_RE.test(url)) {
    // 保留配对括号内的闭合符，例如 https://en.wikipedia.org/wiki/AI_(disambiguation)
    const last = url[url.length - 1];
    if (last === ')') {
      const openCount = (url.match(/\(/g) || []).length;
      const closeCount = (url.match(/\)/g) || []).length;
      if (openCount >= closeCount) {
        break;
      }
    }
    url = url.slice(0, -1);
  }
  return url;
}

function collectHttpUrlMatches(content: string): IUrlMatch[] {
  const matches: IUrlMatch[] = [];
  HTTP_URL_RE.lastIndex = 0;
  let match: RegExpExecArray | null = HTTP_URL_RE.exec(content);
  while (match) {
    const rawValue = match[0];
    const trimmed = trimUrlTrailingPunctuation(rawValue);
    if (isHttpUrl(trimmed)) {
      matches.push({
        start: match.index,
        end: match.index + trimmed.length,
        value: trimmed,
      });
    }
    match = HTTP_URL_RE.exec(content);
  }
  return matches;
}

/** 将纯文本按 http(s) URL 拆分 */
export function splitPlainTextByHttpUrls(
  content: string,
): Array<{ kind: 'text' | 'url'; value: string }> {
  const matches = collectHttpUrlMatches(content);
  if (matches.length === 0) {
    return [{ kind: 'text', value: content }];
  }

  const parts: Array<{ kind: 'text' | 'url'; value: string }> = [];
  let lastIndex = 0;

  for (const item of matches) {
    if (item.start > lastIndex) {
      parts.push({ kind: 'text', value: content.slice(lastIndex, item.start) });
    }
    parts.push({ kind: 'url', value: item.value });
    lastIndex = item.end;
  }

  if (lastIndex < content.length) {
    parts.push({ kind: 'text', value: content.slice(lastIndex) });
  }

  return parts;
}

function createExternalUrlSpan(className: string, url: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = className;
  span.setAttribute('data-external-url', url);
  span.setAttribute('role', 'link');
  span.setAttribute('tabindex', '0');
  span.textContent = url;
  return span;
}

/** 为 Markdown 渲染结果中的裸 http(s) URL 添加可点击标记 */
export function enhanceExternalUrlElements(root: HTMLElement, className: string): void {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  let currentNode = walker.nextNode();
  while (currentNode) {
    const parent = currentNode.parentElement;
    if (
      parent &&
      !SKIP_ENHANCE_TAGS.has(parent.tagName) &&
      !parent.closest('a') &&
      !parent.closest('[data-external-url]') &&
      !parent.closest('[data-local-path]')
    ) {
      const text = currentNode.textContent ?? '';
      if (text.trim() && /https?:\/\//i.test(text)) {
        const parts = splitPlainTextByHttpUrls(text);
        if (parts.some((part) => part.kind === 'url')) {
          textNodes.push(currentNode as Text);
        }
      }
    }
    currentNode = walker.nextNode();
  }

  for (const textNode of textNodes) {
    const content = textNode.textContent ?? '';
    const parts = splitPlainTextByHttpUrls(content);
    const fragment = document.createDocumentFragment();

    for (const part of parts) {
      if (part.kind === 'url') {
        fragment.appendChild(createExternalUrlSpan(className, part.value));
      } else {
        fragment.appendChild(document.createTextNode(part.value));
      }
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
  }
}
