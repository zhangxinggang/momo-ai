import type { DImageGenerationResponse, IAIConfig, IImageReferenceAttachment } from '@renderer/services/ai';
import { generateImage } from '@renderer/services/ai';
import {
  EImageCapability,
  isImageGenerationConfig,
  resolveImageModelCapabilities,
} from '@renderer/services/ai/image/capabilities';
import type { IChatStreamMessage, IChatStreamStats } from '@momo/aichat';

export interface IImageChatStreamInput {
  config: IAIConfig;
  messages: IChatStreamMessage[];
  referenceImages?: IImageReferenceAttachment[];
  onChunk: (text: string) => void;
  onError?: (message: string) => void;
  onStats?: (stats: IChatStreamStats) => void;
}

function formatImageResultAsMarkdown(result: DImageGenerationResponse): string {
  const items = result.data.filter((item) => item.url || item.b64_json);
  if (items.length === 0) {
    return '模型未返回图片，请稍后重试。';
  }

  return items
    .map((item) => {
      const src = item.url ?? `data:image/png;base64,${item.b64_json}`;
      return `![生成的图片](${src})`;
    })
    .join('\n\n');
}

function extractLastUserPrompt(messages: IChatStreamMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role === 'user' && message.content.trim()) {
      return message.content.trim();
    }
  }
  return '';
}

/** 在 AI 对话中生图：取最后一条用户消息作为 prompt */
export async function runImageGenerationInChat(input: IImageChatStreamInput): Promise<void> {
  const { config, messages, referenceImages, onChunk, onError, onStats } = input;
  const prompt = extractLastUserPrompt(messages);

  if (!prompt) {
    onError?.('请输入生图描述');
    return;
  }

  if (!isImageGenerationConfig(config)) {
    onError?.('当前模型不支持生图');
    return;
  }

  const capabilities = resolveImageModelCapabilities(config);
  const refs = referenceImages ?? [];

  if (refs.length > 0) {
    const canEdit = capabilities.capabilities.some(
      (capability) =>
        capability === EImageCapability.EImageEdit ||
        capability === EImageCapability.EMultiImageEdit,
    );
    if (!canEdit) {
      onError?.('当前模型不支持参考图编辑，请移除图片附件或更换模型');
      return;
    }
  }

  const startTime = Date.now();

  try {
    const result = await generateImage(config, prompt, {
      n: 1,
      referenceImages:
        refs.length > 0 ? refs.slice(0, capabilities.maxReferenceImages) : undefined,
    });

    const markdown = formatImageResultAsMarkdown(result);
    onChunk(markdown);

    onStats?.({
      model: config.model,
      responseTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`,
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    onError?.(message);
  }
}
