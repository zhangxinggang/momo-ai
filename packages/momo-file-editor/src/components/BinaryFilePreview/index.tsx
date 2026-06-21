import { FileViewer } from '@file-viewer/react';
import { Loader2Icon } from 'lucide-react';
import { useMemo } from 'react';

import { cloneArrayBuffer } from '../../utils/file-content';
import { buildFileViewerPreviewOptions } from '../../utils/file-viewer-config';
import { getBaseName } from '../../utils/path';

interface IProps {
  relativePath: string;
  buffer: ArrayBuffer | null;
  isLoading: boolean;
  /** 二进制预览 Worker/WASM 等静态资源根 URL，由宿主注入 */
  filePreviewBaseUrl?: string;
}

/** 二进制文件预览（基于 @file-viewer/react + preset-all 全格式 renderer） */
export function BinaryFilePreview(props: IProps) {
  const { relativePath, buffer, isLoading, filePreviewBaseUrl } = props;
  const fileName = getBaseName(relativePath);
  const viewerOptions = useMemo(
    () => buildFileViewerPreviewOptions(filePreviewBaseUrl),
    [filePreviewBaseUrl],
  );

  // 使用 File 而非 buffer：FileViewer 挂载时会触发两次 load，file.arrayBuffer() 每次返回新副本
  const previewFile = useMemo(() => {
    if (!buffer) {
      return undefined;
    }
    const clonedBuffer = cloneArrayBuffer(buffer);
    return new File([clonedBuffer], fileName, { type: 'application/octet-stream' });
  }, [buffer, fileName, relativePath]);

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
    return (
      <div className='momo-file-editor__binary-preview'>
        <div className='momo-file-editor__binary-preview-empty'>{'当前环境不支持预览此文件'}</div>
      </div>
    );
  }

  return (
    <div className='momo-file-editor__binary-preview'>
      <div className='momo-file-editor__binary-preview-viewer'>
        <FileViewer key={relativePath} file={previewFile} name={fileName} options={viewerOptions} />
      </div>
    </div>
  );
}
