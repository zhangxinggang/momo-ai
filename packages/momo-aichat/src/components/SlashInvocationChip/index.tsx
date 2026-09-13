import { CodeOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

import type { ISlashInvocation } from '../../types/slash-command';
import { getSlashInvocationLabel } from '../../utils/slash-token';
import styles from './index.module.less';

interface IProps {
  invocation: ISlashInvocation;
  /** 输入镜像中的等宽占位文本。 */
  measureText?: string;
  showTooltip?: boolean;
}

export function SlashInvocationChip({ invocation, measureText, showTooltip = true }: IProps) {
  const label = getSlashInvocationLabel(invocation);
  const Icon = invocation.kind === 'skill' ? ThunderboltOutlined : CodeOutlined;
  const inner = measureText ? (
    <span className={styles['chip-mirror']}>
      <span className={styles['chip-measure']}>{measureText}</span>
      <span className={styles['chip-mirror-overlay']}>
        <Icon className={styles['chip-icon']} />
        <span className={styles['chip-label']}>{label}</span>
      </span>
    </span>
  ) : (
    <span className={styles.chip}>
      <Icon className={styles['chip-icon']} />
      <span className={styles['chip-label']}>{label}</span>
    </span>
  );

  return showTooltip && !measureText ? (
    <Tooltip title={`${invocation.kind === 'skill' ? 'Skill' : 'Command'} · ${invocation.command}`}>
      {inner}
    </Tooltip>
  ) : (
    inner
  );
}
