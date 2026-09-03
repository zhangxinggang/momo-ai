import { CenteredLoading } from '@renderer/components/ui/CenteredLoading';
import { readSnapEditHtml } from '@renderer/services/custom-tool/api';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import styles from './index.module.less';

interface IProps {
  html: string;
  fileName?: string;
}

export interface ISnapEditFrameHandle {
  pullHtml: () => Promise<string>;
}

/** 嵌入 snapEdit.html，通过 postMessage 同步 HTML */
export const SnapEditFrame = forwardRef<ISnapEditFrameHandle, IProps>(
  function SnapEditFrame(props, ref) {
    const { html, fileName = 'tool.html' } = props;
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [frameUrl, setFrameUrl] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);
    const requestIdRef = useRef(0);
    const pendingRef = useRef<Map<string, (value: string) => void>>(new Map());
    const htmlRef = useRef(html);
    htmlRef.current = html;

    useEffect(() => {
      let objectUrl: string | null = null;
      let cancelled = false;

      void readSnapEditHtml()
        .then((source) => {
          if (cancelled) {
            return;
          }
          // blob URL 无法携带 query，用 data-embed 标记嵌入模式
          const injected = source.replace(
            '<html lang="zh-CN">',
            '<html lang="zh-CN" data-embed="1">',
          );
          const blob = new Blob([injected], { type: 'text/html;charset=utf-8' });
          objectUrl = URL.createObjectURL(blob);
          setFrameUrl(objectUrl);
        })
        .catch((err) => {
          console.error('[SnapEditFrame] load failed:', err);
        });

      return () => {
        cancelled = true;
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    }, []);

    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        const data = event.data;
        if (!data || typeof data !== 'object') {
          return;
        }
        if (data.type === 'snapedit:ready') {
          setIsReady(true);
          iframeRef.current?.contentWindow?.postMessage(
            { type: 'snapedit:setHtml', html: htmlRef.current, fileName },
            '*',
          );
          return;
        }
        if (data.type === 'snapedit:html' && data.requestId) {
          const resolve = pendingRef.current.get(String(data.requestId));
          if (resolve) {
            pendingRef.current.delete(String(data.requestId));
            resolve(typeof data.html === 'string' ? data.html : '');
          }
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [fileName]);

    useEffect(() => {
      if (!isReady) {
        return;
      }
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'snapedit:setHtml', html, fileName },
        '*',
      );
    }, [fileName, html, isReady]);

    useImperativeHandle(
      ref,
      () => ({
        pullHtml: () =>
          new Promise((resolve) => {
            const frame = iframeRef.current;
            if (!isReady || !frame?.contentWindow) {
              resolve(htmlRef.current);
              return;
            }
            const requestId = `req-${++requestIdRef.current}`;
            pendingRef.current.set(requestId, resolve);
            frame.contentWindow.postMessage({ type: 'snapedit:getHtml', requestId }, '*');
            window.setTimeout(() => {
              if (pendingRef.current.has(requestId)) {
                pendingRef.current.delete(requestId);
                resolve(htmlRef.current);
              }
            }, 3000);
          }),
      }),
      [isReady],
    );

    if (!frameUrl) {
      return (
        <div className={styles['snap-edit-frame']}>
          <CenteredLoading />
        </div>
      );
    }

    return (
      <div className={styles['snap-edit-frame']}>
        <iframe
          ref={iframeRef}
          className={styles['snap-edit-frame-iframe']}
          src={frameUrl}
          title='HTML 编辑器'
          sandbox='allow-scripts allow-same-origin allow-forms allow-downloads'
        />
      </div>
    );
  },
);
