// @vitest-environment jsdom
import type { ToolReport } from '@/shared/tool-page';
import { Packer } from 'docx';
import { strFromU8, unzipSync } from 'fflate';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { createInterfaceDocx } from '../CustomToolOpenUIPreview/export-docx';
import { ReportView } from './ReportView';
import { reportExportSurface } from './report-export';
vi.mock('../CustomToolOpenUIPreview/WorkspaceComponents', () => ({ FilePreviewView: () => null }));
const report: ToolReport = {
  title: '采购分析',
  summary: '仅供验证的报告',
  sections: Array.from({ length: 10 }, (_, i) => ({
    id: `s${i}`,
    title: `模块${i}`,
    emptyMessage: '未提及',
    groups: [
      { id: 'first', title: `首组${i}`, blocks: [{ type: 'text', text: `首组正文${i}` }] },
      {
        id: 'last',
        title: `末组${i}`,
        blocks: [
          {
            type: 'table',
            columns: ['要求'],
            rows: Array.from({ length: 27 }, (_, j) => ({
              cells: [`条款${i}-${j}\n下一行<&>`],
              source: `出处${i}-${j}`,
            })),
          },
        ],
      },
    ],
  })),
};
it('switches both navigation levels and exports every module, group and row independently of selection', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(ReportView, { report })));
    const click = async (label: string) =>
      act(async () => {
        (
          [...host.querySelectorAll('button')].find(
            (button) => button.textContent === label,
          ) as HTMLButtonElement
        ).click();
      });
    await click('模块9');
    await click('末组9');
    expect(host.textContent).toContain('条款9-26');
    expect(host.querySelectorAll('th')).toHaveLength(2);
    expect(host.querySelectorAll('td')[1].textContent).toBe('出处9-0');
    const bytes = await Packer.toBuffer(
      createInterfaceDocx(reportExportSurface(report), '完整报告.docx'),
    );
    const xml = new DOMParser().parseFromString(
      strFromU8(unzipSync(bytes)['word/document.xml']),
      'application/xml',
    );
    for (let i = 0; i < 10; i++) {
      expect(xml.documentElement.textContent).toContain(`模块${i}`);
      expect(xml.documentElement.textContent).toContain(`首组正文${i}`);
      expect(xml.documentElement.textContent).toContain(`条款${i}-26`);
      expect(xml.documentElement.textContent).toContain(`出处${i}-26`);
    }
    expect(xml.getElementsByTagName('w:tbl')).toHaveLength(10);
    expect(xml.getElementsByTagName('w:tblHeader')).toHaveLength(10);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
