import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { READ_WEB_PAGE_SCRIPT } from './webpage-content';

describe('webpage context', () => {
  function read(html: string) {
    const dom = new JSDOM(html, {
      url: 'https://example.com/articles/one',
      runScripts: 'outside-only',
    });
    Object.defineProperty(dom.window.HTMLElement.prototype, 'getClientRects', {
      value: () => [{}],
    });
    const result = dom.window.eval(READ_WEB_PAGE_SCRIPT);
    dom.window.close();
    return result;
  }

  it('reads article text and current URL/title, excludes scripts, hidden text and input', () => {
    const result = read(
      '<title>文章</title><link rel="icon" href="/site.svg"><nav>菜单</nav><article><h1>文章标题</h1><p>动态加载的正文</p><script>secret script</script><input value="private input"><div hidden>hidden content</div><p style="display:none">invisible</p></article>',
    );
    expect(result).toMatchObject({
      url: 'https://example.com/articles/one',
      title: '文章',
      content: '文章标题\n动态加载的正文',
      truncated: false,
    });
  });

  it('falls back to body for tools and bounds long article context', () => {
    expect(read('<body>网页工具说明</body>').content).toBe('网页工具说明');
    const result = read(`<article>${'字'.repeat(60001)}</article>`);
    expect(result.content).toHaveLength(60000);
    expect(result.truncated).toBe(true);
  });
});
