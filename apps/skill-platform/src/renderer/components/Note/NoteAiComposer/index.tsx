import {
  ChatInputPanel,
  useAiChatConfig,
  useChatContext,
  type IChatAttachment,
  type IChatSession,
} from '@momo/aichat';
import { useToast } from '@renderer/components/ui/Toast';
import { useTrackAiChatGeneration } from '@renderer/hooks/useAiChatGenerationActivity';
import { useNoteStore } from '@renderer/store';
import { clsx } from 'clsx';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import styles from './index.module.less';
import { buildNoteRewriteMessages, unwrapFullDocumentFence } from './rewrite';
import { ERewriteStatus, type IProps } from './types';

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

export function NoteAiComposer({ noteKey, onRewritingChange }: IProps) {
  const { showToast } = useToast();
  const editorContent = useNoteStore((state) => state.editorContent);
  const setEditorContent = useNoteStore((state) => state.setEditorContent);
  const saveCurrentFile = useNoteStore((state) => state.saveCurrentFile);
  const { callAIChatStream, uploadFiles, validateLocalFiles, isImageModel, superpowerPrompts } =
    useAiChatConfig();
  const { currentModel, kbEnabled, kbCollectionId, temperature, topP, systemPrompt, agentMode } =
    useChatContext();

  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<ERewriteStatus>(ERewriteStatus.EIdle);
  const [errorMessage, setErrorMessage] = useState('');
  const [undoSnapshot, setUndoSnapshot] = useState<string | null>(null);
  const [appliedContent, setAppliedContent] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<IChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [exportSession, setExportSession] = useState<IChatSession | null>(null);

  const stoppedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const generationIdRef = useRef(0);
  const onRewritingChangeRef = useRef(onRewritingChange);
  onRewritingChangeRef.current = onRewritingChange;

  const isRewriting = status === ERewriteStatus.ERewriting;
  useTrackAiChatGeneration('note', isRewriting);
  const isCurrentImageModel = Boolean(currentModel && isImageModel?.(currentModel));
  const canUndo =
    undoSnapshot !== null &&
    (status === ERewriteStatus.EDone ||
      status === ERewriteStatus.EStopped ||
      status === ERewriteStatus.EError);

  useEffect(() => {
    setExportSession(null);
  }, [noteKey]);

  useEffect(() => {
    onRewritingChangeRef.current(isRewriting);
  }, [isRewriting]);

  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      abortControllerRef.current?.abort();
      onRewritingChangeRef.current(false);
    };
  }, []);

  useEffect(() => {
    if (isRewriting) {
      return;
    }
    if (
      status !== ERewriteStatus.EDone &&
      status !== ERewriteStatus.EStopped &&
      status !== ERewriteStatus.EError
    ) {
      return;
    }
    if (appliedContent === null || editorContent === appliedContent) {
      return;
    }
    setStatus(ERewriteStatus.EIdle);
    setUndoSnapshot(null);
    setAppliedContent(null);
    setErrorMessage('');
  }, [appliedContent, editorContent, isRewriting, status]);

  const handleUndo = useCallback(() => {
    if (undoSnapshot === null) {
      return;
    }
    setEditorContent(undoSnapshot);
    setAppliedContent(undoSnapshot);
    setUndoSnapshot(null);
    setStatus(ERewriteStatus.EIdle);
    setErrorMessage('');
    void saveCurrentFile();
  }, [saveCurrentFile, setEditorContent, undoSnapshot]);

  const handleStop = useCallback(() => {
    if (!stoppedRef.current && status === ERewriteStatus.ERewriting) {
      stoppedRef.current = true;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      const nextContent = useNoteStore.getState().editorContent;
      setAppliedContent(nextContent);
      setStatus(ERewriteStatus.EStopped);
      void saveCurrentFile();
    }
  }, [saveCurrentFile, status]);

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
      isRewriting ||
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
      instruction = `${attachmentsPrompt}\n\n我的问题：\n${userContent || '(基于以上文件，请给出总结/见解)'}`;
    } else if (isCurrentImageModel && !userContent && referenceImages.length > 0) {
      instruction = '请根据参考图生成或编辑图片';
    }

    const snapshot = useNoteStore.getState().editorContent;
    const targetPath = noteKey;
    const runtimeSessionId = `note-rewrite-${crypto.randomUUID()}`;
    const startedAt = Date.now();
    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();
    const initialExportSession: IChatSession = {
      id: runtimeSessionId,
      title: `笔记改写：${noteKey.split('/').pop() || noteKey}`,
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
    const generationId = generationIdRef.current + 1;
    const abortController = new AbortController();
    generationIdRef.current = generationId;
    abortControllerRef.current = abortController;
    stoppedRef.current = false;

    setPrompt('');
    setAttachments([]);
    setProgressMap({});
    setUndoSnapshot(snapshot);
    setAppliedContent(null);
    setErrorMessage('');
    setStatus(ERewriteStatus.ERewriting);
    setExportSession(initialExportSession);

    const isCurrentGeneration = () =>
      generationIdRef.current === generationId && useNoteStore.getState().selectedId === targetPath;

    const superpowerParts: string[] = [];
    if (agentMode === 'plan' && superpowerPrompts?.workflow?.trim()) {
      superpowerParts.push(superpowerPrompts.workflow.trim());
    }
    if (systemPrompt.trim()) {
      superpowerParts.push(systemPrompt.trim());
    }

    void (async () => {
      let acc = '';
      let streamError = '';
      try {
        await callAIChatStream(
          buildNoteRewriteMessages(snapshot, instruction),
          (chunk) => {
            if (stoppedRef.current || !isCurrentGeneration()) {
              return;
            }
            acc += chunk;
            setEditorContent(acc);
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

        if (!isCurrentGeneration() || stoppedRef.current) {
          return;
        }

        if (streamError) {
          throw new Error(streamError);
        }

        const nextContent = unwrapFullDocumentFence(acc);
        const completedAt = Date.now();
        setExportSession({
          ...initialExportSession,
          updatedAt: completedAt,
          messages: [
            ...initialExportSession.messages,
            {
              id: assistantMessageId,
              role: 'assistant',
              content: nextContent,
              timestamp: completedAt,
            },
          ],
        });
        setEditorContent(nextContent);
        setAppliedContent(nextContent);
        setStatus(ERewriteStatus.EDone);
        void saveCurrentFile();
      } catch (error) {
        if (!isCurrentGeneration() || stoppedRef.current) {
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
              content: acc ? `${acc}\n\n---\n改写失败：${message}` : `改写失败：${message}`,
              timestamp: failedAt,
              isError: true,
            },
          ],
        });
        if (!acc) {
          setEditorContent(snapshot);
          setUndoSnapshot(null);
          setAppliedContent(null);
          setStatus(ERewriteStatus.EError);
          setErrorMessage(message);
          return;
        }
        const nextContent = useNoteStore.getState().editorContent;
        setAppliedContent(nextContent);
        setStatus(ERewriteStatus.EError);
        setErrorMessage(message);
        void saveCurrentFile();
      } finally {
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    })();
  }, [
    agentMode,
    attachments,
    callAIChatStream,
    currentModel,
    isCurrentImageModel,
    isRewriting,
    isUploading,
    kbCollectionId,
    kbEnabled,
    noteKey,
    prompt,
    saveCurrentFile,
    setEditorContent,
    superpowerPrompts,
    systemPrompt,
    temperature,
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
  if (status === ERewriteStatus.ERewriting) {
    statusText = '正在改写…';
  } else if (status === ERewriteStatus.EDone) {
    statusText = '已改写全文';
  } else if (status === ERewriteStatus.EStopped) {
    statusText = '已停止';
  } else if (status === ERewriteStatus.EError) {
    statusText = errorMessage ? `改写失败：${errorMessage}` : '改写失败';
  }

  return (
    <div className={styles.composer}>
      <div
        className={clsx(
          styles['status-rail'],
          status === ERewriteStatus.ERewriting && styles['status-rail--rewriting'],
          status === ERewriteStatus.EDone && styles['status-rail--done'],
          status === ERewriteStatus.EStopped && styles['status-rail--stopped'],
          status === ERewriteStatus.EError && styles['status-rail--error'],
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
                aria-label='撤销本次改写'>
                {'撤销本次'}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className={styles['input-wrap']}>
        <p className={styles.hint}>{'基于当前笔记提问，发送后将改写全文'}</p>
        <ChatInputPanel
          value={prompt}
          onChange={setPrompt}
          onSend={handleSend}
          onStop={handleStop}
          onKeyDown={handleKeyDown}
          placeholder='缩短、润色或提问，发送后将改写这篇笔记'
          loading={isRewriting}
          isGenerating={isRewriting}
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
