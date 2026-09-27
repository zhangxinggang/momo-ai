import { getBuiltinSkillPrompt } from '@/shared/builtin-skills';
import {
  ChatInputPanel,
  useAiChatConfig,
  useChatContext,
  type IChatAttachment,
} from '@momo/aichat';
import { useToast } from '@renderer/components/ui/Toast';
import { useTrackAiChatGeneration } from '@renderer/hooks/useAiChatGenerationActivity';
import { getModelsByType, toAIConfig } from '@renderer/services/ai/defaults';
import { saveCustomTool } from '@renderer/services/custom-tool/api';
import {
  generateCustomToolView,
  resolveCustomToolGenerationKind,
} from '@renderer/services/custom-tool/generation';
import { generateCustomToolPlugin } from '@renderer/services/custom-tool/plugin-generation';
import { useCustomToolStore, useSettingsStore } from '@renderer/store';
import { clsx } from 'clsx';
import { useCallback, useState, type KeyboardEvent } from 'react';

import styles from './index.module.less';
import type { IProps } from './types';

const MAX_ATTACHMENT_COUNT = 10;
const controllers = new Map<string, AbortController>();
let generationSequence = 0;

export function CustomToolAiComposer({ toolKey, hasContent }: IProps) {
  const { showToast } = useToast();
  const { uploadFiles, validateLocalFiles } = useAiChatConfig();
  const { currentModel, temperature, topP } = useChatContext();
  const aiModels = useSettingsStore((state) => state.aiModels);
  const document = useCustomToolStore((state) => state.document);
  const task = useCustomToolStore((state) => state.generationTasks[toolKey]);
  const setDocumentContent = useCustomToolStore((state) => state.setDocumentContent);
  const setGenerationTask = useCustomToolStore((state) => state.setGenerationTask);

  const [prompt, setPrompt] = useState('');
  const [attachments, setAttachments] = useState<IChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const isGenerating = task?.status === 'generating';
  useTrackAiChatGeneration('toolbox', isGenerating);

  const handleAttachFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      if (attachments.length + files.length > MAX_ATTACHMENT_COUNT) {
        showToast('单次最多 10 个附件', 'error');
        return;
      }
      const validation = validateLocalFiles(files);
      if (!validation.ok) {
        showToast(validation.message || '文件不合法', 'error');
        return;
      }
      setIsUploading(true);
      for (const file of files) {
        const temporaryId = `tool-attachment-${crypto.randomUUID()}`;
        const temporary: IChatAttachment = {
          id: temporaryId,
          name: file.name,
          size: file.size,
          mime: file.type,
          ext: file.name.split('.').pop()?.toLowerCase() ?? '',
          text: '',
          snippet: '',
        };
        setAttachments((items) => [...items, temporary]);
        try {
          const [uploaded] = await uploadFiles([file], (_index, progress) =>
            setProgressMap((current) => ({ ...current, [temporaryId]: progress })),
          );
          setAttachments((items) =>
            items.map((item) => (item.id === temporaryId ? uploaded : item)),
          );
        } catch (error) {
          setAttachments((items) => items.filter((item) => item.id !== temporaryId));
          showToast(error instanceof Error ? error.message : `${file.name} 上传失败`, 'error');
        }
      }
      setIsUploading(false);
    },
    [attachments.length, showToast, uploadFiles, validateLocalFiles],
  );

  const handleSend = useCallback(() => {
    const instruction = prompt.trim();
    if ((!instruction && !attachments.length) || isGenerating || isUploading || !document) return;
    const chatModels = getModelsByType(aiModels, 'chat');
    const selectedModel =
      chatModels.find((model) => model.id === currentModel) ??
      chatModels.find((model) => model.isDefault) ??
      chatModels[0];
    if (!selectedModel) {
      showToast('请先配置可用于生成自定义工具的 AI 对话模型', 'error');
      return;
    }

    const attachmentText = attachments
      .filter((file) => file.text)
      .map((file) => `--- ${file.name} ---\n${file.text.slice(0, 30_000)}`)
      .join('\n\n');
    const finalInstruction = [
      instruction || getBuiltinSkillPrompt('attachmentViewTask'),
      attachmentText,
    ]
      .filter(Boolean)
      .join('\n\n');
    const mode =
      document.kind === 'plugin' ? 'plugin' : resolveCustomToolGenerationKind(finalInstruction);
    const previous = document;
    const generationId = ++generationSequence;
    const controller = new AbortController();
    controllers.get(toolKey)?.abort();
    controllers.set(toolKey, controller);
    setGenerationTask(toolKey, { id: generationId, status: 'generating', mode, errorMessage: '' });
    setPrompt('');
    setAttachments([]);
    setProgressMap({});

    void (async () => {
      try {
        const aiConfig = toAIConfig(selectedModel);
        const referenceImages = attachments
          .filter((file) => file.imageBase64 && file.mime.startsWith('image/'))
          .map((file) => ({
            name: file.name,
            mimeType: file.mime || 'image/png',
            base64: file.imageBase64!,
          }));
        if (mode === 'plugin') {
          const generated = await generateCustomToolPlugin(
            aiConfig,
            {
              identifier: document.plugin!.identifier,
              instruction: finalInstruction,
              currentContent: document.content,
              currentPlugin: document.plugin,
            },
            (draft, repairing) => {
              const state = useCustomToolStore.getState();
              setIsRepairing(repairing);
              if (
                state.selectedId === toolKey &&
                state.generationTasks[toolKey]?.id === generationId
              )
                state.setPluginDraft(draft.content, draft.plugin!);
            },
            { temperature, topP, abortSignal: controller.signal, referenceImages },
          );
          controller.signal.throwIfAborted();
          const saved = await saveCustomTool(toolKey, generated);
          if (useCustomToolStore.getState().generationTasks[toolKey]?.id !== generationId) return;
          useCustomToolStore.getState().acceptSavedDocument(toolKey, saved);
          setGenerationTask(toolKey, { id: generationId, status: 'done', mode, errorMessage: '' });
          return;
        }
        const result = await generateCustomToolView(
          aiConfig,
          { instruction: finalInstruction, kind: mode, currentContent: document.content },
          (view) => {
            if (
              useCustomToolStore.getState().selectedId === toolKey &&
              useCustomToolStore.getState().generationTasks[toolKey]?.id === generationId
            ) {
              setIsRepairing(view.status === 'repairing');
              if (view.content) setDocumentContent(view.content, mode);
            }
          },
          { temperature, topP, abortSignal: controller.signal, referenceImages },
        );
        if (controller.signal.aborted) return;
        const saved = await saveCustomTool(toolKey, {
          ...document,
          kind: mode,
          content: result.content,
        });
        if (useCustomToolStore.getState().generationTasks[toolKey]?.id !== generationId) return;
        useCustomToolStore.getState().acceptSavedDocument(toolKey, saved);
        setGenerationTask(toolKey, { id: generationId, status: 'done', mode, errorMessage: '' });
      } catch (error) {
        if (useCustomToolStore.getState().generationTasks[toolKey]?.id !== generationId) return;
        if (useCustomToolStore.getState().selectedId === toolKey) {
          if (previous.kind === 'plugin')
            useCustomToolStore.getState().setPluginDraft(previous.content, previous.plugin!);
          else setDocumentContent(previous.content, previous.kind);
        }
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : String(error);
        setGenerationTask(toolKey, {
          id: generationId,
          status: 'error',
          mode,
          errorMessage: message,
        });
        showToast(`生成失败：${message}`, 'error');
      } finally {
        if (controllers.get(toolKey) === controller) {
          setIsRepairing(false);
          controllers.delete(toolKey);
        }
      }
    })();
  }, [
    aiModels,
    attachments,
    currentModel,
    document,
    isGenerating,
    isUploading,
    prompt,
    setDocumentContent,
    setGenerationTask,
    showToast,
    temperature,
    toolKey,
    topP,
  ]);

  const handleStop = useCallback(() => {
    const controller = controllers.get(toolKey);
    controller?.abort();
    controllers.delete(toolKey);
    if (task) setGenerationTask(toolKey, { ...task, status: 'stopped' });
  }, [setGenerationTask, task, toolKey]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!event.nativeEvent.isComposing && event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const statusText =
    task?.status === 'generating'
      ? isRepairing
        ? '正在修复并重新校验工具界面…'
        : document?.kind === 'plugin'
          ? '正在生成插件并执行测试…'
          : '正在生成工具界面…'
      : task?.status === 'done'
        ? document?.kind === 'plugin'
          ? '插件已通过测试并注册，可在 AI 对话中调用'
          : '界面已生成并保存'
        : task?.status === 'stopped'
          ? '已停止生成'
          : task?.status === 'error'
            ? `生成失败：${task.errorMessage}`
            : '';

  return (
    <div className={styles.composer}>
      <div
        className={clsx(
          styles['status-rail'],
          task?.status && styles[`status-rail--${task.status}`],
        )}>
        <div className={styles['status-rail-bar']} />
        {statusText ? (
          <div className={styles['status-rail-row']}>
            <span className={styles['status-rail-text']}>{statusText}</span>
          </div>
        ) : null}
      </div>
      <div className={styles['input-wrap']}>
        {!hasContent ? (
          <p className={styles.hint}>
            {document?.kind === 'plugin'
              ? '描述工具功能，AI 将生成插件、参数与测试；通过后可在右侧验证。'
              : '默认生成可配置的工具界面；使用 /custom-tool-tech-design 可生成高保真界面。'}
          </p>
        ) : null}
        <ChatInputPanel
          value={prompt}
          onChange={setPrompt}
          onSend={handleSend}
          onStop={handleStop}
          onKeyDown={handleKeyDown}
          placeholder={
            hasContent
              ? '描述要如何修改当前工具…'
              : document?.kind === 'plugin'
                ? '例如：生成一个统计文本字数、段落和高频词的工具'
                : '例如：生成一个可筛选的销售数据看板'
          }
          loading={isGenerating}
          isGenerating={isGenerating}
          attachments={attachments.map((item) => ({
            id: item.id,
            name: item.name,
            size: item.size,
            mime: item.mime,
            ext: item.ext,
            snippet: item.snippet,
            imageBase64: item.imageBase64,
          }))}
          isUploading={isUploading}
          progressMap={progressMap}
          onAttachFiles={handleAttachFiles}
          onRemoveAttachment={(id) =>
            setAttachments((items) => items.filter((item) => item.id !== id))
          }
        />
      </div>
    </div>
  );
}
