import type { ICustomToolComponentConfig } from '@/types/modules';
import type { IChatSourceRef } from '@momo/aichat';
import type { ComponentRenderProps } from '@openuidev/react-lang';
import { Button } from 'antd';
import { DownloadIcon } from 'lucide-react';
import { createContext, useContext, useState, type PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import { exportInterfaceToDocx } from './export-docx';
import { createOpenuiExportSurface } from './export-openui';

interface ExportContext {
  getSurface: () => HTMLElement | null;
  source?: string;
  components?: Record<string, ICustomToolComponentConfig>;
  sourceRefs?: IChatSourceRef[];
  toolbar?: HTMLElement | null;
  disabled?: boolean;
}
const ExportSurfaceContext = createContext<ExportContext | null>(null);

export function ExportDocxSurfaceProvider({
  getSurface,
  children,
  ...options
}: PropsWithChildren<ExportContext>) {
  return (
    <ExportSurfaceContext.Provider value={{ getSurface, ...options }}>
      {children}
    </ExportSurfaceContext.Provider>
  );
}

export function ExportDocxView({ props }: ComponentRenderProps<Record<string, unknown>>) {
  const context = useContext(ExportSurfaceContext);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileName = String(props.fileName ?? '界面内容.docx');

  const exportDocx = async () => {
    if (!context || busy || context.disabled) return;
    setBusy(true);
    setError('');
    try {
      const surface = context.source
        ? createOpenuiExportSurface(context.source, context.components, context.sourceRefs)
        : context.getSurface();
      if (!surface) throw new Error('没有可导出的分析内容。');
      await exportInterfaceToDocx(surface, fileName);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '导出失败，请重试。');
    } finally {
      setBusy(false);
    }
  };

  const button = (
    <div data-export-ignore='true'>
      <Button
        disabled={context?.disabled}
        icon={<DownloadIcon size={15} />}
        loading={busy}
        onClick={() => void exportDocx()}>
        {String(props.label ?? '导出 DOCX')}
      </Button>
      {error ? <span role='alert'> {error}</span> : null}
    </div>
  );
  // The report declares the action; the host places it outside the content frame.
  return context?.toolbar ? createPortal(button, context.toolbar) : null;
}
