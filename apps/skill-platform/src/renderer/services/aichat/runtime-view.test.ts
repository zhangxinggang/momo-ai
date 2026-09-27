import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateGeneratedView } from '../custom-tool/generation';
import { projectRuntimeView, runtimeViewNotes } from './runtime-view';

describe('generic runtime UI projection', () => {
  it('renders unrelated skill output using nested tabs and a file preview', () => {
    const source =
      'root = Stack([view])\nview = Tabs([first, second])\nfirst = TabItem("one", "库存", [pane])\nsecond = TabItem("two", "人员", [other])\npane = SplitPane([nested], [preview], 60)\nnested = Tabs([detail], "pill")\ndetail = TabItem("detail", "动态分组", [body])\nbody = PlainText("真实内容\\n<script>literal</script>")\nother = TextContent("其他内容")\npreview = FilePreview("source:inventory", 500)';
    expect(validateGeneratedView(source, 'openui')).toBeNull();
    expect(
      projectRuntimeView(`已读取文件。\n\n\`\`\`openui\n${source}\n\`\`\`\n覆盖说明。`, false),
    ).toEqual({ kind: 'openui', content: source, status: 'complete' });
  });

  it('keeps streaming partial source and reports unresolved final references', () => {
    const content = '```openui\nroot = Stack([pending])';
    expect(projectRuntimeView(content, true)?.status).toBe('generating');
    expect(projectRuntimeView(content + '\n```', false)).toMatchObject({
      status: 'error',
      errorMessage: expect.stringContaining('pending'),
    });
    expect(projectRuntimeView('普通分析结果', false)).toBeUndefined();
    expect(projectRuntimeView('```html\n<div>原文</div>\n```', false)).toBeUndefined();
  });

  it('rejects ambiguous multiple interfaces', () => {
    expect(
      projectRuntimeView(
        '```openui\nroot = TextContent("1")\n```\n```openui\nroot = TextContent("2")\n```',
        false,
      )?.status,
    ).toBe('error');
  });

  it('preserves coverage notes and artifact links beside the UI without repeating its source', () => {
    const notes = '覆盖：已读取正文。\n\n[分析数据](/workspace/analysis.json)';
    expect(runtimeViewNotes('```openui\nroot = TextContent("报告")\n```\n' + notes)).toBe(notes);
    expect(runtimeViewNotes('已读取正文。\n```openui\nroot = Stack([pending])')).toBe(
      '已读取正文。',
    );
    expect(runtimeViewNotes('root = TextContent("报告")')).toBe('');
  });
});

describe('skill-owned tender OpenUI projection', () => {
  it('projects full-width analysis and extracted Word templates without a right-hand original preview', () => {
    const work = mkdtempSync(path.join(tmpdir(), 'momo-tender-openui-'));
    const skill = path.resolve('../../.cursor/skills/tender-document-parser/scripts');
    try {
      const dataPath = path.join(work, 'analysis.json');
      const outputPath = path.join(work, 'report.openui');
      execFileSync('python', [path.join(skill, 'render_report.py'), '--init', dataPath]);
      const data = JSON.parse(readFileSync(dataPath, 'utf8'));
      data.document_title = '测试用采购文件';
      data.source_files = ['测试文件.pdf', '补充文件.docx'];
      data.coverage = {
        status: 'partial',
        summary: '已读取测试正文',
        unread: ['补充文件.docx 附件2'],
      };
      const evidence = [
        { file: data.source_files[0], locator: '第2页', quote: '测试原文：接口响应≤2秒' },
      ];
      data.modules[1].sections = [
        {
          id: 'custom-interfaces',
          title: '本次文件的接口要求',
          blocks: [
            {
              kind: 'table',
              columns: ['接口', '响应', '备注'],
              rows: [
                { cells: ['数据服务', '≤2秒', ['UTF-8', '多行字段']], basis: 'explicit', evidence },
              ],
            },
          ],
        },
      ];
      data.modules[8].sections = [
        {
          id: 'custom-form',
          title: '本次附件格式',
          blocks: [
            {
              kind: 'template',
              document: {
                name: '报价表.docx',
                source_id: 'artifact:template',
                extraction: 'native-docx',
              },
              basis: 'explicit',
              evidence,
            },
          ],
        },
      ];
      writeFileSync(dataPath, JSON.stringify(data));
      execFileSync('python', [
        path.join(skill, 'render_openui.py'),
        '--data',
        dataPath,
        '--out',
        outputPath,
      ]);
      const output = readFileSync(outputPath, 'utf8');
      expect(validateGeneratedView(output, 'openui')).toBeNull();
      for (const title of data.modules.map((module: { title: string }) => module.title))
        expect(output).toContain(title);
      expect(output).toContain('本次文件的接口要求');
      expect(output).toContain('FilePreview("artifact:template", 800)');
      expect(output).not.toContain('SplitPane');
      expect(output).not.toContain('source:one');
      expect(output).not.toContain('source:two');
      expect(output).toContain('接口响应≤2秒');
      expect(output).toContain('待核验');
      expect(output).not.toContain('内容由 AI 大模型生成');
      delete data.modules[8].sections[0].blocks[0].document.source_id;
      writeFileSync(dataPath, JSON.stringify(data));
      expect(() =>
        execFileSync(
          'python',
          [path.join(skill, 'render_openui.py'), '--data', dataPath, '--out', outputPath],
          { stdio: 'pipe' },
        ),
      ).toThrow();
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  });
});
