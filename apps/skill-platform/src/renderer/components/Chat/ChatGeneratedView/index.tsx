import { MarkdownRenderer, type IChatMessage } from '@momo/aichat';
import { ViewportPortal } from '@momo/markdown';
import { runtimeViewNotes } from '@renderer/services/aichat/runtime-view';
import { setWindowFullscreen } from '@renderer/services/desktop/window';
import { subscribeFullscreenChanged } from '@renderer/services/desktop/ipc-events';
import { Alert, App, Button, Tooltip } from 'antd';
import { Maximize2Icon, Minimize2Icon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CustomToolOpenUIPreview } from '../../Toolbox/CustomToolOpenUIPreview';

import styles from './index.module.less';

export function ChatGeneratedView({
  message,
  onSelectFiles,
  onSubmit,
  busy,
}: {
  message: IChatMessage;
  onSelectFiles?: (files: File[]) => Promise<boolean>;
  onSubmit?: (input: { message: string; formState?: Record<string, unknown> }) => Promise<boolean>;
  busy?: boolean;
}) {
  const { message: notification } = App.useApp();
  const [fullscreen, setFullscreen] = useState(false);
  const ownsFullscreen = useRef(false);
  const toggleFullscreen = async () => {
    const next = !ownsFullscreen.current;
    ownsFullscreen.current = next;
    setFullscreen(next);
    try {
      await setWindowFullscreen(next);
    } catch (error) {
      ownsFullscreen.current = !next;
      setFullscreen(!next);
      notification.error(error instanceof Error ? error.message : '无法切换全屏');
    }
  };
  useEffect(() => {
    const update = (active: boolean) => {
      if (!active && ownsFullscreen.current) {
        ownsFullscreen.current = false;
        setFullscreen(false);
      }
    };
    const unsubscribe = subscribeFullscreenChanged(update);
    const browserChange = () => update(Boolean(document.fullscreenElement));
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && ownsFullscreen.current) {
        void setWindowFullscreen(false)
          .then(() => update(false))
          .catch(() => {});
      }
    };
    document.addEventListener('fullscreenchange', browserChange);
    window.addEventListener('keydown', keydown);
    return () => {
      unsubscribe();
      document.removeEventListener('fullscreenchange', browserChange);
      window.removeEventListener('keydown', keydown);
      if (ownsFullscreen.current) void setWindowFullscreen(false).catch(() => {});
    };
  }, []);
  const view = message.generatedView;
  if (!view) return null;
  const streaming = Boolean(message.isLoading);
  const notes = message.runId && view.kind === 'openui' ? runtimeViewNotes(message.content) : '';
  const statusText = streaming
    ? view.status === 'repairing'
      ? '正在修复并重新校验界面…'
      : '正在生成界面…'
    : view.status === 'stopped'
      ? '已停止生成，保留当前预览'
      : view.status === 'error'
        ? '界面生成失败'
        : '';

  return (
    <ViewportPortal active={fullscreen}>
      <section
        className={`${styles.card} ${fullscreen ? styles.fullscreen : ''}`}
        aria-label='生成的界面'>
        <div className={styles.toolbar}>
          <Tooltip title={fullscreen ? '退出全屏（Esc）' : '全屏展示'}>
            <Button
              type='text'
              aria-label={fullscreen ? '退出界面全屏' : '全屏展示界面'}
              aria-pressed={fullscreen}
              onClick={() => void toggleFullscreen()}
              icon={fullscreen ? <Minimize2Icon size={16} /> : <Maximize2Icon size={16} />}
            />
          </Tooltip>
        </div>
        {statusText ? (
          <div className={styles.status} role='status'>
            {statusText}
          </div>
        ) : null}
        {view.errorMessage ? <Alert type='error' message={view.errorMessage} showIcon /> : null}
        {view.kind === 'openui' ? (
          <CustomToolOpenUIPreview
            content={view.content}
            title='聊天界面预览'
            components={{}}
            streaming={streaming}
            presentation='chat'
            sourceRefs={view.sourceRefs}
            onSelectFiles={onSelectFiles}
            onSubmit={onSubmit}
            busy={busy}
          />
        ) : view.content ? (
          <iframe
            className={styles.frame}
            title='聊天界面预览'
            srcDoc={view.content}
            sandbox='allow-scripts allow-forms allow-modals allow-popups'
            referrerPolicy='no-referrer'
          />
        ) : null}
        {notes ? (
          <MarkdownRenderer instanceKey={`${message.id}-notes`} content={notes} theme='light' />
        ) : null}
      </section>
    </ViewportPortal>
  );
}
