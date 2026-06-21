import { CloseOutlined, PaperClipOutlined, SendOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Radio, Select } from 'antd';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAiChatConfig } from '../../contexts/AiChatConfigContext';
import { useChatContext } from '../../contexts/ChatContext';
import { useSlashCommandTrigger } from '../../hooks/useSlashCommandTrigger';
import { useNoteReferenceTrigger } from '../../hooks/useNoteReferenceTrigger';
import '../../styles/chat.css';
import { ChatAttachmentIcon } from '../../utils/attachment-icon';
import { ChatAgentModeControl } from '../ChatAgentModeControl';
import { ChatFeatureDropdown } from '../ChatFeatureDropdown';
import { ChatMentionTextarea, type IChatMentionTextareaRef } from '../ChatMentionTextarea';
import { ChatWorkspaceToolbar } from '../ChatWorkspaceToolbar';
import { NoteReferencePopover } from '../NoteReferencePopover';
import { SlashCommandPopover } from '../SlashCommandPopover';

export interface IChatInputPanelRef {
  focus: () => void;
}

import type { IChatAttachmentMeta } from '../../types/chat';

interface IProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  isGenerating?: boolean;
  onFileUpload?: () => void;
  attachments?: IChatAttachmentMeta[];
  isUploading?: boolean;
  progressMap?: Record<string, number>;
  onAttachFiles?: (files: File[]) => void;
  onRemoveAttachment?: (id: string) => void;
}

const ChatInputPanel = forwardRef<IChatInputPanelRef, IProps>(
  (
    {
      value,
      onChange,
      onSend,
      onStop,
      onKeyDown,
      placeholder = '输入您的消息...',
      disabled = false,
      loading = false,
      isGenerating = false,
      onFileUpload,
      attachments = [],
      isUploading = false,
      progressMap = {},
      onAttachFiles,
      onRemoveAttachment,
    },
    ref,
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mentionTextareaRef = useRef<IChatMentionTextareaRef>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectionStart, setSelectionStart] = useState(0);
    const chatCtx = useChatContext();
    const {
      listKbCollections,
      chatModels = [],
      chatModelOptionGroups = [],
      renderModelSelect,
      workspace,
      slashCommands,
      noteReferences,
    } = useAiChatConfig();
    const [collections, setCollections] = useState<{ id: number; name: string }[]>([]);
    const [loadingKb, setLoadingKb] = useState(false);
    const {
      kbEnabled,
      setKbEnabled,
      kbCollectionId,
      setKbCollectionId,
      currentModel,
      setCurrentModel,
      agentMode,
      setAgentMode,
    } = chatCtx;

    const flatModelIds = useMemo(() => {
      if (chatModelOptionGroups.length > 0) {
        return chatModelOptionGroups.flatMap((group) => group.options.map((item) => item.id));
      }
      return chatModels.map((item) => item.id);
    }, [chatModelOptionGroups, chatModels]);

    const modelSelectOptions = useMemo(() => {
      if (chatModelOptionGroups.length > 0) {
        return chatModelOptionGroups.map((group) => ({
          label: group.label,
          options: group.options.map((item) => ({ value: item.id, label: item.label })),
        }));
      }
      return chatModels.map((item) => ({ value: item.id, label: item.label }));
    }, [chatModelOptionGroups, chatModels]);

    const selectedModel = flatModelIds.includes(currentModel) ? currentModel : flatModelIds[0];

    useEffect(() => {
      if (!flatModelIds.length) {
        return;
      }
      if (!flatModelIds.includes(currentModel)) {
        setCurrentModel(flatModelIds[0]);
      }
    }, [flatModelIds, currentModel, setCurrentModel]);

    useEffect(() => {
      if (!listKbCollections) {
        return;
      }
      let mounted = true;
      const load = async () => {
        try {
          setLoadingKb(true);
          const items = await listKbCollections();
          if (mounted) {
            setCollections(items);
          }
        } catch {
          // 忽略知识库加载失败
        } finally {
          setLoadingKb(false);
        }
      };
      load();
      const onReload = () => load();
      window.addEventListener('kb:collections-updated', onReload);
      return () => window.removeEventListener('kb:collections-updated', onReload);
    }, [listKbCollections]);

    useEffect(() => {
      if (kbEnabled && kbCollectionId === undefined && collections.length > 0) {
        setKbCollectionId(collections[0].id);
      }
    }, [kbEnabled, kbCollectionId, collections, setKbCollectionId]);

    const handleKbEnabledChange = (enabled: boolean) => {
      setKbEnabled(enabled);
      if (enabled && kbCollectionId === undefined && collections.length > 0) {
        setKbCollectionId(collections[0].id);
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          if (noteReferences) {
            mentionTextareaRef.current?.focus();
            return;
          }
          textareaRef.current?.focus();
        },
      }),
      [noteReferences],
    );

    const getActiveTextarea = () =>
      noteReferences ? mentionTextareaRef.current?.getTextareaElement() ?? null : textareaRef.current;

    const adjustTextareaHeight = () => {
      const textarea = getActiveTextarea();
      if (!textarea) {
        return;
      }
      const currentHeight = textarea.style.height;
      textarea.style.transition = 'none';
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 192;
      const newHeight = Math.min(scrollHeight, maxHeight);
      if (currentHeight) {
        textarea.style.height = currentHeight;
      }
      setTimeout(() => {
        textarea.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        textarea.style.height = `${newHeight}px`;
      }, 0);
    };

    useEffect(() => {
      const textarea = getActiveTextarea();
      if (!textarea) {
        return;
      }
      textarea.style.transition = 'none';
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120;
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      requestAnimationFrame(() => {
        textarea.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      });
    }, [noteReferences]);

    useEffect(() => {
      adjustTextareaHeight();
    }, [value, noteReferences]);

    const slash = useSlashCommandTrigger({
      value,
      onChange,
      slashCommands,
      currentModel,
      workspacePaths: workspace?.paths ?? [],
      workspaceEnabled: workspace?.enabled ?? false,
    });

    const noteRef = useNoteReferenceTrigger({
      value,
      onChange,
      noteReferences,
      selectionStart,
      onSelectionChange: (next) => {
        setSelectionStart(next);
        mentionTextareaRef.current?.setSelectionStart(next);
      },
    });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (loading && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        return;
      }
      if (noteRef.handleKeyDown(e)) {
        return;
      }
      if (slash.handleKeyDown(e)) {
        return;
      }
      onKeyDown?.(e);
    };

    const handleFileButtonClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
        return;
      }
      onFileUpload?.();
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length && onAttachFiles) {
        onAttachFiles(files);
      }
    };

    const canSend =
      !disabled &&
      !loading &&
      !isUploading &&
      (value.trim().length > 0 || (attachments && attachments.length > 0));

    const ragExtra = (
      <div className='max-h-40 overflow-y-auto'>
        {loadingKb ? (
          <div className='py-1 text-xs text-gray-500'>加载知识库...</div>
        ) : collections.length === 0 ? (
          <div className='py-1 text-xs text-gray-500'>暂无可用知识库</div>
        ) : (
          <Radio.Group
            className='flex w-full flex-col gap-1'
            value={kbCollectionId}
            onChange={(e) => setKbCollectionId(e.target.value as number)}>
            {collections.map((c) => (
              <Radio key={c.id} value={c.id} className='text-sm'>
                {c.name}
              </Radio>
            ))}
          </Radio.Group>
        )}
      </div>
    );

    return (
      <div className='chat-input-panel bg-panel border-surface relative rounded-xl border shadow-sm'>
        {attachments && attachments.length > 0 && (
          <div className='px-4 pt-4'>
            <div className='flex flex-nowrap items-stretch gap-3 overflow-x-auto'>
              {attachments.map((f) => {
                const formatBytes = (bytes: number) => {
                  if (bytes < 1024) return `${bytes}B`;
                  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
                  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
                };
                const extLower = (f.ext || '').toLowerCase();
                const displayType = (() => {
                  if (extLower === 'docx') return 'word';
                  if (extLower === 'md') return 'md';
                  if (['css', 'html', 'js', 'py', 'txt'].includes(extLower)) return extLower;
                  return 'txt';
                })();
                const charCount = typeof f.charCount === 'number' ? f.charCount : undefined;
                const displayChars = (() => {
                  if (charCount === undefined) return '';
                  if (charCount < 10000) return `${charCount}字`;
                  const w = charCount / 10000;
                  return `约 ${Math.floor(w * 10) / 10} 万字`;
                })();
                const infoLine = [displayType, formatBytes(f.size), displayChars]
                  .filter(Boolean)
                  .join(' · ');
                const progress =
                  typeof progressMap?.[f.id] === 'number' ? progressMap[f.id] : undefined;

                return (
                  <div
                    key={f.id}
                    className='border-surface bg-attachment group relative flex min-w-[220px] max-w-[280px] items-start gap-3 rounded-lg border p-3 transition-colors'>
                    <ChatAttachmentIcon
                      ext={extLower}
                      className='mt-0 shrink-0 text-blue-500'
                      size={32}
                    />
                    <div className='min-w-0 flex-1'>
                      <div className='text-attachment truncate text-sm font-normal'>{f.name}</div>
                      <div className='text-attachment-meta mt-1 text-[12px]'>
                        {infoLine}
                        {isUploading && progress !== undefined && (
                          <span className='text-attachment-progress ml-2'>{progress}%</span>
                        )}
                      </div>
                    </div>
                    {onRemoveAttachment && (
                      <button
                        aria-label='移除附件'
                        className='absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100'
                        onClick={() => onRemoveAttachment(f.id)}
                        title='移除'>
                        <CloseOutlined style={{ fontSize: 12 }} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className='relative px-4 pb-2 pt-4'>
          <SlashCommandPopover
            open={slash.open}
            items={slash.items}
            selectedIndex={slash.selectedIndex}
            loading={slash.loading}
            warning={slash.warning}
            onSelect={slash.handleSelect}
            onHover={slash.setSelectedIndex}
          />
          <NoteReferencePopover
            ref={noteRef.popoverRef}
            open={noteRef.open}
            tree={noteRef.tree}
            loading={noteRef.loading}
            selectedFileId={noteRef.selectedFileId}
            expandedKeys={noteRef.expandedKeys}
            onToggleFolder={noteRef.toggleFolder}
            onSelectFile={noteRef.handleSelectFile}
          />
          {noteReferences ? (
            <ChatMentionTextarea
              ref={mentionTextareaRef}
              value={value}
              onChange={onChange}
              onKeyDown={handleKeyDown}
              onSelectionChange={setSelectionStart}
              onMentionClick={noteRef.openReplaceMenu}
              placeholder={placeholder}
              disabled={disabled}
              className='chat-input-textarea min-h-[24px] w-full resize-none border-none bg-transparent text-base leading-6 placeholder-gray-400 outline-none focus-visible:ring-0 dark:placeholder-gray-500'
              style={{
                fontSize: '16px',
                lineHeight: '1.5',
                fontFamily: 'inherit',
                transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          ) : (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className='chat-input-textarea min-h-[24px] w-full resize-none border-none bg-transparent text-base leading-6 placeholder-gray-400 outline-none focus-visible:ring-0 dark:placeholder-gray-500'
              style={{
                fontSize: '16px',
                lineHeight: '1.5',
                fontFamily: 'inherit',
                transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          )}
          <input
            ref={fileInputRef}
            type='file'
            multiple
            className='hidden'
            onChange={handleFileInputChange}
          />
        </div>

        <div className='chat-input-toolbar flex flex-wrap items-center justify-between gap-x-2 gap-y-2 px-4 pb-3 pt-1'>
          <div className='chat-input-toolbar-left flex min-w-0 flex-1 flex-wrap items-center gap-1.5'>
            <ChatAgentModeControl mode={agentMode} onChange={setAgentMode} />
            {renderModelSelect ? (
              renderModelSelect({
                value: selectedModel,
                onChange: (v) => setCurrentModel(v),
                variant: 'borderless',
                className: 'chat-model-select',
                disabled: flatModelIds.length === 0,
              })
            ) : flatModelIds.length > 0 ? (
              <Select
                size='small'
                variant='borderless'
                className='chat-model-select'
                placeholder='选择模型'
                options={
                  modelSelectOptions as Array<
                    | { label: string; options: Array<{ value: string; label: string }> }
                    | { value: string; label: string }
                  >
                }
                value={selectedModel}
                onChange={(v) => setCurrentModel(v as string)}
                popupMatchSelectWidth={false}
              />
            ) : null}
            {listKbCollections ? (
              <ChatFeatureDropdown
                label='RAG'
                enabled={kbEnabled}
                onEnabledChange={handleKbEnabledChange}
                enableTitle='是否启用'
                enableHint='启用后将从知识库获取知识问答'>
                {ragExtra}
              </ChatFeatureDropdown>
            ) : null}
            {workspace ? (
              <ChatFeatureDropdown
                customPanel={<ChatWorkspaceToolbar workspace={workspace} />}
                enabled={workspace.enabled}
                label='工作区'
              />
            ) : null}
          </div>

          <div className='chat-input-toolbar-right flex shrink-0 items-center gap-1.5'>
            <Button
              type='text'
              size='small'
              icon={<PaperClipOutlined />}
              onClick={handleFileButtonClick}
              className='chat-input-attach-btn flex items-center justify-center text-gray-500 transition-all duration-200 hover:bg-[var(--surface-hover)] hover:text-blue-500 dark:text-gray-300'
              title='上传文件'
            />
            {isGenerating ? (
              <Button
                type='primary'
                size='small'
                icon={<StopOutlined />}
                onClick={onStop}
                className='chat-input-action-btn chat-input-stop-btn flex h-8 w-8 items-center justify-center rounded-full border-0 bg-red-500 p-0 shadow-sm hover:bg-red-600'
                title='停止生成'
              />
            ) : (
              <Button
                type='primary'
                size='small'
                icon={<SendOutlined />}
                onClick={onSend}
                disabled={!canSend}
                className='chat-input-action-btn chat-input-send-btn flex h-8 w-8 items-center justify-center rounded-full border-0 p-0 shadow-sm disabled:bg-gray-300 disabled:opacity-60'
                title='发送'
              />
            )}
          </div>
        </div>
      </div>
    );
  },
);

ChatInputPanel.displayName = 'ChatInputPanel';

export default ChatInputPanel;
