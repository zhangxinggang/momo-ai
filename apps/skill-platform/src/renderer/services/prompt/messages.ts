import type {
  IChatImageAttachment,
  IChatMessage,
  IChatMessageContentPart,
} from '@renderer/services/ai/types';

/** 使用 IPrompt 模板生成消息 */
export function buildMessagesFromPrompt(
  systemPrompt: string | undefined,
  userPrompt: string,
  variables?: Record<string, string>,
  imageAttachments?: IChatImageAttachment[],
): IChatMessage[] {
  const messages: IChatMessage[] = [];

  let processedUserPrompt = userPrompt;
  if (variables) {
    for (const [key, value] of Object.entries(variables)) {
      processedUserPrompt = processedUserPrompt.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
        value,
      );
    }
  }

  if (systemPrompt) {
    let processedSystemPrompt = systemPrompt;
    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        processedSystemPrompt = processedSystemPrompt.replace(
          new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
          value,
        );
      }
    }
    messages.push({ role: 'system', content: processedSystemPrompt });
  }

  if (imageAttachments && imageAttachments.length > 0) {
    const content: IChatMessageContentPart[] = [
      { type: 'text', text: processedUserPrompt },
      ...imageAttachments.map((attachment) => ({
        type: 'image_url' as const,
        image_url: {
          url: `data:${attachment.mimeType};base64,${attachment.base64}`,
        },
      })),
    ];
    messages.push({ role: 'user', content });
  } else {
    messages.push({ role: 'user', content: processedUserPrompt });
  }

  return messages;
}
