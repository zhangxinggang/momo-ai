/** 在已加载的 iframe 中读取渲染后的正文，不重新请求网页。 */
export const READ_WEB_PAGE_SCRIPT = `(() => {
  const source = document.querySelector('article') || document.querySelector('main') || document.body;
  if (!source) throw new Error('网页尚未加载完成');
  const excluded = 'script, style, noscript, svg, canvas, iframe, input, textarea, select, button, [hidden], [aria-hidden="true"]';
  const walker = document.createTreeWalker(source, NodeFilter.SHOW_TEXT);
  const parts = [];
  let current;
  while ((current = walker.nextNode())) {
    const element = current.parentElement;
    if (!element || element.closest(excluded)) continue;
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || element.getClientRects().length === 0) continue;
    const text = current.textContent.trim();
    if (text) parts.push(text);
  }
  const text = parts.join('\\n').replace(/\\n{3,}/g, '\\n\\n').trim();
  return { url: location.href, title: document.title, content: text.slice(0, 60000), truncated: text.length > 60000 };
})()`;

export function getHttpUrl(value: string): URL {
  const url = new URL(value);
  if (url.protocol !== 'http:' && url.protocol !== 'https:')
    throw new Error('网页地址仅支持 HTTP 或 HTTPS');
  return url;
}
