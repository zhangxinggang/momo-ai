import { MarkdownRenderer, type IChatMessage } from '@momo/aichat';
import { runtimeViewNotes } from '@renderer/services/aichat/runtime-view';
import { Alert, Tabs } from 'antd';
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
  const view = message.generatedView;
  if (!view) return null;
  const streaming = Boolean(message.isLoading);
  const notes = message.runId && view.kind === 'openui' ? runtimeViewNotes(message.content) : '';
  const statusText =
    view.status === 'repairing'
      ? '正在修复并重新校验界面…'
      : streaming
        ? '正在生成界面…'
        : view.status === 'error'
          ? '界面生成失败'
          : view.status === 'stopped'
            ? '已停止生成，保留当前预览'
            : '界面已生成';

  return (
    <section className={styles.card} aria-label='生成的界面'>
      <div className={styles.status} role='status'>
        {statusText}
      </div>
      {view.errorMessage ? <Alert type='error' message={view.errorMessage} showIcon /> : null}
      <Tabs
        size='small'
        destroyOnHidden={view.kind === 'openui'}
        items={[
          {
            key: 'preview',
            label: '界面',
            children:
              view.kind === 'openui' ? (
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
              ) : null,
          },
          {
            key: 'source',
            label: '源码',
            children: (
              <pre className={styles.source}>
                <code>{view.content}</code>
              </pre>
            ),
          },
        ]}
      />
      {notes ? (
        <MarkdownRenderer instanceKey={`${message.id}-notes`} content={notes} theme='light' />
      ) : null}
    </section>
  );
}
