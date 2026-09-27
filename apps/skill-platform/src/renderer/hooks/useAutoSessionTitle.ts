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

    const modelConfig =
      getModelsByType(aiModels, 'chat').find((m) => m.id === currentModel) ??
      getModelsByType(aiModels, 'chat')[0];
    if (!modelConfig) {
      return;
    }

    titledRef.current.add(currentSession.id);
    void generateChatTitle(toAIConfig(modelConfig), userMessage.content, assistantMessage.content)
      .then((title) => {
        if (title.trim()) {
          updateSessionTitle(currentSession.id, title.trim());
        }
      })
      .catch(() => {
        // 允许模型配置临时不可用或请求失败后，在下一次状态变化时重试。
        titledRef.current.delete(currentSession.id);
      });
  }, [aiModels, currentModel, currentSession, updateSessionTitle]);
}
