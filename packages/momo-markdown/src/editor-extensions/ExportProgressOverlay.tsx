import { memo } from 'react';
import { createPortal } from 'react-dom';

import type { IExportProgress } from './export-utils';

interface IProps {
  progress: IExportProgress | null;
}

/** 导出时全屏蒙版：居中转圈 + 文案 */
function ExportProgressOverlay({ progress }: IProps) {
  if (!progress) {
    return null;
  }

  return createPortal(
    <div className='md-editor-export-progress' role='status' aria-live='polite' aria-busy='true'>
      <div className='md-editor-export-progress-panel'>
        <span className='md-editor-export-progress-spinner' aria-hidden='true' />
        <span className='md-editor-export-progress-text'>{progress.message || '正在导出'}</span>
      </div>
    </div>,
    document.body,
  );
}

export default memo(ExportProgressOverlay);
