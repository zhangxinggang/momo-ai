import { describe, expect, it } from 'vitest';
import {
  parseToolResult,
  splitToolPage,
  toolResultPrompt,
  type ToolPageAction,
  type ToolReport,
} from './tool-page';

export const reportFixture = (): ToolReport => ({
  title: '设备采购分析',
  summary: '已覆盖本次文件',
  sections: Array.from({ length: 10 }, (_, i) => ({
    id: `section-${i}`,
    title: `模块${i + 1}`,
    emptyMessage: '原文未提及',
    groups: [
      {
        id: 'first',
        title: `首组${i}`,
        blocks: [
          {
            type: 'text',
            text: `正文${i}\n下一行 <script>原文</script>`,
            source: `文件.docx · 第${i + 1}页`,
          },
        ],
      },
      {
        id: 'last',
        title: `末组${i}`,
        blocks: [
          {
            type: 'table',
            columns: ['要求', '说明'],
            rows: Array.from({ length: 27 }, (_, j) => ({
              cells: [`条款${i}-${j}`, '内容<&>🙂'],
              source: `原文依据${i}-${j}`,
            })),
          },
        ],
      },
    ],
  })),
});
const action: ToolPageAction = {
  capability: 'model.generate',
  title: '分析',
  instruction: '真实分析',
  result: 'report',
};
describe('separate page and action contracts', () => {
  it('extracts execution config without leaving instructions in the page', () => {
    const source = `<html><body><button>分析</button><script type="application/json" id="momo-actions">${JSON.stringify({ analyze: action })}</script></body></html>`;
    const page = splitToolPage(source);
    expect(page.actions).toEqual({ analyze: action });
    expect(page.content).not.toContain('真实分析');
    expect(page.content).toContain('<button>分析</button>');
    expect(() => splitToolPage(source.replace('model.generate', 'arbitrary.execute'))).toThrow(
      '执行配置',
    );
  });
  it('validates every section and table without accepting page code as a report', () => {
    const report = reportFixture();
    const requiredSections = report.sections.map(({ id, title }) => ({ id, title }));
    expect(parseToolResult(JSON.stringify(report), { ...action, requiredSections })).toEqual(
      report,
    );
    expect(() =>
      parseToolResult(JSON.stringify({ ...report, sections: report.sections.slice(1) }), {
        ...action,
        requiredSections,
      }),
    ).toThrow('缺少');
    expect(() => parseToolResult('<html>假结果</html>', action)).toThrow('数据不完整');
    const broken = reportFixture();
    (broken.sections[0].groups[1].blocks[0] as any).rows[0].cells = [];
    expect(() => parseToolResult(JSON.stringify(broken), action)).toThrow('结构不完整');
    expect(toolResultPrompt(action)).toContain('resultSourceId');
    expect(toolResultPrompt(action)).not.toContain('基础信息');
  });
});
