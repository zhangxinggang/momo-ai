import { FileTextOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

import { getNoteMentionDisplayPath, parseWorkspaceMentionPath } from '../../utils/note-mention';
import styles from './index.module.less';
import type { IProps } from './types';

export function NoteReferenceChip(props: IProps) {
  const { path, measureText, showTooltip = true, className, onOpen } = props;
  const displayPath = getNoteMentionDisplayPath(path);
  const referenceLabel = parseWorkspaceMentionPath(path) ? '工作区文件引用' : '笔记引用';

  const chipNode = measureText ? (
    <span className={`${styles['chip-mirror']} ${className ?? ''}`}>
      <span className={styles['chip-measure']}>{measureText}</span>
      <span className={styles['chip-mirror-overlay']}>
        <FileTextOutlined className={styles['chip-mirror-icon']} />
        <span className={styles['chip-mirror-label']}>{displayPath}</span>
      </span>
    </span>
  ) : (
    <span
      className={`${styles.chip} ${className ?? ''}`}
      role={onOpen ? 'link' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (onOpen && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onOpen();
        }
      }}
      style={onOpen ? { cursor: 'pointer' } : undefined}>
      <FileTextOutlined className={styles['chip-icon']} />
      <span className={styles['chip-label']}>{displayPath}</span>
    </span>
  );

  if (!showTooltip || measureText) {
    return chipNode;
  }

  return <Tooltip title={referenceLabel}>{chipNode}</Tooltip>;
}
