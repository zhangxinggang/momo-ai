import { LinkOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useEffect, useRef, useState, type RefObject } from 'react';

import styles from './index.module.less';

interface IProps {
  src: string;
  title: string;
}

/** 模型排行嵌入页：加载失败提示（外链新窗口由主进程 webview setWindowOpenHandler 处理） */
export function RankingWebview({ src, title }: IProps) {
  const webviewRef = useRef<Electron.WebviewTag | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [src]);

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) {
      return;
    }

    const handleFailLoad = () => {
      setLoadFailed(true);
    };

    const handleFinishLoad = () => {
      setLoadFailed(false);
    };

    const bindLoadEvents = () => {
      webview.addEventListener('did-fail-load', handleFailLoad);
      webview.addEventListener('did-finish-load', handleFinishLoad);
    };

    const unbindLoadEvents = () => {
      webview.removeEventListener('did-fail-load', handleFailLoad);
      webview.removeEventListener('did-finish-load', handleFinishLoad);
    };

    const handleAttach = () => {
      unbindLoadEvents();
      bindLoadEvents();
    };

    webview.addEventListener('did-attach', handleAttach);
    handleAttach();

    return () => {
      webview.removeEventListener('did-attach', handleAttach);
      unbindLoadEvents();
    };
  }, [src]);

  if (loadFailed) {
    return (
      <div className={styles['model-ranking-fallback']}>
        <div className={styles['model-ranking-fallback-title']}>{'访问失败'}</div>
        <div className={styles['model-ranking-fallback-desc']}>
          {'页面无法在应用内加载，可尝试在浏览器中打开'}
        </div>
        <Button
          type='link'
          icon={<LinkOutlined />}
          href={src}
          onClick={(event) => {
            event.preventDefault();
            void window.electron?.openExternal?.(src);
          }}>
          {src}
        </Button>
      </div>
    );
  }

  return (
    <webview
      ref={webviewRef as unknown as RefObject<HTMLElement>}
      src={src}
      className={styles['model-ranking-webview']}
      title={title}
      allowpopups={true}
    />
  );
}
