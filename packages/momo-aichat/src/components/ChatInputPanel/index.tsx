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
  Paperclip,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Target,
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
  /** 隐藏会作用于当前聊天会话的目标、压缩和权限入口。 */
  showSessionCommands?: boolean;
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
      showSessionCommands = true,
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
    const [permissionSaving, setPermissionSaving] = useState(false);
    const [knowledgeOpen, setKnowledgeOpen] = useState(false);
    const [knowledgeCollections, setKnowledgeCollections] = useState<
      Array<{ id: string; name: string }>
    >([]);
    const [knowledgeLoading, setKnowledgeLoading] = useState(false);
    const [goalOpen, setGoalOpen] = useState(false);
    const [goalDraft, setGoalDraft] = useState('');
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
      agentAppBanner,
      runtime,
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

    const inputPlaceholder = (() => {
      if (slashCommands?.isActive(currentModel)) {
        return noteReferences ? '输入消息，/ 命令，@ 引用笔记' : '输入消息，或 / 查看命令...';
      }
      return noteReferences ? '输入消息，@ 引用笔记' : placeholder;
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
    const sessionForExport = exportSession === undefined ? currentSession : exportSession;
    const downloadLog = async () => {
      if (!sessionForExport) return;
      try {
        const log = await runtime?.port.exportSession?.(sessionForExport.id);
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
        onClick: () => setKnowledgeOpen((open) => !open),
      },
      ...(showSessionCommands
        ? [
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
          ]
        : []),
      {
        id: 'plan',
        section: '添加',
        label: '计划',
        command: 'plan',
        description: '进入或退出计划模式',
        icon: <FilePenLine size={15} />,
        disabled: disabled || isGenerating,
        onClick: () => {
          setAgentMode(agentMode === 'plan' ? 'ask' : 'plan');
          closeMenu();
        },
      },
      ...(showSessionCommands
        ? [
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
              id: 'permission',
              section: '指令',
              label: '权限',
              command: 'permission',
              description: '切换权限预设（沙箱模式与审批策略）',
              icon: <Shield size={15} />,
              disabled: disabled || permissionSaving || !runtime,
              onClick: () => setPermissionOpen((open) => !open),
            },
          ]
        : []),
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
        className='chat-input-panel bg-panel border-surface relative rounded-xl border shadow-sm'>
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

        <div ref={notePopoverAnchorRef} className='relative px-4 pb-2 pt-4'>
          <SlashCommandPopover
            open={slash.open}
            items={slash.items}
            selectedIndex={slash.selectedIndex}
            loading={slash.loading}
            warning={slash.warning}
            title={agentAppBanner?.name ? `${agentAppBanner.name} · 技能与命令` : 'momo-ai 技能'}
            onSelect={slash.handleSelect}
            onHover={slash.setSelectedIndex}
          />
          <NoteReferencePopover
            ref={noteRef.popoverRef}
            anchorRef={noteReferences ? notePopoverAnchorRef : undefined}
            open={noteRef.open}
            tree={noteRef.tree}
            loading={noteRef.loading}
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
                            aria-pressed={item.id === 'plan' ? agentMode === 'plan' : undefined}
                            aria-expanded={
                              item.id === 'permission'
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
                        return item.id === 'permission' || item.id === 'knowledge' ? (
                          <Popover
                            destroyOnHidden
                            key={item.id}
                            open={item.id === 'permission' ? permissionOpen : knowledgeOpen}
                            placement='bottomLeft'
                            arrow={false}
                            trigger={[]}
                            styles={{ container: { padding: 4, borderRadius: 14 } }}
                            content={
                              item.id === 'permission' ? permissionOptions : knowledgeOptions
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
            {runtime && showSessionCommands && (
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
            {agentMode === 'plan' && (
              <button
                type='button'
                className='chat-input-plan-chip'
                disabled={disabled || isGenerating}
                aria-label='关闭计划模式'
                title='关闭计划模式'
                onClick={() => setAgentMode('ask')}>
                <span className='chat-input-plan-chip-icon'>
                  <Lightbulb size={14} className='chat-input-plan-lightbulb' />
                  <X size={14} className='chat-input-plan-close' />
                </span>
                <span>计划</span>
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
            <ChatContextUsage modelId={selectedModel} />
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
