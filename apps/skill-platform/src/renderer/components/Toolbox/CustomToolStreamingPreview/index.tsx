import { useCallback, useEffect, useRef } from 'react';

interface IProps {
  html: string;
  className?: string;
  title: string;
}

const STREAM_HOST_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>
html,body,#host,#preview{width:100%;height:100%;margin:0;border:0;overflow:hidden;background:#fff}
</style></head><body><div id="host"><iframe id="preview"></iframe></div><script>
(() => {
  const preview = document.getElementById('preview');
  let previous = '';
  const update = (next) => {
    if (typeof next !== 'string' || next === previous) return;
    const doc = preview.contentDocument;
    if (!doc) return;
    if (!previous || !next.startsWith(previous)) {
      doc.open();
      doc.write(next);
    } else {
      doc.write(next.slice(previous.length));
    }
    previous = next;
  };
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'momo-tool-stream:update') update(event.data.html);
  });
  window.parent.postMessage({ type: 'momo-tool-stream:ready' }, '*');
})();
</script></body></html>`;

/**
 * 流式 HTML 预览宿主。外层 iframe 只加载一次，后续仅向内部文档追加新片段，
 * 避免每个 chunk 都重载页面并重启动画。
 */
export function CustomToolStreamingPreview({ html, className, title }: IProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const htmlRef = useRef(html);
  htmlRef.current = html;

  const publish = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'momo-tool-stream:update', html: htmlRef.current },
      '*',
    );
  }, []);

  useEffect(() => {
    publish();
  }, [html, publish]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.source === iframeRef.current?.contentWindow &&
        event.data?.type === 'momo-tool-stream:ready'
      ) {
        publish();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [publish]);

  return (
    <iframe
      ref={iframeRef}
      className={className}
      title={title}
      srcDoc={STREAM_HOST_HTML}
      sandbox='allow-scripts allow-forms'
      onLoad={publish}
    />
  );
}
