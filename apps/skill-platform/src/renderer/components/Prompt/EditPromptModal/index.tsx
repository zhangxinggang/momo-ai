import { FullscreenModal } from '@renderer/components/ui/FullscreenModal';
import { handleMarkdownListKeyDown, Textarea } from '@renderer/components/ui/Textarea';
import { useUnsavedLeaveGuard } from '@renderer/hooks/useUnsavedLeaveGuard';
import { Button, Modal } from 'antd';
import type { TextAreaRef } from 'antd/es/input/TextArea';
import { Maximize2Icon, Minimize2Icon, PlayIcon, SaveIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { DCreatePrompt, DUpdatePrompt, IPrompt } from '@/types/modules';
import { PromptFullscreenEditor } from '@renderer/components/Prompt/PromptFullscreenEditor';
import { MarkdownPreview } from '@renderer/components/ui/MarkdownPreview';
import { useToast } from '@renderer/components/ui/Toast';
import { usePromptNativeFullscreen } from '@renderer/hooks/usePromptNativeFullscreen';
import {
  buildPromptPayload,
  createPromptFormData,
  hasPromptFormChanges,
} from '@renderer/services/prompt/modal-utils';
import { usePromptStore } from '@renderer/store';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  prompt?: IPrompt | null;
  initialData?: Partial<IPrompt>;
  /** 面板模式：嵌入右侧区域，无遮罩 */
  variant?: 'modal' | 'panel';
  onAiTest?: () => void;
  onSaved?: (promptId: string) => void;
}

export function EditPromptModal({
  isOpen,
  onClose,
  prompt,
  initialData,
  variant = 'modal',
  onAiTest,
  onSaved,
}: IProps) {
  const isPanel = variant === 'panel';
  const isActive = isPanel || isOpen;
  const { showToast } = useToast();
  const updatePrompt = usePromptStore((state) => state.updatePrompt);
  const createPrompt = usePromptStore((state) => state.createPrompt);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userPrompt, setUserPrompt] = useState('');

  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenTextareaRef = useRef<TextAreaRef>(null);

  const {
    activeFullscreenField,
    fullscreenTitle,
    fullscreenValue,
    isNativeFullscreen,
    enterNativeFullscreen,
    exitNativeFullscreen,
    updateFullscreenValue,
  } = usePromptNativeFullscreen({
    getFieldValue: (field) => {
      switch (field) {
        case 'system':
          return systemPrompt;
        case 'user':
          return userPrompt;
      }
    },
    setFieldValue: (field, value) => {
      switch (field) {
        case 'system':
          setSystemPrompt(value);
          break;
        case 'user':
          setUserPrompt(value);
          break;
      }
    },
    getFieldTitle: (field) => {
      switch (field) {
        case 'system':
          return '系统提示词（可选）';
        case 'user':
          return '用户提示词';
      }
    },
  });

  const formState = useMemo(() => {
    const baseline = createPromptFormData(prompt || initialData);
    return {
      ...baseline,
      systemPrompt,
      userPrompt,
    };
  }, [initialData, prompt, systemPrompt, userPrompt]);

  const hasUnsavedChanges = useCallback(() => {
    return hasPromptFormChanges(formState, prompt || initialData);
  }, [formState, initialData, prompt]);

  const resetForm = useCallback(() => {
    const form = createPromptFormData(prompt || initialData);
    setSystemPrompt(form.systemPrompt);
    setUserPrompt(form.userPrompt);
  }, [initialData, prompt]);

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!userPrompt.trim()) {
      return false;
    }

    try {
      const promptData = buildPromptPayload(formState);

      if (prompt) {
        await updatePrompt(prompt.id, promptData as DUpdatePrompt);
        onSaved?.(prompt.id);
      } else {
        const created = await createPrompt(promptData as DCreatePrompt);
        onSaved?.(created.id);
      }
      return true;
    } catch (error) {
      console.error('Failed to save prompt:', error);
      showToast('操作失败', 'error');
      return false;
    }
  }, [createPrompt, formState, onSaved, prompt, showToast, updatePrompt, userPrompt]);

  const { confirmLeave, UnsavedLeaveDialog } = useUnsavedLeaveGuard({
    isDirty: hasUnsavedChanges,
    onSave: handleSave,
    onDiscard: resetForm,
  });

  const handleCloseRequest = useCallback(() => {
    void (async () => {
      if (!hasUnsavedChanges()) {
        onClose();
        return;
      }
      if (await confirmLeave()) {
        onClose();
      }
    })();
  }, [confirmLeave, hasUnsavedChanges, onClose]);

  const handleSaveClick = useCallback(() => {
    void handleSave().then((ok) => {
      if (ok && !isPanel) {
        onClose();
      }
    });
  }, [handleSave, isPanel, onClose]);

  // 当 prompt 变化时更新表单
  useEffect(() => {
    if (isActive) {
      const form = createPromptFormData(prompt || initialData);
      setSystemPrompt(form.systemPrompt);
      setUserPrompt(form.userPrompt);
    }
  }, [prompt, initialData, isActive]);

  // 监听快捷键 (Cmd+S / Cmd+Enter 保存，Cmd/Shift+S 全屏切换)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save: Cmd+S or Cmd+Enter
      if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S' || e.key === 'Enter')) {
        e.preventDefault();
        handleSaveClick();
      }
      // Fullscreen: Cmd+Shift+F or Cmd+Shift+S (flexible)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      }
      // Exit native fullscreen with Escape
      if (e.key === 'Escape' && isNativeFullscreen) {
        exitNativeFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleSaveClick, isNativeFullscreen, exitNativeFullscreen]);

  // 全屏编辑器的 Markdown 列表续行处理
  const handleFullscreenKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const currentValue = fullscreenValue;
      const handled = handleMarkdownListKeyDown(e, currentValue, (newValue, cursorPos) => {
        updateFullscreenValue(newValue);
        // Set cursor position after React updates the DOM
        requestAnimationFrame(() => {
          const textArea = fullscreenTextareaRef.current?.resizableTextArea?.textArea;
          if (textArea) {
            textArea.selectionStart = cursorPos;
            textArea.selectionEnd = cursorPos;
          }
        });
      });
      // handled is used implicitly by preventDefault in handleMarkdownListKeyDown
    },
    [fullscreenValue, updateFullscreenValue],
  );

  if (isNativeFullscreen && activeFullscreenField) {
    return (
      <FullscreenModal
        open
        title={fullscreenTitle}
        onClose={exitNativeFullscreen}
        zIndex={9999}
        getContainer={() => document.body}
        destroyOnHidden={false}>
        <PromptFullscreenEditor
          value={fullscreenValue}
          onChange={updateFullscreenValue}
          onKeyDown={handleFullscreenKeyDown}
          textareaRef={fullscreenTextareaRef}
        />
      </FullscreenModal>
    );
  }

  const modalFooter = isPanel ? (
    <div className='flex w-full justify-end gap-2'>
      <Button
        onClick={() => onAiTest?.()}
        disabled={!userPrompt.trim()}
        icon={<PlayIcon className='h-4 w-4' />}>
        AI 测试
      </Button>
      <Button
        type='primary'
        onClick={handleSaveClick}
        disabled={!userPrompt.trim()}
        icon={<SaveIcon className='h-4 w-4' />}>
        {'保存'}
      </Button>
    </div>
  ) : (
    <div className='flex w-full items-center justify-between gap-3'>
      <Button
        type='text'
        size='small'
        onClick={() => setIsFullscreen(!isFullscreen)}
        className='text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg p-2 transition-colors'
        title={isFullscreen ? '退出全屏' : '全屏'}
        icon={
          isFullscreen ? (
            <Minimize2Icon className='h-4 w-4' />
          ) : (
            <Maximize2Icon className='h-4 w-4' />
          )
        }
      />
      <div className='flex flex-1 justify-end gap-2'>
        <Button onClick={handleCloseRequest}>{'取消'}</Button>
        <Button
          type='primary'
          onClick={handleSaveClick}
          disabled={!userPrompt.trim()}
          icon={<SaveIcon className='h-4 w-4' />}>
          {prompt ? '保存' : '创建'}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      open={isActive}
      onCancel={isPanel ? undefined : handleCloseRequest}
      title={isPanel ? undefined : prompt ? '编辑 IPrompt' : '创建 IPrompt'}
      width={isPanel ? '100%' : isFullscreen ? 'calc(100vw - 96px)' : 900}
      footer={modalFooter}
      closable={!isPanel}
      mask={!isPanel}
      centered={!isPanel}
      getContainer={isPanel ? false : undefined}
      destroyOnClose={false}
      className={isPanel ? 'prompt-form-panel-modal' : undefined}
      style={
        isPanel
          ? {
              top: 0,
              margin: 0,
              maxWidth: '100%',
              paddingBottom: 0,
            }
          : undefined
      }
      styles={
        isPanel
          ? {
              wrapper: {
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                overflow: 'hidden',
              },
              container: {
                flex: '1 1 auto',
                height: '100%',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'none',
                padding: 0,
                margin: 0,
                overflow: 'hidden',
              },
              header: {
                display: 'none',
                margin: 0,
                padding: 0,
              },
              body: {
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: 10,
              },
              footer: {
                flexShrink: 0,
                margin: 0,
                padding: 10,
                borderTop: '1px solid var(--border)',
              },
            }
          : {
              body: {
                maxHeight: isFullscreen ? 'calc(100vh - 140px)' : 'min(70vh, 720px)',
                overflowY: 'auto',
              },
            }
      }>
      <div className={isPanel ? 'flex min-h-0 flex-1 flex-col gap-5' : 'space-y-5'}>
        <div className={isPanel ? 'flex min-h-0 flex-[2] flex-col gap-2' : 'space-y-2'}>
          <div className='flex items-center justify-between'>
            <label className='text-foreground block text-sm font-medium'>
              {'用户提示词'}
              <span className='text-destructive ml-2 text-xs'>*</span>
            </label>
            <Button
              type='text'
              size='small'
              onClick={() => enterNativeFullscreen('user')}
              className='hover:bg-muted text-muted-foreground hover:text-foreground border-border rounded-lg border p-1.5 transition-colors'
              title={'全屏编辑'}
              icon={<Maximize2Icon className='h-4 w-4' />}
            />
          </div>
          <div
            className={`border-border flex overflow-hidden rounded-xl border ${isPanel ? 'min-h-0 flex-1' : 'min-h-[280px]'}`}>
            <div className='border-border flex h-full min-h-0 w-1/2 flex-col border-r'>
              <Textarea
                placeholder={
                  '输入你的 IPrompt 内容，可以使用 {{变量名}} 或 {{变量名:示例值}} 定义变量...'
                }
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                fillHeight={isPanel}
                className={
                  isPanel
                    ? 'flex-1 rounded-none border-0'
                    : 'min-h-[280px] flex-1 rounded-none border-0'
                }
                enableMarkdownList
              />
            </div>
            <div className='bg-muted/30 flex w-1/2 flex-col'>
              <div className='border-border bg-muted/50 text-muted-foreground shrink-0 border-b px-3 py-1.5 text-xs font-medium'>
                预览
              </div>
              <div className='flex-1 overflow-auto p-4'>
                <div className='prose prose-sm markdown-content max-w-none'>
                  {userPrompt ? (
                    <MarkdownPreview value={userPrompt} />
                  ) : (
                    <div className='text-muted-foreground text-sm italic'>{'(无)'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={isPanel ? 'flex min-h-0 flex-1 flex-col gap-2' : 'space-y-2'}>
          <div className='flex items-center justify-between'>
            <label className='text-foreground block text-sm font-medium'>
              {'系统提示词（可选）'}
            </label>
            <Button
              type='text'
              size='small'
              onClick={() => enterNativeFullscreen('system')}
              className='hover:bg-muted text-muted-foreground hover:text-foreground border-border rounded-lg border p-1.5 transition-colors'
              title={'全屏编辑'}
              icon={<Maximize2Icon className='h-4 w-4' />}
            />
          </div>
          <div
            className={`border-border flex overflow-hidden rounded-xl border ${isPanel ? 'min-h-0 flex-1' : 'min-h-[200px]'}`}>
            <div className='border-border flex h-full min-h-0 w-1/2 flex-col border-r'>
              <Textarea
                placeholder={'设置 AI 的角色和行为...'}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                fillHeight={isPanel}
                className={
                  isPanel
                    ? 'flex-1 rounded-none border-0'
                    : 'min-h-[200px] flex-1 rounded-none border-0'
                }
                enableMarkdownList
              />
            </div>
            <div className='bg-muted/30 flex w-1/2 flex-col'>
              <div className='border-border bg-muted/50 text-muted-foreground shrink-0 border-b px-3 py-1.5 text-xs font-medium'>
                预览
              </div>
              <div className='flex-1 overflow-auto p-4'>
                <div className='prose prose-sm markdown-content max-w-none'>
                  {systemPrompt ? (
                    <MarkdownPreview value={systemPrompt} />
                  ) : (
                    <div className='text-muted-foreground text-sm italic'>{'(无)'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UnsavedLeaveDialog />
    </Modal>
  );
}
