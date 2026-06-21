import type { DCreatePrompt } from '@/types/modules';
import { PromptFullscreenEditor } from '@renderer/components/Prompt/PromptFullscreenEditor';
import { FullscreenModal } from '@renderer/components/ui/FullscreenModal';
import { Textarea } from '@renderer/components/ui/Textarea';
import { usePromptNativeFullscreen } from '@renderer/hooks/usePromptNativeFullscreen';
import { useUnsavedLeaveGuard } from '@renderer/hooks/useUnsavedLeaveGuard';
import {
  buildPromptPayload,
  createPromptFormData,
  hasPromptFormChanges,
} from '@renderer/services/prompt/modal-utils';
import { Button, Input, Modal } from 'antd';
import { Maximize2Icon, SaveIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: DCreatePrompt) => void;
  defaultFolderId?: string;
}

export function CreatePromptModal({ isOpen, onClose, onCreate, defaultFolderId }: IProps) {
  const [title, setTitle] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [folderId, setFolderId] = useState('');

  const {
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

  const formState = useMemo(
    () => ({
      ...createPromptFormData(null, { folderId: folderId || undefined }),
      title,
      systemPrompt,
      userPrompt,
      folderId: folderId || undefined,
    }),
    [folderId, systemPrompt, title, userPrompt],
  );

  useEffect(() => {
    if (isOpen && defaultFolderId) {
      setFolderId(defaultFolderId);
    }
  }, [defaultFolderId, isOpen]);

  const hasUnsavedChanges = useCallback(() => hasPromptFormChanges(formState), [formState]);

  const resetForm = useCallback(() => {
    setTitle('');
    setSystemPrompt('');
    setUserPrompt('');
    setFolderId('');
  }, []);

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!title.trim() || !userPrompt.trim()) {
      return false;
    }
    onCreate(buildPromptPayload(formState) as DCreatePrompt);
    resetForm();
    return true;
  }, [formState, onCreate, resetForm, title, userPrompt]);

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
      if (ok) {
        onClose();
      }
    });
  }, [handleSave, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S' || e.key === 'Enter')) {
        e.preventDefault();
        handleSaveClick();
      }
      if (e.key === 'Escape' && isNativeFullscreen) {
        exitNativeFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exitNativeFullscreen, handleSaveClick, isNativeFullscreen, isOpen]);

  if (isNativeFullscreen) {
    return (
      <FullscreenModal
        open
        title={fullscreenTitle}
        onClose={exitNativeFullscreen}
        zIndex={9999}
        getContainer={() => document.body}
        destroyOnHidden={false}>
        <PromptFullscreenEditor value={fullscreenValue} onChange={updateFullscreenValue} />
      </FullscreenModal>
    );
  }

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={handleCloseRequest}
        title={'创建 IPrompt'}
        width={900}
        footer={
          <PromptModalFooter
            onCancel={handleCloseRequest}
            onSubmit={handleSaveClick}
            canSubmit={Boolean(title.trim() && userPrompt.trim())}
            cancelLabel='取消'
            submitLabel='创建'
          />
        }
        destroyOnClose={false}
        styles={{ body: { maxHeight: 'min(70vh, 720px)', overflowY: 'auto' } }}>
        <div className='space-y-5'>
          <div className='space-y-1.5'>
            <label className='text-foreground block text-sm font-medium'>
              标题
              <span className='text-destructive ml-1'>*</span>
            </label>
            <Input
              placeholder={'给你的 IPrompt 起个名字'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='bg-muted/50 focus:ring-primary/30 focus:bg-background h-12 w-full rounded-xl border-0 px-4 text-xl font-semibold outline-none focus:ring-2'
            />
          </div>

          <div className='space-y-1.5'>
            <PromptFieldHeader
              label={'用户提示词'}
              required
              onFullscreen={() => enterNativeFullscreen('user')}
            />
            <Textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder={
                '输入你的 IPrompt 内容，可以使用 {{变量名}} 或 {{变量名:示例值}} 定义变量...'
              }
              rows={8}
            />
          </div>

          <div className='space-y-1.5'>
            <PromptFieldHeader
              label={'系统提示词（可选）'}
              onFullscreen={() => enterNativeFullscreen('system')}
            />
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder={'系统提示词（可选）'}
              rows={6}
            />
          </div>
        </div>
      </Modal>

      <UnsavedLeaveDialog />
    </>
  );
}

function PromptModalFooter({
  onCancel,
  onSubmit,
  canSubmit,
  cancelLabel,
  submitLabel,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  cancelLabel: string;
  submitLabel: string;
}) {
  return (
    <div className='flex justify-end gap-2'>
      <Button onClick={onCancel}>{cancelLabel}</Button>
      <Button
        type='primary'
        onClick={onSubmit}
        disabled={!canSubmit}
        icon={<SaveIcon className='h-4 w-4' />}>
        {submitLabel}
      </Button>
    </div>
  );
}

function PromptFieldHeader({
  label,
  required,
  onFullscreen,
}: {
  label: string;
  required?: boolean;
  onFullscreen: () => void;
}) {
  return (
    <div className='flex items-center justify-between'>
      <label className='text-foreground text-sm font-medium'>
        {label}
        {required ? <span className='text-destructive ml-1'>*</span> : null}
      </label>
      <Button
        type='text'
        size='small'
        onClick={onFullscreen}
        className='text-muted-foreground hover:text-foreground rounded p-1'
        icon={<Maximize2Icon className='h-4 w-4' />}
      />
    </div>
  );
}
