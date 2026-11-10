// @vitest-environment jsdom
import { Packer } from 'docx';
import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { createInterfaceDocx } from './export-docx';
import { createOpenuiExportSurface } from './export-openui';

const modules = [
  '基础信息',
  '技术参数要求',
  '潜在风险',
  '废标项',
  '投标人资格要求',
  '评标标准',
  '投标文件要求',
  '应标所需文件',
  '投标文件模板',
  '智能问答',
];

function report() {
  const lines = [
    `root = Stack([download, tabs])`,
    'download = ExportDocx("完整报告.docx")',
    `tabs = Tabs([${modules.map((_, i) => `module${i}`).join(', ')}])`,
  ];
  modules.forEach((title, i) => {
    lines.push(
      `module${i} = TabItem("m${i}", ${JSON.stringify(title)}, [nested${i}])`,
      `nested${i} = Tabs([section${i}, extra${i}], "pill")`,
      `section${i} = TabItem("s", "章节${i}", [text${i}])`,
      `extra${i} = TabItem("extra", "未选中章节${i}", [more${i}])`,
      `text${i} = PlainText("正文${i}：第一行\\n第二行")`,
      `more${i} = PlainText("未选中正文${i}")`,
    );
  });
  lines[0] = 'root = Stack([download, tabs, table, template])';
  lines.push(
    'table = Table([content, evidence])',
    `content = Col("要求", ${JSON.stringify(Array.from({ length: 27 }, (_, i) => `条款${i}\n特殊字符<&>🙂`))})`,
    `evidence = Col("出处", ${JSON.stringify(Array.from({ length: 27 }, (_, i) => `采购文件.docx · 正文块${i}`))})`,
    'template = FilePreview("artifact:template", 800)',
  );
  return lines.join('\n');
}

describe('complete report DOCX export', () => {
  it('exports all ten modules, every nested tab and all rows with structured Word formatting', async () => {
    const surface = createOpenuiExportSurface(report(), {}, [
      { sourceId: 'artifact:template', name: '原版报价表.docx' } as never,
    ]);
    const bytes = await Packer.toBuffer(createInterfaceDocx(surface, '完整报告.docx'));
    const files = unzipSync(bytes);
    const xml = new DOMParser().parseFromString(
      strFromU8(files['word/document.xml']),
      'application/xml',
    );
    const text = xml.documentElement.textContent!;
    for (const [index, title] of modules.entries()) {
      expect(text).toContain(title);
      expect(text).toContain(`章节${index}`);
      expect(text).toContain(`未选中章节${index}`);
      expect(text).toContain(`未选中正文${index}`);
    }
    expect(text).toContain('条款26');
    expect(text).toContain('采购文件.docx · 正文块26');
    expect(text).toContain('原版报价表.docx');
    expect(text).not.toContain('导出 DOCX');
    expect(xml.getElementsByTagName('w:tr')).toHaveLength(28);
    expect(xml.getElementsByTagName('w:tblHeader')).toHaveLength(1);
    expect(xml.getElementsByTagName('w:br').length).toBeGreaterThan(30);
    expect(xml.getElementsByTagName('w:tblLayout')[0].getAttribute('w:type')).toBe('fixed');
    expect(xml.getElementsByTagName('w:pgSz')[0].getAttribute('w:w')).toBe('11906');
    expect(strFromU8(files['word/styles.xml'])).toContain('Microsoft YaHei');
  });

  it('fails explicitly for incomplete reports instead of downloading a partial document', () => {
    expect(() => createOpenuiExportSurface('root = Stack([missing])')).toThrow('完整报告');
  });

  it('exports the current static component edits and preserves quotation text literally', () => {
    const surface = createOpenuiExportSurface('root = PlainText("原内容")', {
      root: { props: { text: '<script>原文</script>\n编辑后内容' } } as never,
    });
    expect(surface.textContent).toBe('<script>原文</script>\n编辑后内容');
    expect(surface.querySelector('script')).toBeNull();
  });
});
