import { useChatContext } from '@momo/aichat';
import { useEffect, useRef } from 'react';

import { getModelsByType, toAIConfig } from '@renderer/services/ai/defaults';
import { generateChatTitle } from '@renderer/services/aichat';
import { useSettingsStore } from '@renderer/store';

/** 首轮对话完成后，调用 AI 生成会话标题 */
export function useAutoSessionTitle() {
  const { currentSession, updateSessionTitle, currentModel } = useChatContext();
  const aiModels = useSettingsStore((s) => s.aiModels);
  const titledRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!currentSession) {
      return;
    }
    if (titledRef.current.has(currentSession.id)) {
      return;
    }
    if (currentSession.isLoading) {
      return;
    }

    const userMessage = currentSession.messages.find((m) => m.role === 'user' && m.content.trim());
    const assistantMessage = currentSession.messages.find(
      (m) => m.role === 'assistant' && !m.isLoading && m.content.trim(),
    );
    if (!userMessage || !assistantMessage) {
      return;
    }

    titledRef.current.add(currentSession.id);
    const modelConfig =
      getModelsByType(aiModels, 'chat').find((m) => m.id === currentModel) ??
      getModelsByType(aiModels, 'chat')[0];
    if (!modelConfig) {
      return;
    }

    void generateChatTitle(
      toAIConfig(modelConfig),
      userMessage.content,
      assistantMessage.content,
    ).then((title) => {
      if (title.trim()) {
        updateSessionTitle(currentSession.id, title.trim());
      }
    });
  }, [aiModels, currentModel, currentSession, updateSessionTitle]);
}
