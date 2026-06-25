import { CenteredLoading } from '@renderer/components/ui/CenteredLoading';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

import styles from './index.module.less';

interface IProps {
  url?: string;
  title?: string;
}

/** 工作流网页节点：左侧 iframe 展示链接（无对话） */
export function WorkflowNodeWebview(props: IProps) {
  const { url, title } = props;
  const href = url?.trim() ?? '';
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
  }, [href]);

  if (!href) {
    return <div className={styles['workflow-node-webview-empty']}>{'未配置链接地址'}</div>;
  }

  return (
    <div
      aria-label={title}
      className={styles['workflow-node-webview']}>
      <div
        className={clsx(
          styles['workflow-node-webview-loading'],
          !isLoading && styles['workflow-node-webview-loading--hidden'],
        )}>
        <CenteredLoading />
      </div>
      <iframe
        key={href}
        className={styles['workflow-node-webview-frame']}
        onLoad={() => setIsLoading(false)}
        sandbox='allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads'
        src={href}
        title={title ?? href}
      />
    </div>
  );
}
