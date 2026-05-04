import type { MenuProps } from 'antd';
import { App, Button, Dropdown } from 'antd';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { DownloadIcon } from 'lucide-react';

interface IProps {
  filePath: string;
  content: string;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function baseNameFromPath(filePath: string): string {
  const parts = filePath.split(/[/\\]/);
  const name = parts[parts.length - 1] || 'note';
  return name.replace(/\.[^.]+$/, '') || 'note';
}

/** 笔记导出：Markdown / DOCX / PDF */
export function NoteExportMenu({ filePath, content }: IProps) {
  const { message } = App.useApp();
  const stem = baseNameFromPath(filePath);

  const handleExportMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, `${stem}.md`);
    message.success('已导出 Markdown');
  };

  const handleExportDocx = async () => {
    try {
      const lines = content.split('\n');
      const doc = new Document({
        sections: [
          {
            children: lines.map(
              (line) =>
                new Paragraph({
                  children: [new TextRun(line || ' ')],
                }),
            ),
          },
        ],
      });
      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, `${stem}.docx`);
      message.success('已导出 DOCX');
    } catch (e: unknown) {
      message.error((e as Error)?.message || '导出 DOCX 失败');
    }
  };

  const handleExportPdf = async () => {
    if (typeof window.api?.note?.exportPdf !== 'function') {
      message.error('PDF 导出 API 不可用，请完全重启应用后再试');
      return;
    }
    try {
      const result = await window.api.note.exportPdf({
        title: stem,
        content,
        defaultName: stem,
      });
      if (result.canceled) {
        return;
      }
      if (result.success) {
        message.success('已导出 PDF');
        return;
      }
      message.error('导出 PDF 失败');
    } catch (e: unknown) {
      message.error((e as Error)?.message || '导出 PDF 失败');
    }
  };

  const items: MenuProps['items'] = [
    { key: 'md', label: '导出 Markdown', onClick: handleExportMarkdown },
    { key: 'docx', label: '导出 DOCX', onClick: () => void handleExportDocx() },
    { key: 'pdf', label: '导出 PDF', onClick: () => void handleExportPdf() },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <Button className='border-border text-muted-foreground hover:text-foreground inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs'>
        <DownloadIcon className='h-3.5 w-3.5' />
        导出
      </Button>
    </Dropdown>
  );
}
