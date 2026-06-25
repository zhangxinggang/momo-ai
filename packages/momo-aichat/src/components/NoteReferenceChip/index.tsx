import { FileTextOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

import { getNoteMentionDisplayPath } from '../../utils/note-mention';
import styles from './index.module.less';
import type { IProps } from './types';

export function NoteReferenceChip(props: IProps) {
  const { path, measureText, showTooltip = true, className } = props;
  const displayPath = getNoteMentionDisplayPath(path);

  const chipNode = measureText ? (
    <span className={`${styles['chip-mirror']} ${className ?? ''}`}>
      <span className={styles['chip-measure']}>{measureText}</span>
      <span className={styles['chip-mirror-overlay']}>
        <FileTextOutlined className={styles['chip-mirror-icon']} />
        <span className={styles['chip-mirror-label']}>{displayPath}</span>
      </span>
    </span>
  ) : (
    <span className={`${styles.chip} ${className ?? ''}`}>
      <FileTextOutlined className={styles['chip-icon']} />
      <span className={styles['chip-label']}>{displayPath}</span>
    </span>
  );

  if (!showTooltip || measureText) {
    return chipNode;
  }

  return <Tooltip title='笔记引用'>{chipNode}</Tooltip>;
}
