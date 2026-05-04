import { generateSessionTitle } from '@momo/aichat';

import type { IAIConfig } from '@renderer/services/ai';
import { chatCompletion } from '@renderer/services/ai';

/** 根据首轮对话内容，调用 AI 生成简洁标题 */
export async function generateChatTitle(
  config: IAIConfig,
  userMessage: string,
  assistantMessage: string,
): Promise<string> {
  const fallback = generateSessionTitle(userMessage);
  const trimmedAssistant = assistantMessage.trim().slice(0, 600);
  if (!trimmedAssistant) {
    return fallback;
  }

  try {
    const result = await chatCompletion(
      config,
      [
        {
          role: 'system',
          content:
            '根据对话内容生成一个简洁的中文标题，不超过15个字，不要引号和标点结尾。只输出标题本身。',
        },
        {
          role: 'user',
          content: `用户：${userMessage.trim()}\n\n助手：${trimmedAssistant}`,
        },
      ],
      {
        stream: false,
        maxTokens: 32,
      },
    );
    const title = result.content.trim().replace(/^["'「『]|["'」』]$/g, '');
    return title.slice(0, 20) || fallback;
  } catch {
    return fallback;
  }
}
