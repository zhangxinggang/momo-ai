const URL_PREFIX_RE = /^https?:\/\//i;

/** 含协议的 URL（避免 https:// 中的 s:/ 被当成 Windows 盘符） */
const URL_SCHEME_RE = /:\/\//;

/** 代码块语言前缀（如 javascript:scripts/foo.js） */
const CODE_LANG_PREFIX_RE =
  /^(?:javascript|typescript|js|ts|python|py|bash|sh|shell|json|markdown|md|skill-run|text):/i;

/** Windows 绝对路径（排除 letter:// 形式的 URL 片段） */
const WINDOWS_ABS_PATH_RE = /^[A-Za-z]:(?:(?:\\[^\\/:\s<>"']+)+|\/(?!\/)[^\s<>"']+)$/;

/** Unix 绝对路径 */
const UNIX_ABS_PATH_RE = /^\/[^\s<>"']+$/;

/** 以 ~ 开头的路径 */
const TILDE_PATH_RE = /^~(?:[/\\][^\s<>"']+)?$/;

/** Unix 路径前须为空白或行首，避免把 scripts/foo 中的 /foo 误判为绝对路径 */
const UNIX_ABS_PATH_CANDIDATE_RE = /(?:^|[\s([{>])\/[^\s<>"']+/g;

/** Windows 盘符路径；排除 C:// 这类双斜杠 URL 形态 */
const WINDOWS_ABS_PATH_CANDIDATE_RE = /[A-Za-z]:(?:(?:\\[^\\/:\s<>"']+)+|\/(?!\/)[^\s<>"']+)/g;

const TILDE_PATH_CANDIDATE_RE = /~(?:[/\\][^\s<>"']+)?/g;

const PATH_HINT_RE = /(?:[A-Za-z]:(?:\\|\/(?!\/))|(?:^|[\s([{>])\/[^\s]|~[/\\])/;

/** 路径末尾常被模型带上的标点 / 反引号，匹配后需剥离 */
const TRAILING_PATH_PUNCT_RE = /[`'"）)」』\]}>.,;:!?。，、；：]+$/u;

const SKIP_ENHANCE_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'A']);

interface IPathMatch {
  start: number;
  end: number;
  value: string;
}

/** 去掉代码块语言前缀 */
export function stripCodeLanguagePrefix(text: string): string {
  return text.trim().replace(CODE_LANG_PREFIX_RE, '');
}

/** 剥离路径尾随标点，避免 exists 检查失败 */
export function stripTrailingPathPunctuation(pathValue: string): string {
  return pathValue.replace(TRAILING_PATH_PUNCT_RE, '');
}

function isAbsoluteLocalPathLike(text: string): boolean {
  const trimmed = stripCodeLanguagePrefix(text);
  return (
    WINDOWS_ABS_PATH_RE.test(trimmed) ||
    UNIX_ABS_PATH_RE.test(trimmed) ||
    TILDE_PATH_RE.test(trimmed)
  );
}

/** 对话中可点击的本地路径：仅绝对路径（相对路径如 scripts/foo.js 为脚本引用，非磁盘路径） */
export function isLocalPathLike(text: string): boolean {
  const trimmed = stripCodeLanguagePrefix(text);
  if (!trimmed || trimmed.length > 512) {
    return false;
  }
  if (URL_PREFIX_RE.test(trimmed) || URL_SCHEME_RE.test(trimmed)) {
    return false;
  }
  if (trimmed.includes('\n')) {
    return false;
  }
  return isAbsoluteLocalPathLike(trimmed);
}

export function isAbsoluteLocalPath(rawPath: string): boolean {
  return isAbsoluteLocalPathLike(rawPath);
}

export function joinLocalPath(basePath: string, relativePath: string): string {
  const separator = basePath.includes('\\') ? '\\' : '/';
  const normalizedBase = basePath.replace(/[\\/]+$/, '');
  const normalizedRelative = relativePath.replace(/^[\\/]+/, '').replace(/\//g, separator);
  return `${normalizedBase}${separator}${normalizedRelative}`;
}

/** 将识别到的路径规范化为可打开的值 */
export function normalizeLocalPathValue(rawPath: string): string {
  return stripTrailingPathPunctuation(stripCodeLanguagePrefix(rawPath));
}

function createLocalPathSpan(className: string, pathValue: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = className;
  span.setAttribute('data-local-path', normalizeLocalPathValue(pathValue));
  span.setAttribute('role', 'link');
  span.setAttribute('tabindex', '0');
  span.textContent = pathValue;
  return span;
}

function collectAbsolutePathMatches(content: string): IPathMatch[] {
  const matches: IPathMatch[] = [];

  const pushMatches = (pattern: RegExp) => {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null = pattern.exec(content);
    while (match) {
      const rawValue = match[0];
      const start = match.index + (rawValue.length - rawValue.trimStart().length);
      const rawMatched = content.slice(start, start + rawValue.trimStart().length);
      const value = stripTrailingPathPunctuation(rawMatched);
      const end = start + value.length;

      if (value && isLocalPathLike(value)) {
        matches.push({ start, end, value });
      }

      match = pattern.exec(content);
    }
  };

  pushMatches(WINDOWS_ABS_PATH_CANDIDATE_RE);
  pushMatches(UNIX_ABS_PATH_CANDIDATE_RE);
  pushMatches(TILDE_PATH_CANDIDATE_RE);

  matches.sort((a, b) => a.start - b.start || b.end - a.end);

  const merged: IPathMatch[] = [];
  for (const item of matches) {
    const prev = merged[merged.length - 1];
    if (prev && item.start < prev.end) {
      continue;
    }
    merged.push(item);
  }

  return merged;
}

/** 将纯文本按绝对路径片段拆分，便于渲染可点击路径 */
export function splitPlainTextByLocalPaths(
  content: string,
): Array<{ kind: 'text' | 'path'; value: string }> {
  const matches = collectAbsolutePathMatches(content);
  if (matches.length === 0) {
    return [{ kind: 'text', value: content }];
  }

  const parts: Array<{ kind: 'text' | 'path'; value: string }> = [];
  let lastIndex = 0;

  for (const item of matches) {
    if (item.start > lastIndex) {
      parts.push({ kind: 'text', value: content.slice(lastIndex, item.start) });
    }
    parts.push({ kind: 'path', value: item.value });
    lastIndex = item.end;
  }

  if (lastIndex < content.length) {
    parts.push({ kind: 'text', value: content.slice(lastIndex) });
  }

  return parts;
}

/** 为 Markdown 渲染结果中的绝对路径添加可点击标记 */
export function enhanceLocalPathElements(root: HTMLElement, className: string): void {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  let currentNode = walker.nextNode();
  while (currentNode) {
    const parent = currentNode.parentElement;
    if (
      parent &&
      !SKIP_ENHANCE_TAGS.has(parent.tagName) &&
      !parent.closest('a') &&
      !parent.closest('[data-local-path]')
    ) {
      const text = currentNode.textContent ?? '';
      if (text.trim() && PATH_HINT_RE.test(text)) {
        const parts = splitPlainTextByLocalPaths(text);
        if (parts.some((part) => part.kind === 'path')) {
          textNodes.push(currentNode as Text);
        }
      }
    }
    currentNode = walker.nextNode();
  }

  for (const textNode of textNodes) {
    const content = textNode.textContent ?? '';
    const parts = splitPlainTextByLocalPaths(content);
    const fragment = document.createDocumentFragment();

    for (const part of parts) {
      if (part.kind === 'path') {
        fragment.appendChild(createLocalPathSpan(className, part.value));
      } else {
        fragment.appendChild(document.createTextNode(part.value));
      }
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
  }
}
