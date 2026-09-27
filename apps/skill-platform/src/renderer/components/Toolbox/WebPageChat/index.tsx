import type { IWebPageContext } from '@/types/modules/webpage';
import {
  AiChatView,
  ChatProvider,
  useAiChatConfig,
  useChatContext,
  type IAiChatServices,
} from '@momo/aichat';
import { useAiChatGenerationReporter } from '@renderer/hooks/useAiChatGenerationActivity';
import { createHarnessChatOverrides } from '@renderer/services/agent-runtime/client';
import { buildSharedAiChatServices } from '@renderer/services/aichat';
import {
  buildWebPagePrompt,
  getWebPageSummaryPrompt,
  webPageChatIdentity,
} from '@renderer/services/webpage-chat';
import { useSettingsStore } from '@renderer/store';
import { Alert, Button } from 'antd';
import { Maximize2Icon, Minimize2Icon, RefreshCwIcon, XIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './index.module.less';

interface Props {
  href: string;
  title?: string;
  readContext: () => Promise<IWebPageContext>;
  expanded: boolean;
  onToggleExpanded: () => void;
  onClose: () => void;
}

export function WebPageChat({
  href,
  title,
  readContext,
  expanded,
  onToggleExpanded,
  onClose,
}: Props) {
  const aiModels = useSettingsStore((state) => state.aiModels);
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const reportGeneration = useAiChatGenerationReporter('toolbox');
  const [input, setInput] = useState(getWebPageSummaryPrompt);
  const [page, setPage] = useState<IWebPageContext | null>(null);
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);
  const identity = useMemo(() => webPageChatIdentity(href), [href]);

  const refreshContext = useCallback(async () => {
    setReading(true);
    try {
      const value = await readContext();
      setPage(value);
      setError('');
      return value;
    } catch (error) {
      const text = error instanceof Error ? error.message : '读取网页内容失败';
      setError(text);
      throw new Error(text);
    } finally {
      setReading(false);
    }
  }, [readContext]);

  useEffect(() => {
    void refreshContext().catch(() => {});
  }, [refreshContext]);

  const services = useMemo((): IAiChatServices => {
    const harness = createHarnessChatOverrides({ webBrowsing: true });
    return buildSharedAiChatServices({
      aiModels,
      storageKeyPrefix: identity.storageKeyPrefix,
      enableSuperpower: false,
      callAIChatStream: harness.callAIChatStream!,
      overrides: {
        ...harness,
        beforeSubmitPrompt: async (input) => {
          try {
            return {
              action: 'allow',
              content: buildWebPagePrompt(await refreshContext(), input.content),
              displayContent: input.displayContent,
            };
          } catch (error) {
            return {
              action: 'deny',
              reason: error instanceof Error ? error.message : '读取网页内容失败',
            };
          }
        },
      },
    });
  }, [aiModels, identity.storageKeyPrefix, refreshContext]);

  return (
    <ChatProvider
      services={services}
      bootstrapSessionId={identity.sessionId}
      bootstrapSessionTitle={`网页：${title || href}`}
      onGenerationStateChange={reportGeneration}>
      <WebChatHistoryBridge />
      <header className={styles.header}>
        <div className={styles.heading}>
          <strong>网页 AI 对话</strong>
          <span title={page?.url || href}>
            {reading
              ? '正在读取网页…'
              : page
                ? `已读取 ${page.content.length.toLocaleString()} 字${page.truncated ? '（已截取）' : ''}`
                : '等待读取网页'}
          </span>
        </div>
        <Button
          type='text'
          size='small'
          aria-label='重新读取网页内容'
          title='重新读取网页内容'
          loading={reading}
          icon={<RefreshCwIcon size={15} />}
          onClick={() => void refreshContext().catch(() => {})}
        />
        <Button
          type='text'
          size='small'
          aria-label={expanded ? '还原网页 AI 对话' : '放大网页 AI 对话'}
          title={expanded ? '还原' : '放大至网页区域'}
          aria-pressed={expanded}
          icon={expanded ? <Minimize2Icon size={16} /> : <Maximize2Icon size={16} />}
          onClick={onToggleExpanded}
        />
        <Button
          type='text'
          size='small'
          aria-label='关闭网页 AI 对话'
          title='关闭'
          icon={<XIcon size={16} />}
          onClick={onClose}
        />
      </header>
      {error ? <Alert className={styles.error} type='error' showIcon title={error} /> : null}
      <div className={styles.chat}>
        <AiChatView
          hideWelcome
          inputValue={input}
          onInputChange={setInput}
          theme={isDarkMode ? 'dark' : 'light'}
        />
      </div>
    </ChatProvider>
  );
}

/** 立即保存网页问答，避免切换网页时取消通用聊天模块的防抖写入。 */
function WebChatHistoryBridge() {
  const { sessions, currentSessionId, currentModel } = useChatContext();
  const { chatStorage, storageKeyPrefix } = useAiChatConfig();
  useEffect(() => {
    const history = sessions.filter((session) =>
      session.messages.some((message) => message.role === 'user' || message.role === 'assistant'),
    );
    if (!history.length) return;
    try {
      chatStorage.setItem(`${storageKeyPrefix}-sessions`, JSON.stringify(history));
      if (currentSessionId)
        chatStorage.setItem(`${storageKeyPrefix}-current-session-id`, currentSessionId);
      if (currentModel) chatStorage.setItem(`${storageKeyPrefix}-current-model`, currentModel);
    } catch (error) {
      console.error('保存网页对话历史失败', error);
    }
  }, [sessions, currentSessionId, currentModel, chatStorage, storageKeyPrefix]);
  return null;
}
