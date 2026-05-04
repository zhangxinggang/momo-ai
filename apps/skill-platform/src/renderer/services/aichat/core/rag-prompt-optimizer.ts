/** RAG 提示词优化器（参考 docs/RAG-ChatBot-main/src/lib/promptOptimizer.ts） */

import type { IChatStreamMessage } from '@momo/aichat';

import {
  baseRagPrompt,
  generateRagPrompt,
  type IRagContextItem,
  type IRagPromptConfig,
} from './rag-prompts';

export interface IPromptOptimizationData {
  conversationHistory: IChatStreamMessage[];
  userFeedback: 'positive' | 'negative' | 'neutral';
  responseQuality: number;
  contextRelevance: number;
  userSatisfaction: number;
  conversationDepth: number;
}

interface IOptimizedPromptConfig {
  baseConfig: IRagPromptConfig;
  dynamicAdjustments: {
    contextWeight: number;
    conversationDepth: number;
    responseStyle: 'concise' | 'detailed' | 'balanced';
    technicalLevel: 'beginner' | 'intermediate' | 'advanced';
  };
}

/** 分析对话历史，提取优化信息 */
export function analyzeConversationHistory(
  messages: IChatStreamMessage[],
): IPromptOptimizationData {
  const userMessages = messages.filter((msg) => msg.role === 'user');
  const assistantMessages = messages.filter((msg) => msg.role === 'assistant');

  const conversationDepth = messages.length;

  const questionComplexity = userMessages.reduce((acc, msg) => {
    const text = msg.content || '';
    if (text.length > 100) {
      return acc + 2;
    }
    if (text.length > 50) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const responseLength = assistantMessages.reduce(
    (acc, msg) => acc + (msg.content?.length || 0),
    0,
  );

  return {
    conversationHistory: messages,
    userFeedback: 'neutral',
    responseQuality: Math.min(
      10,
      Math.max(0, 5 + questionComplexity * 0.5 - (responseLength > 500 ? 1 : 0)),
    ),
    contextRelevance: Math.min(10, Math.max(0, 7 + conversationDepth * 0.2)),
    userSatisfaction: Math.min(10, Math.max(0, 6 + questionComplexity * 0.3)),
    conversationDepth,
  };
}

function optimizePrompt(
  baseConfig: IRagPromptConfig,
  optimizationData: IPromptOptimizationData,
): IOptimizedPromptConfig {
  const contextWeight = Math.min(1.5, Math.max(0.5, 1 + optimizationData.conversationDepth * 0.1));

  let responseStyle: 'concise' | 'detailed' | 'balanced' = 'balanced';
  if (optimizationData.userSatisfaction < 5) {
    responseStyle = 'detailed';
  } else if (optimizationData.userSatisfaction > 8) {
    responseStyle = 'concise';
  }

  let technicalLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
  if (optimizationData.responseQuality < 4) {
    technicalLevel = 'beginner';
  } else if (optimizationData.responseQuality > 7) {
    technicalLevel = 'advanced';
  }

  return {
    baseConfig,
    dynamicAdjustments: {
      contextWeight,
      conversationDepth: optimizationData.conversationDepth,
      responseStyle,
      technicalLevel,
    },
  };
}

/** 根据对话历史与检索上下文生成优化后的系统提示词 */
export function generateOptimizedRagPrompt(
  messages: IChatStreamMessage[],
  context: IRagContextItem[],
): string {
  const optimizationData = analyzeConversationHistory(messages);
  const optimized = optimizePrompt(baseRagPrompt, optimizationData);

  let adjustedRole = optimized.baseConfig.role;
  if (optimized.dynamicAdjustments.technicalLevel === 'beginner') {
    adjustedRole += ' 请使用通俗易懂的语言，避免过于专业的技术术语。';
  } else if (optimized.dynamicAdjustments.technicalLevel === 'advanced') {
    adjustedRole += ' 可以使用专业术语和深入的技术分析。';
  }

  const adjustedRules = [...optimized.baseConfig.rules];
  if (optimized.dynamicAdjustments.responseStyle === 'concise') {
    adjustedRules.push('提供简洁明了的回答，避免冗长的解释');
  } else if (optimized.dynamicAdjustments.responseStyle === 'detailed') {
    adjustedRules.push('提供详细全面的回答，包含必要的背景信息和解释');
  }

  const adjustedContextGuidance = [...optimized.baseConfig.contextGuidance];
  if (optimized.dynamicAdjustments.contextWeight > 1.2) {
    adjustedContextGuidance.push('特别注意上下文信息的深度挖掘和关联分析');
  }

  const optimizedConfig: IRagPromptConfig = {
    ...optimized.baseConfig,
    role: adjustedRole,
    rules: adjustedRules,
    contextGuidance: adjustedContextGuidance,
  };

  return generateRagPrompt(optimizedConfig, context);
}
