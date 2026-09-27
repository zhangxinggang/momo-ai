import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const projectMarkdownRenderer = vi.hoisted(() => vi.fn());
vi.mock('@momo/file-editor', () => ({ BinaryFilePreview: () => null }));
vi.mock('@renderer/services/agent-runtime/client', () => ({
  harnessSourceStore: { load: vi.fn() },
}));
vi.mock('@renderer/services/system', () => ({ fetchFilePreviewBaseUrl: vi.fn() }));

vi.mock('@renderer/components/ui/MarkdownPreview', async () => {
  const { createElement } = await import('react');
  return {
    MarkdownPreview: (props: { value: string; theme: string; previewTheme: string }) => {
      projectMarkdownRenderer(props);
      return createElement('div', { 'data-project-markdown': props.value });
    },
  };
});

import { CustomToolOpenUIPreview } from '.';

describe('CustomToolOpenUIPreview', () => {
  it.each([
    'root = FileInput("tender", "选择招标文件", ".pdf,.docx", true)',
    'root = TextArea("tender", "粘贴招标文件内容或上传附件")',
  ])('renders file selection for new fields and legacy upload placeholders: %s', (content) => {
    const html = renderToStaticMarkup(
      createElement(CustomToolOpenUIPreview, {
        content,
        title: '文件字段',
        components: {},
        presentation: 'chat',
      }),
    );
    expect(html).toContain('type="file"');
    expect(html).not.toContain('<textarea');
    expect(html).not.toContain('type="text"');
  });
  it('routes generated Markdown tables through the project Markdown renderer', () => {
    const content =
      'root = MarkDownRenderer("### 性能基准\\n\\n| 指标项 | 要求值 |\\n| --- | --- |\\n| 并发用户数 | ≥ 5,000 |", "sunk")';

    const html = renderToStaticMarkup(
      createElement(CustomToolOpenUIPreview, {
        content,
        title: '测试工具',
        components: {},
      }),
    );

    expect(html).toContain('data-project-markdown');
    expect(projectMarkdownRenderer).toHaveBeenCalledWith({
      value: '### 性能基准\n\n| 指标项 | 要求值 |\n| --- | --- |\n| 并发用户数 | ≥ 5,000 |',
      theme: 'dark',
      previewTheme: 'default',
    });
  });

  it('uses light presentation and literal document text for chat views', () => {
    const html = renderToStaticMarkup(
      createElement(CustomToolOpenUIPreview, {
        content:
          'root = Stack([tabs])\ntabs = Tabs([one, two])\none = TabItem("one", "第一组", [text])\ntwo = TabItem("two", "第二组", [other])\ntext = PlainText("<script>literal</script>")\nother = PlainText("第二组内容")',
        title: '通用报告',
        components: {},
        presentation: 'chat',
      }),
    );
    expect(html).toContain('role="tablist"');
    expect(html).toContain('&lt;script&gt;literal&lt;/script&gt;');
    expect(html).not.toContain('第二组内容');
  });
});
