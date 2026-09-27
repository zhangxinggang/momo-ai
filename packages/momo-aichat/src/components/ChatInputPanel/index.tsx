import { CloseOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons';
import type { PermissionMode } from '@momo/agent-contracts';
import { Alert, App, Button, Input, Modal, Popover, Select } from 'antd';
import {
  ArrowUp,
  Check,
  Circle,
  Database,
  Download,
  FilePenLine,
  Lightbulb,
  PanelsTopLeft,
  Paperclip,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAiChatConfig } from '../../contexts/AiChatConfigContext';
import { useChatContext } from '../../contexts/ChatContext';
import { useNoteReferenceTrigger } from '../../hooks/useNoteReferenceTrigger';
import { useSlashCommandTrigger } from '../../hooks/useSlashCommandTrigger';
import '../../styles/chat.css';
import { ChatAttachmentIcon } from '../../utils/attachment-icon';
import { downloadChatSessionExport } from '../../utils/chat-session-export';
import { ChatContextUsage } from '../ChatContextUsage';
import { ChatMentionTextarea, type IChatMentionTextareaRef } from '../ChatMentionTextarea';
import { NoteReferencePopover } from '../NoteReferencePopover';
import { SlashCommandPopover } from '../SlashCommandPopover';
export interface IChatInputPanelRef {
  focus: () => void;
}

import type { IChatAttachmentMeta, IChatSession } from '../../types/chat';

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
  /**
   * 单轮编辑器最近一次独立会话。undefined 沿用当前聊天会话，null 表示尚无可导出会话。
   */
  exportSession?: IChatSession | null;
}

const EMPTY_WORKSPACE_PATHS: string[] = [];

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
      exportSession,
    },
    ref,
  ) => {
    const mentionTextareaRef = useRef<IChatMentionTextareaRef>(null);
    const notePopoverAnchorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const commandMenuRef = useRef<HTMLDivElement>(null);
    const [panelWidth, setPanelWidth] = useState(320);
    const [menuOffset, setMenuOffset] = useState<[number, number]>([-12, -64]);
    const [selectionStart, setSelectionStart] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuSelected, setMenuSelected] = useState(0);
    const [permissionOpen, setPermissionOpen] = useState(false);
    const [modeOpen, setModeOpen] = useState(false);
    const [permissionSaving, setPermissionSaving] = useState(false);
    const [knowledgeOpen, setKnowledgeOpen] = useState(false);
    const [knowledgeCollections, setKnowledgeCollections] = useState<
      Array<{ id: string; name: string }>
    >([]);
    const [knowledgeLoading, setKnowledgeLoading] = useState(false);
    const [goalOpen, setGoalOpen] = useState(false);
    const [goalDraft, setGoalDraft] = useState('');
    const [clearContextSessionId, setClearContextSessionId] = useState<string | null>(null);
    const [clearingContext, setClearingContext] = useState(false);
    const { message } = App.useApp();
    const chatCtx = useChatContext();
    const {
      chatModels = [],
      chatModelOptionGroups = [],
      renderModelSelect,
      workspace,
      slashCommands,
      noteReferences,
      renderInputToolbarLeftExtra,
      runtime,
      viewGeneration,
      listKbCollections,
    } = useAiChatConfig();
    const {
      currentSession,
      currentModel,
      setCurrentModel,
      agentMode,
      setAgentMode,
      permissionMode,
      setPermissionMode,
      kbEnabled,
      setKbEnabled,
      kbCollectionId,
      setKbCollectionId,
    } = chatCtx;
    useEffect(() => {
      if (clearContextSessionId && clearContextSessionId !== currentSession?.id && !clearingContext)
        setClearContextSessionId(null);
    }, [clearContextSessionId, clearingContext, currentSession?.id]);
    const goal = [...(currentSession?.messages ?? [])]
      .reverse()
      .find((item) => item.goal !== undefined)?.goal;
    const permissions: Array<{ id: PermissionMode; label: string; icon: React.ReactNode }> = [
      { id: 'read-only', label: '仅可查看', icon: <ShieldCheck size={15} /> },
      { id: 'workspace-write', label: '工作区内修改', icon: <FilePenLine size={15} /> },
      { id: 'danger-full-access', label: '完全权限', icon: <ShieldAlert size={15} /> },
    ];
    const selectedPermission =
      permissions.find((item) => item.id === permissionMode) ?? permissions[1];
    const mentionInputHint = workspace?.paths.length ? '@ 引用笔记或工作区文件' : '@ 引用笔记';

    const inputPlaceholder = (() => {
      if (slashCommands?.isActive(currentModel)) {
        return noteReferences
          ? `输入消息，/ 命令，${mentionInputHint}`
          : '输入消息，或 / 查看命令...';
      }
      return noteReferences ? `输入消息，${mentionInputHint}` : placeholder;
    })();

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
      const panel = panelRef.current;
      if (!panel) return;
      const measure = () => {
        const bounds = panel.getBoundingClientRect();
        setPanelWidth(bounds.width);
        const trigger = panel.querySelector('.chat-input-attach-btn')?.getBoundingClientRect();
        if (trigger) setMenuOffset([bounds.left - trigger.left + 1, bounds.top - trigger.top - 8]);
      };
      const observer = new ResizeObserver(measure);
      measure();
      observer.observe(panel);
      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      if (menuOpen) window.requestAnimationFrame(() => commandMenuRef.current?.focus());
    }, [menuOpen]);

    useEffect(() => {
      if (!listKbCollections || (!knowledgeOpen && !kbEnabled)) {
        return;
      }
      let mounted = true;
      const loadCollections = async () => {
        setKnowledgeLoading(true);
        try {
          const collections = await listKbCollections();
          if (mounted) {
            setKnowledgeCollections(collections);
          }
        } catch (error) {
          if (mounted && knowledgeOpen) {
            message.error(error instanceof Error ? error.message : '加载知识库失败');
          }
        } finally {
          if (mounted) {
            setKnowledgeLoading(false);
          }
        }
      };
      void loadCollections();
      const handleCollectionsUpdated = () => void loadCollections();
      window.addEventListener('kb:collections-updated', handleCollectionsUpdated);
      return () => {
        mounted = false;
        window.removeEventListener('kb:collections-updated', handleCollectionsUpdated);
      };
    }, [kbEnabled, knowledgeOpen, listKbCollections, message]);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          mentionTextareaRef.current?.focus();
        },
      }),
      [],
    );

    const moveEditorSelection = useCallback((next: number) => {
      setSelectionStart(next);
      // onChange 后等受控 value 完成渲染，再按新 token 长度换算光标位置。
      window.requestAnimationFrame(() => mentionTextareaRef.current?.setSelectionStart(next));
    }, []);

    const slash = useSlashCommandTrigger({
      value,
      selectionStart,
      onChange,
      onSelectionChange: moveEditorSelection,
      slashCommands,
      currentModel,
      workspacePaths: workspace?.paths ?? EMPTY_WORKSPACE_PATHS,
      workspaceEnabled: Boolean(workspace?.enabled),
    });

    const noteRef = useNoteReferenceTrigger({
      value,
      onChange,
      noteReferences,
      selectionStart,
      onSelectionChange: moveEditorSelection,
    });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) {
        return;
      }
      if (loading && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        return;
      }
      if (slash.handleKeyDown(e)) {
        return;
      }
      if (noteRef.handleKeyDown(e)) {
        return;
      }
      onKeyDown?.(e);
    };

    const handleFileButtonClick = () => {
      setMenuOpen(false);
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

    const closeMenu = () => {
      setModeOpen(false);
      setPermissionOpen(false);
      setKnowledgeOpen(false);
      setMenuOpen(false);
      window.requestAnimationFrame(() => mentionTextareaRef.current?.focus());
    };
    const runCommand = async (command: 'goal' | 'compact', argument = '') => {
      closeMenu();
      setGoalOpen(false);
      const sent = await chatCtx.sendMessage(
        `/${command}${argument ? ' ' + argument : ''}`,
        undefined,
        { runtimeCommand: command },
      );
      if (!sent) message.error('操作未完成，请检查模型配置或稍后重试');
    };
    const clearContext = async () => {
      if (!clearContextSessionId || clearingContext) return;
      setClearingContext(true);
      try {
        await chatCtx.clearSession(clearContextSessionId);
        setClearContextSessionId(null);
        mentionTextareaRef.current?.focus();
      } catch (error) {
        message.error(error instanceof Error ? error.message : '清除上下文失败，请稍后重试');
      } finally {
        setClearingContext(false);
      }
    };
    const changePermission = async (mode: PermissionMode) => {
      setPermissionSaving(true);
      try {
        await setPermissionMode(mode);
        setPermissionOpen(false);
        closeMenu();
      } catch (error) {
        message.error(error instanceof Error ? error.message : '切换权限失败');
      } finally {
        setPermissionSaving(false);
      }
    };
    const permissionOptions = (
      <div className='harness-permission-menu' role='menu' aria-label='选择权限'>
        {permissions.map((item) => (
          <button
            key={item.id}
            type='button'
            role='menuitemradio'
            aria-checked={permissionMode === item.id}
            disabled={permissionSaving}
            className='harness-permission-menu-row'
            onClick={() => void changePermission(item.id)}>
            {item.icon}
            <span>{item.label}</span>
            {permissionMode === item.id && <Check size={16} />}
          </button>
        ))}
      </div>
    );
    const selectKnowledge = (collectionId: string) => {
      setKbCollectionId(collectionId);
      setKbEnabled(true);
      closeMenu();
    };
    const knowledgeOptions = (
      <div className='harness-permission-menu' role='menu' aria-label='选择知识库'>
        {knowledgeLoading && knowledgeCollections.length === 0 ? (
          <div className='harness-command-menu-empty'>{'正在加载知识库…'}</div>
        ) : knowledgeCollections.length === 0 ? (
          <div className='harness-command-menu-empty'>{'暂无可用知识库'}</div>
        ) : (
          knowledgeCollections.map((item) => (
            <button
              key={item.id}
              type='button'
              role='menuitemradio'
              aria-checked={kbEnabled && kbCollectionId === item.id}
              className='harness-permission-menu-row'
              onClick={() => selectKnowledge(item.id)}>
              <Database size={15} />
              <span title={item.name}>{item.name}</span>
              {kbEnabled && kbCollectionId === item.id && <Check size={16} />}
            </button>
          ))
        )}
      </div>
    );
    const selectedKnowledgeName =
      knowledgeCollections.find((item) => item.id === kbCollectionId)?.name ?? '知识库';
    const modeOptions = (
      <div className='harness-permission-menu' role='menu' aria-label='选择模式'>
        {[
          { id: 'plan' as const, label: '计划', icon: <Lightbulb size={15} /> },
          { id: 'ui' as const, label: '界面', icon: <PanelsTopLeft size={15} /> },
        ].map((item) => (
          <button
            key={item.id}
            type='button'
            role='menuitemradio'
            aria-checked={agentMode === item.id}
            disabled={disabled || isGenerating || (item.id === 'ui' && !viewGeneration)}
            className='harness-permission-menu-row'
            onClick={() => {
              setAgentMode(item.id);
              closeMenu();
            }}>
            {item.icon}
            <span>{item.label}</span>
            {agentMode === item.id && <Check size={16} />}
          </button>
        ))}
      </div>
    );
    const sessionForExport = exportSession === undefined ? currentSession : exportSession;
    const downloadLog = async () => {
      if (!sessionForExport) return;
      try {
        // 独立编辑器传入的会话不属于 Harness 持久化层，直接导出前端快照。
        const log =
          exportSession === undefined
            ? await runtime?.port.exportSession?.(sessionForExport.id)
            : undefined;
        downloadChatSessionExport(sessionForExport, log);
        closeMenu();
      } catch (error) {
        message.error(error instanceof Error ? error.message : '下载对话日志失败');
      }
    };
    const menuActions = [
      {
        id: 'file',
        section: '添加',
        label: '文件',
        command: 'file',
        description: '',
        icon: <Paperclip size={15} />,
        disabled: disabled || isUploading,
        onClick: handleFileButtonClick,
      },
      {
        id: 'knowledge',
        section: '添加',
        label: '知识库',
        command: 'knowledge',
        description: '选择一个知识库作为问答依据',
        icon: <Database size={15} />,
        disabled: disabled || isGenerating || !listKbCollections,
        onClick: () => {
          setKnowledgeOpen((open) => !open);
          setModeOpen(false);
          setPermissionOpen(false);
        },
      },
      {
        id: 'goal',
        section: '添加',
        label: '目标',
        command: 'goal',
        description: '设置或查看长期任务目标',
        icon: <Target size={15} />,
        disabled: disabled || !runtime,
        onClick: () => {
          setGoalDraft(goal?.objective ?? '');
          setGoalOpen(true);
          setMenuOpen(false);
        },
      },
      {
        id: 'mode',
        section: '添加',
        label: '模式',
        command: 'mode',
        description: '选择计划或界面模式',
        icon: <PanelsTopLeft size={15} />,
        disabled: disabled || isGenerating,
        onClick: () => {
          setModeOpen((open) => !open);
          setPermissionOpen(false);
          setKnowledgeOpen(false);
        },
      },
      {
        id: 'compact',
        section: '指令',
        label: '压缩',
        command: 'compact',
        description: '压缩以上对话内容',
        icon: <Circle size={15} />,
        disabled: disabled || isGenerating || !runtime || !currentSession?.messages.length,
        onClick: () => void runCommand('compact'),
      },
      {
        id: 'clear-context',
        section: '指令',
        label: '清除上下文',
        command: 'clear',
        description: '清空当前对话的所有问答记录',
        icon: <Trash2 size={15} />,
        disabled:
          disabled ||
          loading ||
          isGenerating ||
          clearingContext ||
          !currentSession?.messages.length ||
          Boolean(runtime && !runtime.port.clearSession),
        onClick: () => {
          closeMenu();
          setClearContextSessionId(currentSession!.id);
        },
      },
      {
        id: 'permission',
        section: '指令',
        label: '权限',
        command: 'permission',
        description: '切换权限预设（沙箱模式与审批策略）',
        icon: <Shield size={15} />,
        disabled: disabled || permissionSaving || !runtime,
        onClick: () => {
          setPermissionOpen((open) => !open);
          setModeOpen(false);
          setKnowledgeOpen(false);
        },
      },
      {
        id: 'download',
        section: '指令',
        label: '下载对话日志',
        command: 'download',
        description: '将当前会话内容导出为 ZIP',
        icon: <Download size={15} />,
        disabled: !sessionForExport?.messages.length,
        onClick: () => void downloadLog(),
      },
    ];
    const selectedMenuIndex = Math.min(menuSelected, menuActions.length - 1);
    const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.nativeEvent.isComposing || event.target !== event.currentTarget) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setPermissionOpen(false);
        setKnowledgeOpen(false);
        closeMenu();
      }
      if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        setMenuSelected(
          (index) =>
            (index + (event.key === 'ArrowDown' ? 1 : menuActions.length - 1)) % menuActions.length,
        );
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const action = menuActions[selectedMenuIndex];
        if (!action.disabled) action.onClick();
      }
    };
    const saveGoal = () => {
      const objective = goalDraft.trim();
      if (!objective) return;
      void runCommand('goal', goal && goal.phase !== 'complete' ? `edit ${objective}` : objective);
    };
    const controlGoal = async (action: 'pause' | 'clear') => {
      if (isGenerating && currentSession && runtime?.port.controlGoal) {
        try {
          await runtime.port.controlGoal(currentSession.id, action);
          setGoalOpen(false);
        } catch (error) {
          message.error(error instanceof Error ? error.message : '目标操作失败');
        }
      } else await runCommand('goal', action);
    };

    return (
      <div
        ref={panelRef}
        className='chat-input-panel bg-panel border-surface relative min-w-0 max-w-full rounded-xl border shadow-sm'>
        {attachments && attachments.length > 0 && (
          <div className='px-4 pt-4'>
            <div className='grid max-h-60 grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-2 overflow-y-auto overflow-x-hidden'>
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
                    className='border-surface bg-attachment group relative flex min-w-0 items-start gap-2 rounded-lg border p-3 pr-7 transition-colors'>
                    <ChatAttachmentIcon
                      ext={extLower}
                      className='mt-0 shrink-0 text-blue-500'
                      size={32}
                    />
                    <div className='min-w-0 flex-1'>
                      <div
                        title={f.name}
                        className='text-attachment line-clamp-2 break-all text-sm font-normal'>
                        {f.name}
                      </div>
                      <div className='text-attachment-meta mt-1 break-words text-[12px]'>
                        {infoLine}
                        {isUploading && progress !== undefined && (
                          <span className='text-attachment-progress ml-2'>{progress}%</span>
                        )}
                      </div>
                    </div>
                    {onRemoveAttachment && (
                      <button
                        aria-label='移除附件'
                        type='button'
                        className='absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded text-gray-400 transition-colors hover:text-red-500 focus-visible:outline'
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

        <div ref={notePopoverAnchorRef} className='relative px-4 pb-2 pt-4'>
          <SlashCommandPopover
            open={slash.open}
            items={slash.items}
            selectedIndex={slash.selectedIndex}
            loading={slash.loading}
            warning={slash.warning}
            query={slash.query}
            onQueryChange={slash.setQuery}
            onSearchKeyDown={(event) => {
              event.stopPropagation();
              if (slash.handleKeyDown(event) && ['Escape', 'Enter', 'Tab'].includes(event.key)) {
                mentionTextareaRef.current?.focus();
              }
            }}
            onSelect={(index) => {
              slash.handleSelect(index);
              mentionTextareaRef.current?.focus();
            }}
            onHover={slash.setSelectedIndex}
          />
          <NoteReferencePopover
            ref={noteRef.popoverRef}
            anchorRef={noteReferences ? notePopoverAnchorRef : undefined}
            open={noteRef.open}
            tree={noteRef.tree}
            loading={noteRef.loading}
            loadingFolderIds={noteRef.loadingFolderIds}
            selectedFileId={noteRef.selectedFileId}
            expandedKeys={noteRef.expandedKeys}
            onToggleFolder={noteRef.toggleFolder}
            onSelectFile={noteRef.handleSelectFile}
          />
          <ChatMentionTextarea
            ref={mentionTextareaRef}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            onSelectionChange={setSelectionStart}
            onMentionClick={noteReferences ? noteRef.openReplaceMenu : undefined}
            placeholder={inputPlaceholder}
            disabled={disabled}
            className='chat-input-textarea max-h-48 min-h-[24px] w-full resize-none overflow-y-auto border-none bg-transparent text-base placeholder-gray-400 outline-none focus-visible:ring-0 dark:placeholder-gray-500'
            style={{
              fontSize: '14px',
              lineHeight: '24px',
              fontFamily: 'inherit',
            }}
          />
          <input
            ref={fileInputRef}
            type='file'
            multiple
            className='hidden'
            onChange={handleFileInputChange}
          />
        </div>

        <div className='chat-input-toolbar flex items-center justify-between gap-2 px-3 pb-2 pt-1'>
          <div className='chat-input-toolbar-left flex min-w-0 flex-1 flex-wrap items-center gap-1.5'>
            <Popover
              trigger='click'
              destroyOnHidden
              placement='topLeft'
              open={menuOpen}
              arrow={false}
              align={{ offset: menuOffset }}
              styles={{ container: { padding: 4, borderRadius: 14 } }}
              onOpenChange={(open) => {
                setMenuOpen(open);
                setModeOpen(false);
                setPermissionOpen(false);
                setKnowledgeOpen(false);
                if (open) setMenuSelected(0);
              }}
              content={
                <div
                  ref={commandMenuRef}
                  tabIndex={-1}
                  onKeyDown={handleMenuKeyDown}
                  style={{
                    width: Math.max(240, Math.min(panelWidth - 10, window.innerWidth - 32)),
                  }}
                  className='harness-command-menu'
                  role='menu'
                  aria-label='添加与指令'>
                  {['添加', '指令'].map((section) => (
                    <React.Fragment key={section}>
                      <div className='harness-command-menu-heading'>{section}</div>
                      {menuActions.map((item, index) => {
                        if (item.section !== section) return null;
                        const row = (
                          <button
                            type='button'
                            role='menuitem'
                            key={item.id}
                            className={`harness-command-menu-row ${selectedMenuIndex === index ? 'is-selected' : ''}`}
                            disabled={item.disabled}
                            onMouseEnter={() => setMenuSelected(index)}
                            onClick={item.onClick}
                            aria-expanded={
                              item.id === 'mode'
                                ? modeOpen
                                : item.id === 'permission'
                                  ? permissionOpen
                                  : item.id === 'knowledge'
                                    ? knowledgeOpen
                                    : undefined
                            }>
                            <span className='harness-command-menu-icon'>{item.icon}</span>
                            <span>{item.label}</span>
                            <span className='harness-command-menu-command'>{item.command}</span>
                            <span className='harness-command-menu-description'>
                              {item.description}
                            </span>
                          </button>
                        );
                        return ['mode', 'permission', 'knowledge'].includes(item.id) ? (
                          <Popover
                            destroyOnHidden
                            key={item.id}
                            open={
                              item.id === 'mode'
                                ? modeOpen
                                : item.id === 'permission'
                                  ? permissionOpen
                                  : knowledgeOpen
                            }
                            placement='bottomLeft'
                            arrow={false}
                            trigger={[]}
                            styles={{ container: { padding: 4, borderRadius: 14 } }}
                            content={
                              item.id === 'mode'
                                ? modeOptions
                                : item.id === 'permission'
                                  ? permissionOptions
                                  : knowledgeOptions
                            }>
                            {row}
                          </Popover>
                        ) : (
                          row
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              }>
              <Button
                type='text'
                size='small'
                className='chat-input-attach-btn'
                icon={<PlusOutlined />}
                aria-label='添加与指令'
                aria-expanded={menuOpen}
                title='添加与指令'
                disabled={disabled}
              />
            </Popover>
            {runtime && (
              <Popover
                trigger='click'
                placement='topLeft'
                arrow={false}
                styles={{ container: { padding: 4, borderRadius: 14 } }}
                content={permissionOptions}>
                <button
                  type='button'
                  className='chat-input-permission-chip'
                  disabled={disabled || permissionSaving}
                  aria-label='选择权限'>
                  {selectedPermission.icon}
                  <span>{selectedPermission.label}</span>
                </button>
              </Popover>
            )}
            {renderInputToolbarLeftExtra?.()}
            {(agentMode === 'plan' || agentMode === 'ui') && (
              <button
                type='button'
                className='chat-input-plan-chip'
                disabled={disabled || isGenerating}
                aria-label={agentMode === 'ui' ? '关闭界面模式' : '关闭计划模式'}
                title={agentMode === 'ui' ? '关闭界面模式' : '关闭计划模式'}
                onClick={() => setAgentMode('ask')}>
                <span className='chat-input-plan-chip-icon'>
                  {agentMode === 'ui' ? (
                    <PanelsTopLeft size={14} className='chat-input-plan-lightbulb' />
                  ) : (
                    <Lightbulb size={14} className='chat-input-plan-lightbulb' />
                  )}
                  <X size={14} className='chat-input-plan-close' />
                </span>
                <span>{agentMode === 'ui' ? '界面' : '计划'}</span>
              </button>
            )}
            {kbEnabled && kbCollectionId && (
              <button
                type='button'
                className='chat-input-knowledge-chip'
                disabled={disabled || isGenerating}
                aria-label={`移除知识库 ${selectedKnowledgeName}`}
                title={selectedKnowledgeName}
                onClick={() => {
                  setKbEnabled(false);
                  setKbCollectionId(undefined);
                }}>
                <span className='chat-input-knowledge-chip-icon'>
                  <Database size={14} className='chat-input-knowledge-database' />
                  <X size={14} className='chat-input-knowledge-close' />
                </span>
                <span className='max-w-40 truncate'>{selectedKnowledgeName}</span>
              </button>
            )}
          </div>

          <div className='chat-input-toolbar-right flex min-w-0 shrink-0 items-center gap-1.5'>
            {renderModelSelect ? (
              renderModelSelect({
                value: selectedModel,
                onChange: (v) => setCurrentModel(v),
                variant: 'borderless',
                className: 'chat-model-select',
                disabled: disabled || isGenerating || flatModelIds.length === 0,
              })
            ) : flatModelIds.length > 0 ? (
              <Select
                size='small'
                disabled={disabled || isGenerating}
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
            <ChatContextUsage modelId={selectedModel} session={sessionForExport} />
            {isGenerating ? (
              <Button
                type='primary'
                size='small'
                icon={<StopOutlined />}
                onClick={onStop}
                className='chat-input-action-btn chat-input-stop-btn flex h-8 w-8 items-center justify-center rounded-full border-0 bg-red-500 p-0 shadow-sm hover:bg-red-600'
                title='停止生成'
                aria-label='停止生成'
              />
            ) : (
              <Button
                type='primary'
                size='small'
                icon={<ArrowUp size={16} strokeWidth={2.25} />}
                onClick={onSend}
                disabled={!canSend}
                className='chat-input-action-btn chat-input-send-btn flex h-8 w-8 items-center justify-center rounded-full border-0 p-0 shadow-sm'
                title='发送'
                aria-label='发送'
              />
            )}
          </div>
        </div>
        <Modal
          title='清除上下文'
          open={clearContextSessionId !== null}
          onCancel={() => {
            if (!clearingContext) setClearContextSessionId(null);
          }}
          onOk={() => void clearContext()}
          okText='确认清除'
          cancelText='取消'
          okButtonProps={{ danger: true, disabled: loading || isGenerating }}
          cancelButtonProps={{ disabled: clearingContext }}
          confirmLoading={clearingContext}
          closable={!clearingContext}
          mask={{ closable: !clearingContext }}
          keyboard={!clearingContext}
          destroyOnHidden>
          <p>确定清除上下文吗？当前对话的所有问答记录将清空，此操作无法撤销。</p>
        </Modal>
        <Modal
          title='目标'
          open={goalOpen}
          onCancel={() => setGoalOpen(false)}
          destroyOnHidden
          footer={
            <div className='flex items-center justify-between gap-2'>
              <div className='flex gap-2'>
                {goal && <Button onClick={() => void controlGoal('clear')}>清除</Button>}
                {goal?.phase === 'active' && (
                  <Button onClick={() => void controlGoal('pause')}>暂停</Button>
                )}
                {goal &&
                  goal.phase !== 'complete' &&
                  (goal.phase !== 'active' || goal.activation === 'disarmed') && (
                    <Button
                      disabled={isGenerating}
                      onClick={() => void runCommand('goal', 'resume')}>
                      继续
                    </Button>
                  )}
              </div>
              <Button
                type='primary'
                disabled={isGenerating || !goalDraft.trim()}
                onClick={saveGoal}>
                {goal ? '保存目标' : '设置目标'}
              </Button>
            </div>
          }>
          {goal && (
            <p className='text-muted-foreground mb-3 text-xs'>
              {
                { active: '进行中', paused: '已暂停', blocked: '已阻塞', complete: '已完成' }[
                  goal.phase
                ]
              }{' '}
              · {goal.roundsStarted}/{goal.maxGoalRounds} 轮
            </p>
          )}
          {goal?.blockedReason && (
            <Alert type='warning' showIcon title={goal.blockedReason.message} className='mb-3' />
          )}
          <Input.TextArea
            aria-label='长期任务目标'
            placeholder='描述你希望完成的长期任务目标'
            value={goalDraft}
            onChange={(event) => setGoalDraft(event.target.value)}
            autoSize={{ minRows: 3, maxRows: 8 }}
            disabled={isGenerating}
            maxLength={20000}
          />
        </Modal>
      </div>
    );
  },
);

ChatInputPanel.displayName = 'ChatInputPanel';

export default ChatInputPanel;
