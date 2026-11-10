import { reportSchema, type ToolReport } from '@/shared/tool-page';
import { exportInterfaceToDocx } from '../CustomToolOpenUIPreview/export-docx';

/** Build the full semantic document from data, independent of the selected tabs. */
export function reportExportSurface(report: ToolReport): HTMLElement {
  const surface = document.createElement('article');
  const add = (tag: string, text: string, parent: HTMLElement = surface) => {
    const node = document.createElement(tag);
    node.textContent = text;
    parent.append(node);
    return node;
  };
  add('h1', report.title);
  add('p', report.summary);
  for (const section of report.sections) {
    add('h2', section.title);
    if (!section.groups.length) add('p', section.emptyMessage);
    for (const group of section.groups) {
      add('h3', group.title);
      for (const block of group.blocks) {
        if (block.title) add('h4', block.title);
        if (block.type === 'table') {
          const table = add('table', '');
          const head = add('tr', '', add('thead', '', table));
          [...block.columns, '出处'].forEach((label) => add('th', label, head));
          const body = add('tbody', '', table);
          for (const row of block.rows) {
            const tr = add('tr', '', body);
            [...row.cells, row.source].forEach((value) => add('td', value, tr));
          }
        } else {
          add(
            'p',
            block.type === 'text'
              ? block.text
              : `模板文件：${block.title}（原文件可在报告中单独下载）`,
          );
          if (block.source) add('p', `出处：${block.source}`);
        }
      }
    }
  }
  return surface;
}
export async function exportToolReport(value: unknown) {
  const report = reportSchema.parse(value);
  await exportInterfaceToDocx(
    reportExportSurface(report),
    `${report.title.replace(/[<>:"/\\|?*]/g, '_')}.docx`,
  );
}
