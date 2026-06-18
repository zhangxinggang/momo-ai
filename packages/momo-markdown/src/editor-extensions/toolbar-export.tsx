import { Download } from 'lucide-react';
import { memo, useCallback, useContext, useMemo, useState } from 'react';

import DropdownToolbar from '../components/DropdownToolbar';
import { EditorContext } from '../components/MdEditor/context';
import ExportProgressOverlay from './ExportProgressOverlay';
import {
  buildExportProgress,
  downloadBlob,
  resolveExportBasename,
  type IExportProgress,
} from './export-utils';

export interface IMarkdownExportContext {
  title: string;
  content: string;
  defaultName: string;
  theme: 'light' | 'dark';
  previewTheme: string;
  codeTheme: string;
  language: string;
  onProgress?: (progress: IExportProgress) => void;
}

export interface IExportPdfHandler {
  (params: IMarkdownExportContext): Promise<{
    canceled?: boolean;
    success?: boolean;
  }>;
}

export interface IExportDocxHandler {
  (params: IMarkdownExportContext): Promise<void>;
}

interface IProps {
  title?: string;
  disabled?: boolean;
  showToolbarName?: boolean;
  modelValue?: string;
  exportTitle?: string;
  onExportPdf?: IExportPdfHandler;
  onExportDocx?: IExportDocxHandler;
}

/** 导出下拉工具栏：Markdown / PDF / DOCX（鼠标移入展开） */
function ToolbarExport({
  title = '导出',
  disabled,
  showToolbarName,
  modelValue = '',
  exportTitle = 'document',
  onExportPdf,
  onExportDocx,
}: IProps) {
  const { theme, previewTheme, codeTheme, language } = useContext(EditorContext);
  const [visible, setVisible] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<IExportProgress | null>(null);
  const stem = resolveExportBasename(exportTitle);

  const handleExportProgress = useCallback((progress: IExportProgress) => {
    setExportProgress(progress);
  }, []);

  const buildExportContext = useCallback((): IMarkdownExportContext => {
    return {
      title: stem,
      content: modelValue,
      defaultName: stem,
      theme: theme as 'light' | 'dark',
      previewTheme: String(previewTheme),
      codeTheme: String(codeTheme),
      language: language ?? 'zh-CN',
      onProgress: handleExportProgress,
    };
  }, [codeTheme, handleExportProgress, language, modelValue, previewTheme, stem, theme]);

  const handleExportMarkdown = useCallback(() => {
    const blob = new Blob([modelValue], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, `${stem}.md`);
    setVisible(false);
  }, [modelValue, stem]);

  const handleExportPdf = useCallback(async () => {
    if (!onExportPdf || exporting) {
      return;
    }
    setExporting(true);
    setExportProgress(buildExportProgress('preparing', '正在准备导出...'));
    try {
      await onExportPdf(buildExportContext());
      setVisible(false);
    } finally {
      setExporting(false);
      setExportProgress(null);
    }
  }, [buildExportContext, exporting, onExportPdf]);

  const handleExportDocx = useCallback(async () => {
    if (!onExportDocx || exporting) {
      return;
    }
    setExporting(true);
    setExportProgress(buildExportProgress('preparing', '正在准备导出...'));
    try {
      await onExportDocx(buildExportContext());
      setVisible(false);
    } finally {
      setExporting(false);
      setExportProgress(null);
    }
  }, [buildExportContext, exporting, onExportDocx]);

  const overlay = useMemo(
    () => (
      <ul className='md-editor-export-menu'>
        <li>
          <button disabled={exporting} type='button' onClick={handleExportMarkdown}>
            Markdown
          </button>
        </li>
        <li>
          <button
            disabled={!onExportPdf || exporting}
            type='button'
            onClick={() => void handleExportPdf()}>
            PDF
          </button>
        </li>
        <li>
          <button
            disabled={!onExportDocx || exporting}
            type='button'
            onClick={() => void handleExportDocx()}>
            DOCX
          </button>
        </li>
      </ul>
    ),
    [exporting, handleExportDocx, handleExportMarkdown, handleExportPdf, onExportDocx, onExportPdf],
  );

  return (
    <>
      <ExportProgressOverlay progress={exportProgress} />
      <DropdownToolbar
        disabled={disabled || exporting}
        overlay={overlay}
        title={title}
        visible={visible}
        onChange={setVisible}
        trigger={
          <>
            <Download className='md-editor-icon' size={16} />
            {showToolbarName ? <div className='md-editor-toolbar-item-name'>{title}</div> : null}
          </>
        }
      />
    </>
  );
}

export default memo(ToolbarExport);
