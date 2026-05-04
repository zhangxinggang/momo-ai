import { AiChatView, type IChatMessage } from '@momo/aichat';

import { useAutoSessionTitle } from '@renderer/hooks/useAutoSessionTitle';
import { isWebRuntime } from '@renderer/runtime';

import { useUIStore } from '@renderer/store';

import { ChatErrorBoundary } from '../ChatErrorBoundary';
import { SaveToNoteAction } from '../SaveToNoteAction';

import styles from './index.module.less';

function ChatManagerDesktop() {
  useAutoSessionTitle();

  return (
    <div className={styles['chat-main']}>
      <div className={styles['chat-main-body']}>
        <AiChatView
          renderAssistantMessageActions={(msg: IChatMessage) => <SaveToNoteAction message={msg} />}
        />
      </div>
    </div>
  );
}

function ChatManagerContent() {
  if (isWebRuntime()) {
    return (
      <div className={styles['chat-main']}>
        <p className={styles['chat-main-hint']}>{'AI 对话仅在桌面客户端可用'}</p>
      </div>
    );
  }

  return <ChatManagerDesktop />;
}

/** AI 对话主内容区 */

export function ChatManager() {
  const viewMode = useUIStore((s) => s.viewMode);

  if (viewMode !== 'chat') {
    return null;
  }

  return (
    <ChatErrorBoundary>
      <ChatManagerContent />
    </ChatErrorBoundary>
  );
}
