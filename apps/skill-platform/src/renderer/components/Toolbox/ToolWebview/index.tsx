import { CenteredLoading } from '@renderer/components/ui/CenteredLoading';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

import styles from './index.module.less';

interface IProps {
  href: string;
  title?: string;
}

/** 工具箱内嵌页面：iframe（新窗口由主进程 setWindowOpenHandler 拦截） */
export function ToolWebview(props: IProps) {
  const { href, title } = props;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
  }, [href]);

  return (
    <div className={styles['tool-webview']} aria-label={title}>
      <div
        className={clsx(
          styles['tool-webview-loading'],
          !isLoading && styles['tool-webview-loading--hidden'],
        )}>
        <CenteredLoading />
      </div>
      <iframe
        key={href}
        className={styles['tool-webview-frame']}
        src={href}
        title={title ?? href}
        sandbox='allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads'
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
