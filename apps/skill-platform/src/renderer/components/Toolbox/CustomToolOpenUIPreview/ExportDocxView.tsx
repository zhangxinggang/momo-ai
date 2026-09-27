import { Button } from 'antd';
import { DownloadIcon } from 'lucide-react';
import { createContext, useContext, useState, type PropsWithChildren } from 'react';
import type { ComponentRenderProps } from '@openuidev/react-lang';
import { exportVisibleInterfaceToDocx } from './export-docx';

const ExportSurfaceContext = createContext<(() => HTMLElement | null) | null>(null);

export function ExportDocxSurfaceProvider({
  getSurface,
  children,
}: PropsWithChildren<{ getSurface: () => HTMLElement | null }>) {
  return <ExportSurfaceContext.Provider value={getSurface}>{children}</ExportSurfaceContext.Provider>;
}

export function ExportDocxView({ props }: ComponentRenderProps<Record<string, unknown>>) {
  const getSurface = useContext(ExportSurfaceContext);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileName = String(props.fileName ?? '界面内容.docx');

  const exportDocx = async () => {
    const surface = getSurface?.();
    if (!surface || busy) return;
    setBusy(true);
    setError('');
    try {
      await exportVisibleInterfaceToDocx(surface, fileName);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '导出失败，请重试。');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-export-ignore='true'>
      <Button icon={<DownloadIcon size={15} />} loading={busy} onClick={() => void exportDocx()}>
        {String(props.label ?? '导出 DOCX')}
      </Button>
      {error ? <span role='alert'> {error}</span> : null}
    </div>
  );
}
