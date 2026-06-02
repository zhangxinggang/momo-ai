import { CenteredLoading } from '@renderer/components/ui/CenteredLoading';
import { clsx } from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';

import styles from './index.module.less';

interface IProps {
  href: string;
  title?: string;
}

/** 工具箱内嵌页面：Electron webview */
export function ToolWebview(props: IProps) {
  const { href, title } = props;
  const [isLoading, setIsLoading] = useState(true);
  const webviewRef = useRef<HTMLElement>(null);

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setIsLoading(true);
  }, [href]);

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) {
      return;
    }

    const onDomReady = () => handleLoadComplete();
    const onDidStopLoading = () => handleLoadComplete();

    webview.addEventListener('dom-ready', onDomReady);
    webview.addEventListener('did-stop-loading', onDidStopLoading);

    return () => {
      webview.removeEventListener('dom-ready', onDomReady);
      webview.removeEventListener('did-stop-loading', onDidStopLoading);
    };
  }, [handleLoadComplete, href]);

  return (
    <div className={styles['tool-webview']} aria-label={title}>
      <div
        className={clsx(
          styles['tool-webview-loading'],
          !isLoading && styles['tool-webview-loading--hidden'],
        )}>
        <CenteredLoading />
      </div>
      <webview
        key={href}
        ref={webviewRef}
        className={styles['tool-webview-frame']}
        src={href}
        allowpopups
      />
    </div>
  );
}
