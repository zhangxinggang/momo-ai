import { FileViewer } from '@file-viewer/react';
import { Button } from 'antd';
import { ExternalLinkIcon, Loader2Icon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { cloneArrayBuffer } from '../../utils/file-content';
import {
  buildFileViewerPreviewOptions,
  isFileViewerSupportedFile,
} from '../../utils/file-viewer-config';
import { getBaseName } from '../../utils/path';

interface IProps {
  relativePath: string;
  buffer: ArrayBuffer | null;
  isLoading: boolean;
  /** 二进制预览 Worker/WASM 等静态资源根 URL，由宿主注入 */
  filePreviewBaseUrl?: string;
  /** 当前环境无法预览时，由宿主提供「使用默认应用打开」等能力 */
  onUnSupport?: (relativePath: string) => void;
}

/**
 * FileViewer loads a source when its controller mounts and its React adapter
 * immediately calls update with the same source. Delay supplying the file until
 * the empty controller has mounted so a DOCX render starts only once. This also
 * keeps React StrictMode's development remounts from leaving stale page batches.
 */
function SingleLoadFileViewer({
  file,
  fileName,
  options,
}: {
  file: File;
  fileName: string;
  options: ReturnType<typeof buildFileViewerPreviewOptions>;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return <FileViewer file={ready ? file : undefined} name={fileName} options={options} />;
}

/** 二进制文件预览（基于 @file-viewer/react + preset-all 全格式 renderer） */
export function BinaryFilePreview(props: IProps) {
  const { relativePath, buffer, isLoading, filePreviewBaseUrl, onUnSupport } = props;
  const fileName = getBaseName(relativePath);
  const isSupported = useMemo(() => isFileViewerSupportedFile(fileName), [fileName]);
  const viewerOptions = useMemo(
    () => buildFileViewerPreviewOptions(filePreviewBaseUrl),
    [filePreviewBaseUrl],
  );

  // FileViewer 内部更新可能重复读取；使用 File 保证每次读取都得到独立 ArrayBuffer。
  const previewFile = useMemo(() => {
    if (!buffer) {
      return undefined;
    }
    const clonedBuffer = cloneArrayBuffer(buffer);
    return new File([clonedBuffer], fileName, { type: 'application/octet-stream' });
  }, [buffer, fileName, relativePath]);

  const unsupportedPreview = (
    <div className='momo-file-editor__binary-preview'>
      <div className='momo-file-editor__binary-preview-empty'>
        <span>{'当前环境不支持预览此文件'}</span>
        {onUnSupport ? (
          <Button
            icon={<ExternalLinkIcon style={{ width: '0.875rem', height: '0.875rem' }} />}
            onClick={() => onUnSupport(relativePath)}
            type='default'>
            {'使用默认应用打开'}
          </Button>
        ) : null}
      </div>
    </div>
  );

  if (!isSupported) {
    return unsupportedPreview;
  }

  if (isLoading) {
    return (
      <div className='momo-file-editor__binary-preview'>
        <div className='momo-file-editor__binary-preview-loading'>
          <Loader2Icon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          {'正在加载预览…'}
        </div>
      </div>
    );
  }

  if (!previewFile) {
    return unsupportedPreview;
  }

  return (
    <div className='momo-file-editor__binary-preview'>
      <div className='momo-file-editor__binary-preview-viewer'>
        <SingleLoadFileViewer
          key={relativePath}
          file={previewFile}
          fileName={fileName}
          options={viewerOptions}
        />
      </div>
    </div>
  );
}
