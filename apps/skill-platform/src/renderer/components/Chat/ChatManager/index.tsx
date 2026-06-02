import { AiChatView, type IChatMessage } from '@momo/aichat';

import { useAiChatViewTheme } from '@renderer/hooks/useAiChatViewTheme';
import { useAutoSessionTitle } from '@renderer/hooks/useAutoSessionTitle';

import { useUIStore } from '@renderer/store';

import { ChatErrorBoundary } from '../ChatErrorBoundary';
import { SaveToNoteAction } from '../SaveToNoteAction';

import styles from './index.module.less';

/** AI 对话主内容区 */
export function ChatManager() {
  const viewMode = useUIStore((s) => s.viewMode);
  useAutoSessionTitle();
  const chatTheme = useAiChatViewTheme();

  if (viewMode !== 'chat') {
    return null;
  }

  return (
    <ChatErrorBoundary>
      <div className={styles['chat-main']}>
        <div className={styles['chat-main-body']}>
          <AiChatView
            {...chatTheme}
            renderAssistantMessageActions={(msg: IChatMessage) => (
              <SaveToNoteAction message={msg} />
            )}
          />
        </div>
      </div>
    </ChatErrorBoundary>
  );
}
