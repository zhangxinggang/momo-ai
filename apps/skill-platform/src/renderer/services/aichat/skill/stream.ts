import type { ISkill } from '@/types/modules';
import type { IChatStreamMessage, TCallAiChatStream } from '@momo/aichat';
import type { IAIConfig } from '@renderer/services/ai';
import { buildActiveSkillLine } from '@renderer/services/skill/chat-context';
import { loadSkillInstructionsForChat } from '@renderer/services/skill/instructions-for-chat';
import { runSkillLangGraphChat } from '@renderer/services/skill/langgraph';
import { getEnabledWorkspaceContext } from '@renderer/services/workspace/context';
import { buildRagContext } from '../core/rag-context';

function getSkillBody(skill: ISkill): string {
  return (skill.instructions || skill.content || '').trim();
}
function formatPriorTranscript(messages: IChatStreamMessage[]): string {
  const lines: string[] = [];
  for (let i = 0; i < messages.length - 1; i++) {
    const m = messages[i];
    const body = (m.content || '').trim();
    if (!body) continue;
    const roleLabel = m.role === 'user' ? '用户' : '助手';
    lines.push(`【${roleLabel}】\n${body}`);
  }
  return lines.join('\n\n---\n\n');
}

export interface ISkillLangGraphStreamOptions {
  getModelConfig: (modelKey?: string) => IAIConfig | null;
  getDefaultConfig: () => IAIConfig | null;
  getSkillsSummary: () => string;
  getActiveSkillLine: () => string;
  getActiveSkill: () => ISkill | undefined;
  onNeedModel?: () => void;
  /** 工作流上下文：产出写入节点目录 */
  getWorkflowOutput?: () => {
    workflowName: string;
    businessId: string;
    nodeName: string;
    outputDir: string;
  } | null;
  /** 对话完成后回调（用于解析 artifact 等） */
  onReplyComplete?: (reply: string) => void | Promise<void>;
}

/** 将 SKILL LangGraph 能力注入 momo-aichat 的 callAIChatStream */
export function createSkillLangGraphStream(
  options: ISkillLangGraphStreamOptions,
): TCallAiChatStream {
  return async (messages, onChunk, onError, onStats, modelKey, streamOptions) => {
    const aiConfig =
      (modelKey ? options.getModelConfig(modelKey) : null) ?? options.getDefaultConfig();
    if (!aiConfig?.apiKey || !aiConfig.apiUrl || !aiConfig.model) {
      options.onNeedModel?.();
      onError?.('请先配置 AI 模型');
      return;
    }

    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const userInput = lastUser?.content?.trim() ?? '';
    if (!userInput) {
      onError?.('消息不能为空');
      return;
    }

    const startTime = Date.now();

    try {
      const { ragSystemPrompt, citations } = await buildRagContext(messages, streamOptions);
      const workspaceContext = await getEnabledWorkspaceContext();
      const knowledgeContext = [ragSystemPrompt, workspaceContext]
        .filter((block) => block.trim())
        .join('\n\n');
      const activeSkill = options.getActiveSkill();
      let activeSkillInstructions = '';
      if (activeSkill) {
        try {
          activeSkillInstructions = await loadSkillInstructionsForChat(activeSkill);
        } catch {
          activeSkillInstructions = getSkillBody(activeSkill);
        }
      }
      const workflowOutput = options.getWorkflowOutput?.() ?? undefined;
      const reply = await runSkillLangGraphChat(aiConfig, {
        userInput,
        skillsSummary: options.getSkillsSummary(),
        activeSkillLine: activeSkill
          ? buildActiveSkillLine(activeSkill)
          : options.getActiveSkillLine(),
        activeSkillInstructions,
        activeSkillId: activeSkill?.id,
        priorTranscript: formatPriorTranscript(messages),
        knowledgeContext,
        workflowOutput: workflowOutput ?? undefined,
      });
      const text = reply.trim() || '（无回复内容）';
      await options.onReplyComplete?.(text);
      onChunk(text);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      onStats?.({
        model: aiConfig.model,
        responseTime: `${elapsed}s`,
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        citations,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      onError?.(msg);
    }
  };
}
