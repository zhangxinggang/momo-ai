import {
  ChatInputPanel,
  useAiChatConfig,
  useChatContext,
  type IChatAttachment,
  type IChatSession,
} from '@momo/aichat';
import { useToast } from '@renderer/components/ui/Toast';
import { useTrackAiChatGeneration } from '@renderer/hooks/useAiChatGenerationActivity';
import { readCustomToolContextFiles } from '@renderer/services/custom-tool/api';
import {
  buildToolBundleMessages,
  buildToolBundleRepairMessages,
  extractStreamingHtml,
  isRepairableToolBundleError,
  parseToolBundleOutput,
  validateGeneratedToolBundle,
} from '@renderer/services/custom-tool/generate-html';
import {
  beginCustomToolGeneration,
  cancelCustomToolGeneration,
  completeCustomToolGeneration,
  failCustomToolGeneration,
  isCustomToolGenerationActive,
  publishCustomToolGenerationHtml,
  undoCustomToolGeneration,
  updateCustomToolGenerationSnapshot,
} from '@renderer/services/custom-tool/generation-task';
import { useCustomToolStore } from '@renderer/store';
import { clsx } from 'clsx';
import { useCallback, useEffect, useState, type KeyboardEvent } from 'react';

import styles from './index.module.less';
import { EGenerateStatus, type IProps } from './types';

const MAX_ATTACHMENT_COUNT = 10;
const MAX_ATTACHMENT_CHARS = 50000;

function buildAttachmentsPrompt(files: IChatAttachment[]): string {
  if (files.length === 0) {
    return '';
  }
  const perFile = Math.max(1, Math.floor(MAX_ATTACHMENT_CHARS / files.length));
  const blocks = files.map((file) => {
    const text = file.text || '';
    const content = text.length > perFile ? text.slice(0, perFile) : text;
    return [
      `--- 文件: ${file.name} (type=${file.ext}, chars=${content.length}) START ---`,
      content,
      `--- 文件: ${file.name} END ---`,
    ].join('\n');
  });
  return ['以下为用户上传的文件内容（可能已截断），回答可引用并标注文件名：', ...blocks].join(
    '\n\n',
  );
}

/** 自定义工具编辑态底部：复用 ChatInputPanel（与笔记 AI 对话框同款） */
export function CustomToolAiComposer(props: IProps) {
  const { toolKey, hasHtml, getCurrentHtml } = props;
  const { showToast } = useToast();
  const generationTask = useCustomToolStore((state) => state.generationTasks[toolKey]);
  const { callAIChatStream, uploadFiles, validateLocalFiles, isImageModel, superpowerPrompts } =
    useAiChatConfig();
  const { currentModel, kbEnabled, kbCollectionId, temperature, topP, systemPrompt, agentMode } =
    useChatContext();

  const [prompt, setPrompt] = useState('');
  const [attachments, setAttachments] = useState<IChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [exportSession, setExportSession] = useState<IChatSession | null>(null);

  useEffect(() => {
    setExportSession(null);
  }, [toolKey]);

  const status = (generationTask?.status ?? EGenerateStatus.EIdle) as EGenerateStatus;
  const errorMessage = generationTask?.errorMessage ?? '';
  const isGenerating = status === EGenerateStatus.EGenerating;
  useTrackAiChatGeneration('toolbox', isGenerating);
  const isCurrentImageModel = Boolean(currentModel && isImageModel?.(currentModel));
  const canUndo =
    generationTask !== undefined &&
    (status === EGenerateStatus.EDone ||
      status === EGenerateStatus.EStopped ||
      status === EGenerateStatus.EError);

  const handleUndo = useCallback(() => {
    if (!generationTask) {
      return;
    }
    void (async () => {
      try {
        await undoCustomToolGeneration(toolKey);
      } catch (error) {
        showToast(error instanceof Error ? error.message : '撤销生成失败', 'error');
      }
    })();
  }, [generationTask, showToast, toolKey]);

  const handleStop = useCallback(() => {
    if (status === EGenerateStatus.EGenerating) {
      void cancelCustomToolGeneration(toolKey, { rollback: false });
    }
  }, [status, toolKey]);

  const handleAttachFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) {
        return;
      }
      if (attachments.length + files.length > MAX_ATTACHMENT_COUNT) {
        showToast('单次最多 10 个附件', 'error');
        return;
      }
      const validation = validateLocalFiles(files);
      if (!validation.ok) {
        showToast(validation.message || '文件不合法', 'error');
        return;
      }

      const tempItems: IChatAttachment[] = files.map((file) => {
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        return {
          id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          size: file.size,
          mime: file.type || '',
          ext,
          text: '',
          snippet: '',
        };
      });

      setAttachments((prev) => [...prev, ...tempItems]);
      setIsUploading(true);

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const tempId = tempItems[index].id;
        try {
          const [uploaded] = await uploadFiles([file], (_fileIndex, progress) => {
            setProgressMap((prev) => ({ ...prev, [tempId]: progress }));
          });
          setAttachments((prev) => prev.map((item) => (item.id === tempId ? uploaded : item)));
        } catch (error) {
          const message = error instanceof Error ? error.message : `${file.name} 上传失败`;
          showToast(message, 'error');
          setAttachments((prev) => prev.filter((item) => item.id !== tempId));
        }
      }

      setIsUploading(false);
    },
    [attachments.length, showToast, uploadFiles, validateLocalFiles],
  );

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
    setProgressMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const handleSend = useCallback(() => {
    const hasText = Boolean(prompt.trim());
    const hasImageAttachments = attachments.some(
      (file) => file.imageBase64 && file.mime.startsWith('image/'),
    );
    if (
      (!hasText && !(isCurrentImageModel && hasImageAttachments) && attachments.length === 0) ||
      isGenerating ||
      isUploading
    ) {
      return;
    }

    const userContent = prompt.trim();
    const attachmentsPrompt = buildAttachmentsPrompt(attachments);
    const referenceImages = attachments
      .filter((file) => file.imageBase64 && file.mime.startsWith('image/'))
      .map((file) => ({
        name: file.name,
        mimeType: file.mime || 'image/png',
        base64: file.imageBase64!,
      }));

    let instruction = userContent;
    if (!isCurrentImageModel && attachments.length > 0) {
      instruction = `${attachmentsPrompt}\n\n我的问题：\n${userContent || '(基于以上文件，请生成或改写工具页)'}`;
    } else if (isCurrentImageModel && !userContent && referenceImages.length > 0) {
      instruction = '请根据参考图生成或改写工具页';
    }

    const targetPath = toolKey;
    const runtimeSessionId = `tool-generation-${crypto.randomUUID()}`;
    const startedAt = Date.now();
    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();
    const exportTitle = `自定义工具：${toolKey.split('/').pop() || toolKey}`;
    const initialExportSession: IChatSession = {
      id: runtimeSessionId,
      title: exportTitle,
      createdAt: startedAt,
      updatedAt: startedAt,
      messages: [
        {
          id: userMessageId,
          role: 'user',
          content: instruction,
          timestamp: startedAt,
        },
      ],
    };
    const abortController = new AbortController();
    const initialHtml = useCustomToolStore.getState().editorContent;
    const generationId = beginCustomToolGeneration(
      targetPath,
      [{ path: 'index.html', content: initialHtml }],
      abortController,
    );

    setPrompt('');
    setAttachments([]);
    setProgressMap({});
    setExportSession(initialExportSession);

    const isCurrentGeneration = () => isCustomToolGenerationActive(targetPath, generationId);

    const superpowerParts: string[] = [];
    if (agentMode === 'plan' && superpowerPrompts?.workflow?.trim()) {
      superpowerParts.push(superpowerPrompts.workflow.trim());
    }
    if (systemPrompt.trim()) {
      superpowerParts.push(systemPrompt.trim());
    }

    void (async () => {
      let lastPublishedHtml = '';
      let latestOutput = '';
      try {
        const [snapshot, contextFiles] = await Promise.all([
          getCurrentHtml(),
          readCustomToolContextFiles(targetPath),
        ]);
        if (!isCurrentGeneration()) {
          return;
        }
        const currentFiles = contextFiles.filter((file) => file.path !== 'index.html');
        currentFiles.unshift({ path: 'index.html', content: snapshot });
        updateCustomToolGenerationSnapshot(targetPath, generationId, currentFiles);

        const visibleToolName = toolKey.split('/').pop() || toolKey;
        let messages = buildToolBundleMessages(currentFiles, instruction, visibleToolName);

        for (let attempt = 0; attempt < 2; attempt += 1) {
          let acc = '';
          let streamError = '';
          let lastPublishedAt = 0;
          const publishStreamingHtml = (force = false) => {
            const now = performance.now();
            if (!force && now - lastPublishedAt < 80) {
              return;
            }
            const html = extractStreamingHtml(acc);
            if (!html || html === lastPublishedHtml) {
              return;
            }
            lastPublishedAt = now;
            lastPublishedHtml = html;
            publishCustomToolGenerationHtml(targetPath, generationId, html);
          };

          await callAIChatStream(
            messages,
            (chunk) => {
              if (!isCurrentGeneration()) {
                return;
              }
              acc += chunk;
              latestOutput = acc;
              publishStreamingHtml();
            },
            (error) => {
              streamError = error;
            },
            undefined,
            currentModel,
            {
              sessionId: runtimeSessionId,
              temperature,
              top_p: topP,
              abortController,
              user_system_prompt: superpowerParts.join('\n\n') || undefined,
              kb_enabled: isCurrentImageModel ? false : kbEnabled,
              kb_collection_id: kbCollectionId,
              kb_top_k: 6,
              referenceImages:
                isCurrentImageModel && referenceImages.length > 0 ? referenceImages : undefined,
            },
          );

          if (!isCurrentGeneration()) {
            return;
          }
          if (streamError) {
            throw new Error(streamError);
          }

          publishStreamingHtml(true);
          const files = parseToolBundleOutput(acc);
          const validationError = validateGeneratedToolBundle(files, currentFiles);
          if (validationError) {
            if (attempt === 0) {
              messages = buildToolBundleRepairMessages(
                currentFiles,
                instruction,
                visibleToolName,
                acc,
                validationError,
              );
              continue;
            }
            throw new Error(`自动修复后仍未生成可调用工具：${validationError}`);
          }

          try {
            await completeCustomToolGeneration(targetPath, generationId, files);
            const completedAt = Date.now();
            setExportSession({
              ...initialExportSession,
              updatedAt: completedAt,
              messages: [
                ...initialExportSession.messages,
                {
                  id: assistantMessageId,
                  role: 'assistant',
                  content: acc,
                  timestamp: completedAt,
                },
              ],
            });
            return;
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (!isRepairableToolBundleError(message)) {
              throw error;
            }
            if (attempt === 0) {
              messages = buildToolBundleRepairMessages(
                currentFiles,
                instruction,
                visibleToolName,
                acc,
                message,
              );
              continue;
            }
            throw new Error(`自动修复后仍未生成可调用工具：${message}`);
          }
        }
      } catch (error) {
        if (!isCurrentGeneration()) {
          return;
        }
        const message = error instanceof Error ? error.message : String(error);
        const failedAt = Date.now();
        setExportSession({
          ...initialExportSession,
          updatedAt: failedAt,
          messages: [
            ...initialExportSession.messages,
            {
              id: assistantMessageId,
              role: 'assistant',
              content: latestOutput
                ? `${latestOutput}\n\n---\n生成失败：${message}`
                : `生成失败：${message}`,
              timestamp: failedAt,
              isError: true,
            },
          ],
        });
        if (failCustomToolGeneration(targetPath, generationId, message)) {
          showToast(message, 'error');
        }
      }
    })();
  }, [
    agentMode,
    attachments,
    callAIChatStream,
    currentModel,
    getCurrentHtml,
    isCurrentImageModel,
    isGenerating,
    isUploading,
    kbCollectionId,
    kbEnabled,
    prompt,
    showToast,
    superpowerPrompts,
    systemPrompt,
    temperature,
    toolKey,
    topP,
  ]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.nativeEvent.isComposing) {
        return;
      }
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  let statusText = '';
  if (status === EGenerateStatus.EGenerating) {
    statusText = hasHtml ? '正在流式改写工具…' : '正在流式生成工具…';
  } else if (status === EGenerateStatus.EDone) {
    statusText = '工具文件已生成并保存';
  } else if (status === EGenerateStatus.EStopped) {
    statusText = '已停止，已保留接收到的页面内容';
  } else if (status === EGenerateStatus.EError) {
    statusText = errorMessage ? `生成失败：${errorMessage}` : '生成失败';
  }

  return (
    <div className={styles.composer}>
      <div
        className={clsx(
          styles['status-rail'],
          status === EGenerateStatus.EGenerating && styles['status-rail--generating'],
          status === EGenerateStatus.EDone && styles['status-rail--done'],
          status === EGenerateStatus.EStopped && styles['status-rail--stopped'],
          status === EGenerateStatus.EError && styles['status-rail--error'],
        )}>
        <div className={styles['status-rail-bar']} />
        {statusText ? (
          <div className={styles['status-rail-row']}>
            <span className={styles['status-rail-text']}>{statusText}</span>
            {canUndo ? (
              <button
                type='button'
                className={styles['status-rail-undo']}
                onClick={handleUndo}
                aria-label='撤销本次生成'>
                {'撤销本次'}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className={styles['input-wrap']}>
        <p className={styles.hint}>
          {hasHtml
            ? '直接说想怎么改；工具 ID、action 和参数由系统维护'
            : '只需描述想完成的事情；工具 ID、action、参数和返回结构会自动生成'}
        </p>
        <ChatInputPanel
          value={prompt}
          onChange={setPrompt}
          onSend={handleSend}
          onStop={handleStop}
          onKeyDown={handleKeyDown}
          placeholder={hasHtml ? '描述要如何修改当前工具…' : '例如：请显示当前西安的实时天气'}
          loading={isGenerating}
          isGenerating={isGenerating}
          attachments={attachments.map((item) => ({
            id: item.id,
            name: item.name,
            size: item.size,
            mime: item.mime,
            ext: item.ext,
            snippet: item.snippet,
            charCount: typeof item.text === 'string' ? item.text.length : undefined,
            imageBase64: item.imageBase64,
          }))}
          isUploading={isUploading}
          progressMap={progressMap}
          onAttachFiles={handleAttachFiles}
          onRemoveAttachment={handleRemoveAttachment}
          exportSession={exportSession}
          showSessionCommands={false}
        />
      </div>
    </div>
  );
}
