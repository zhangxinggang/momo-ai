import type { IWebPageContext } from '@/types/modules/webpage';
import { CenteredLoading } from '@renderer/components/ui/CenteredLoading';
import { getCustomToolIpc } from '@renderer/services/ipc';
import { clsx } from 'clsx';
import { BotIcon } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { WebPageChat } from '../WebPageChat';

import styles from './index.module.less';

interface IProps {
  href: string;
  title?: string;
}

/** 工具箱内嵌页面：iframe（新窗口由主进程 setWindowOpenHandler 拦截） */
export function ToolWebview(props: IProps) {
  return <ToolWebviewPage key={props.href} {...props} />;
}

function ToolWebviewPage(props: IProps) {
  const { href, title } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMounted, setChatMounted] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [frameName] = useState(() => `momo-tool-web-${crypto.randomUUID()}`);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const readContext = useCallback(async (): Promise<IWebPageContext> => {
    const api = getCustomToolIpc();
    if (api?.readWebPage) return api.readWebPage(frameName);
    try {
      const document = iframeRef.current?.contentDocument;
      const content =
        (document?.querySelector('article, main') as HTMLElement | null)?.innerText ||
        document?.body?.innerText;
      if (!content?.trim()) throw new Error('网页正文尚未加载');
      return {
        url: document!.URL,
        title: document!.title,
        content: content.slice(0, 60000),
        truncated: content.length > 60000,
      };
    } catch {
      throw new Error('无法读取当前网页正文，请在桌面应用中打开网页后重试');
    }
  }, [frameName]);

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
        ref={iframeRef}
        name={frameName}
        key={href}
        className={styles['tool-webview-frame']}
        src={href}
        title={title ?? href}
        sandbox='allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads'
        onLoad={() => setIsLoading(false)}
      />
      {chatMounted ? (
        <section
          className={clsx(
            styles['tool-webview-chat'],
            chatExpanded && styles['tool-webview-chat--expanded'],
          )}
          hidden={!chatOpen}
          role='dialog'
          aria-label='网页 AI 对话'>
          <WebPageChat
            href={href}
            title={title}
            readContext={readContext}
            expanded={chatExpanded}
            onToggleExpanded={() => setChatExpanded((value) => !value)}
            onClose={() => setChatOpen(false)}
          />
        </section>
      ) : null}
      {!chatOpen ? (
        <button
          type='button'
          className={styles['tool-webview-bot']}
          aria-label='打开网页 AI 对话'
          title='与 AI 讨论当前网页'
          onClick={() => {
            setChatMounted(true);
            setChatOpen(true);
          }}>
          <BotIcon size={24} />
        </button>
      ) : null}
    </div>
  );
}
