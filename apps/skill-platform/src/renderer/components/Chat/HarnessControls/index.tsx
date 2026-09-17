import { useChatContext, type IAiChatServices } from '@momo/aichat';
import { renderChatModelSelect } from '@renderer/services/aichat/chat-model-select';
import type { IAIModelConfig } from '@renderer/types/settings';
import { useEffect } from 'react';

/** 会话绑定独立于输入栏，隐藏权限入口后仍恢复原智能体和模型。 */
export function HarnessSessionBinding({ onAgentChange }: { onAgentChange: (id: string) => void }) {
  const { currentSession, currentSessionId, setCurrentModel } = useChatContext();
  const sessionModelId = currentSession?.modelId;
  useEffect(() => {
    let cancelled = false;
    onAgentChange('momo-default');
    if (currentSessionId) {
      void window.api.agentRuntime
        .sessionBinding(currentSessionId)
        .then((binding) => {
          if (cancelled || !binding) return;
          onAgentChange(binding.agent_id);
          // 新版会话以 UI 中持久化的会话级选择为准；仅为旧会话恢复后端绑定。
          if (!sessionModelId) setCurrentModel(binding.model_id);
        })
        .catch(() => {
          /* 未绑定的会话使用默认智能体，运行错误由发送流程展示。 */
        });
    }
    return () => {
      cancelled = true;
    };
  }, [currentSessionId, onAgentChange, sessionModelId, setCurrentModel]);
  return null;
}

export function HarnessModelSelect({
  models,
  input,
}: {
  models: IAIModelConfig[];
  input: Parameters<NonNullable<IAiChatServices['renderModelSelect']>>[0];
}) {
  return renderChatModelSelect(
    models.filter((model) => model.type === 'chat'),
    {
      ...input,
      disabled: input.disabled,
    },
  );
}
