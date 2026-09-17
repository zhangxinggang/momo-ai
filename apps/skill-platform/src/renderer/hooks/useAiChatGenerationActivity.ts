import { useCallback, useEffect, useRef } from 'react';

import {
  clearAiChatGenerationActivity,
  setAiChatGenerationActivity,
  type EAiChatGenerationScope,
} from '@renderer/services/aichat/generation-activity';

function useActivityOwner(): symbol {
  const ownerRef = useRef<symbol | null>(null);
  if (!ownerRef.current) {
    ownerRef.current = Symbol('ai-chat-generation');
  }
  return ownerRef.current;
}

/** 将 ChatProvider 的生成状态上报给宿主级离开保护。 */
export function useAiChatGenerationReporter(scope: EAiChatGenerationScope) {
  const owner = useActivityOwner();
  const report = useCallback(
    (isGenerating: boolean) => {
      setAiChatGenerationActivity(owner, scope, isGenerating);
    },
    [owner, scope],
  );

  useEffect(
    () => () => {
      clearAiChatGenerationActivity(owner);
    },
    [owner],
  );

  return report;
}

/** 跟踪未使用 ChatProvider 的单轮 AI 生成入口。 */
export function useTrackAiChatGeneration(
  scope: EAiChatGenerationScope,
  isGenerating: boolean,
): void {
  const report = useAiChatGenerationReporter(scope);
  useEffect(() => {
    report(isGenerating);
  }, [isGenerating, report]);
}
