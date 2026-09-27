import type { IAiChatServices } from '@momo/aichat';
import { getModelsByType, toAIConfig } from '@renderer/services/ai/defaults';
import {
  generateCustomToolView,
  resolveCustomToolGenerationKind,
} from '@renderer/services/custom-tool/generation';
import type { IAIModelConfig } from '@renderer/types/settings';
import { getAichatApi } from './api';

/** 仅提供纯文本界面生成，不使用 Harness、知识库或宿主工具。 */
export function createChatViewGenerator(
  aiModels: IAIModelConfig[],
): NonNullable<IAiChatServices['viewGeneration']>['generate'] {
  return async (input, onUpdate) => {
    const model = getModelsByType(aiModels, 'chat').find((item) => item.id === input.modelId);
    if (!model) throw new Error('请先配置可用于生成界面的 AI 对话模型');
    const sourceTexts = await Promise.all(
      input.sources.map(async (source) => {
        if (source.mimeType.startsWith('image/')) return '';
        input.signal.throwIfAborted();
        let text = source.content;
        if (source.encoding === 'base64') {
          const parser = getAichatApi();
          if (!parser?.parseAttachment) throw new Error(`当前环境无法读取附件：${source.name}`);
          const parsed = await parser.parseAttachment({
            base64: source.content,
            ext: source.name.split('.').pop()?.toLowerCase(),
            mime: source.mimeType,
          });
          text = parsed.text;
        }
        if (!text.trim()) throw new Error(`附件未提取到可读文本：${source.name}`);
        return `--- 附件材料：${source.name} ---\n${text}\n--- 附件材料结束 ---`;
      }),
    );
    input.signal.throwIfAborted();
    const attachmentText = sourceTexts.filter(Boolean).join('\n\n');
    const sourceRefs = [
      ...new Map(
        [
          ...(input.currentView?.sourceRefs ?? []),
          ...input.sources.map(({ content: _content, ...ref }) => ref),
        ].map((ref) => [ref.sourceId, ref]),
      ).values(),
    ];
    const instruction = [
      input.instruction,
      sourceRefs.length
        ? `可用于 FilePreview 的附件清单：${JSON.stringify(sourceRefs.map(({ sourceId, name }) => ({ sourceId, name })))}`
        : '',
      attachmentText,
    ]
      .filter(Boolean)
      .join('\n\n');
    const kind = resolveCustomToolGenerationKind(input.instruction);
    return generateCustomToolView(
      toAIConfig(model),
      {
        instruction,
        kind,
        currentContent: input.currentView?.content ?? '',
        history: input.history,
      },
      (view) => onUpdate({ ...view, sourceRefs }),
      {
        context: 'chat',
        temperature: input.temperature,
        topP: input.topP,
        abortSignal: input.signal,
        referenceImages: input.sources
          .filter((source) => source.encoding === 'base64' && source.mimeType.startsWith('image/'))
          .map((source) => ({
            name: source.name,
            mimeType: source.mimeType,
            base64: source.content,
          })),
      },
    ).then((view) => ({ ...view, sourceRefs }));
  };
}
