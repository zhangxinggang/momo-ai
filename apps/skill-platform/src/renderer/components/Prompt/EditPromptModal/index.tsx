import {
  allToolbar,
  buildExtendedMarkdownToolbars,
  type IExposeParam,
  MdEditor,
} from '@momo/markdown';
import '@momo/markdown-styles';
import { useToast } from '@renderer/components/ui/Toast';
import { useUnsavedLeaveGuard } from '@renderer/hooks/useUnsavedLeaveGuard';
import {
  buildPromptPayload,
  createPromptFormData,
  hasPromptFormChanges,
} from '@renderer/services/prompt/modal-utils';
import { usePromptStore, useSettingsStore } from '@renderer/store';
import {
  useMdEditorImageUpload,
  useMdPreviewTheme,
  useSkillMdEditorToolbars,
} from '@renderer/utils/markdown/editor-config';
import { Button, Modal } from 'antd';
import { SaveIcon } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import type { DCreatePrompt, DUpdatePrompt, IPrompt } from '@/types/modules';
import styles from './index.module.less';

const PromptMdEditor = MdEditor as any;
const PROMPT_MD_TOOLBARS = buildExtendedMarkdownToolbars() as typeof allToolbar;

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  prompt?: IPrompt | null;
  initialData?: Partial<IPrompt>;
  /** 面板模式：嵌入右侧区域，无遮罩 */
  variant?: 'modal' | 'panel';
  onSaved?: (promptId: string) => void;
}

export function EditPromptModal({
  isOpen,
  onClose,
  prompt,
  initialData,
  variant = 'modal',
  onSaved,
}: IProps) {
  const isPanel = variant === 'panel';
  const isActive = isPanel || isOpen;
  const { showToast } = useToast();
  const updatePrompt = usePromptStore((state) => state.updatePrompt);
  const createPrompt = usePromptStore((state) => state.createPrompt);
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userPrompt, setUserPrompt] = useState('');

  const editorInstanceId = useId().replace(/[^a-zA-Z0-9_-]/g, '_');
  const userEditorRef = useRef<IExposeParam>(null);
  const systemEditorRef = useRef<IExposeParam>(null);
  const userImageUpload = useMdEditorImageUpload(userEditorRef);
  const systemImageUpload = useMdEditorImageUpload(systemEditorRef);
  const [mdPreviewTheme, setMdPreviewTheme] = useMdPreviewTheme('cyanosis');
  const userDefToolbars = useSkillMdEditorToolbars({
    content: userPrompt,
    exportTitle: `${prompt?.title || 'prompt'}-user`,
    previewTheme: mdPreviewTheme,
    onPreviewThemeChange: setMdPreviewTheme,
  });
  const systemDefToolbars = useSkillMdEditorToolbars({
    content: systemPrompt,
    exportTitle: `${prompt?.title || 'prompt'}-system`,
    previewTheme: mdPreviewTheme,
    onPreviewThemeChange: setMdPreviewTheme,
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

  useEffect(() => {
    if (isActive) {
      const form = createPromptFormData(prompt || initialData);
      setSystemPrompt(form.systemPrompt);
      setUserPrompt(form.userPrompt);
    }
  }, [prompt, initialData, isActive]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        (event.key === 's' || event.key === 'S' || event.key === 'Enter')
      ) {
        event.preventDefault();
        handleSaveClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveClick, isOpen]);

  const modalFooter = isPanel ? (
    <div className='flex w-full justify-end'>
      <Button
        type='primary'
        onClick={handleSaveClick}
        disabled={!userPrompt.trim()}
        icon={<SaveIcon className='h-4 w-4' />}>
        {'保存'}
      </Button>
    </div>
  ) : (
    <div className='flex justify-end gap-2'>
      <Button onClick={handleCloseRequest}>{'取消'}</Button>
      <Button
        type='primary'
        onClick={handleSaveClick}
        disabled={!userPrompt.trim()}
        icon={<SaveIcon className='h-4 w-4' />}>
        {prompt ? '保存' : '创建'}
      </Button>
    </div>
  );

  const mdTheme = isDarkMode ? 'dark' : 'light';

  return (
    <Modal
      open={isActive}
      onCancel={isPanel ? undefined : handleCloseRequest}
      title={isPanel ? undefined : prompt ? '编辑 IPrompt' : '创建 IPrompt'}
      width={isPanel ? '100%' : 1100}
      footer={modalFooter}
      closable={!isPanel}
      mask={!isPanel}
      centered={!isPanel}
      getContainer={isPanel ? false : undefined}
      destroyOnHidden={false}
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
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                overflow: 'hidden',
              },
              container: {
                flex: '1 1 auto',
                height: '100%',
                maxHeight: '100%',
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
                height: 'min(72vh, 760px)',
                overflow: 'hidden',
              },
            }
      }>
      <div className={isPanel ? styles['prompt-fields'] : styles['prompt-fields-modal']}>
        <section className={styles['prompt-field']}>
          <label className='text-foreground block shrink-0 text-sm font-medium'>
            {'用户提示词'}
            <span className='text-destructive ml-2 text-xs'>*</span>
          </label>
          <div className={styles['prompt-markdown-editor']}>
            <PromptMdEditor
              ref={userEditorRef}
              id={`prompt-user-${editorInstanceId}`}
              value={userPrompt}
              onChange={setUserPrompt}
              placeholder='输入你的 IPrompt 内容，可以使用 {{变量名}} 或 {{变量名:示例值}} 定义变量...'
              theme={mdTheme}
              preview
              previewTheme={mdPreviewTheme}
              onPreviewThemeChange={setMdPreviewTheme}
              noPrettier
              inputBoxWidth='50%'
              footers={[]}
              toolbars={PROMPT_MD_TOOLBARS}
              toolbarsExclude={[]}
              defToolbars={userDefToolbars}
              onDrop={userImageUpload.handleDrop}
              onUploadImg={userImageUpload.handleUploadImg}
              style={{ height: '100%' }}
            />
          </div>
        </section>

        <section className={styles['prompt-field']}>
          <label className='text-foreground block shrink-0 text-sm font-medium'>
            {'系统提示词（可选）'}
          </label>
          <div className={styles['prompt-markdown-editor']}>
            <PromptMdEditor
              ref={systemEditorRef}
              id={`prompt-system-${editorInstanceId}`}
              value={systemPrompt}
              onChange={setSystemPrompt}
              placeholder='设置 AI 的角色和行为...'
              theme={mdTheme}
              preview
              previewTheme={mdPreviewTheme}
              onPreviewThemeChange={setMdPreviewTheme}
              noPrettier
              inputBoxWidth='50%'
              footers={[]}
              toolbars={PROMPT_MD_TOOLBARS}
              toolbarsExclude={[]}
              defToolbars={systemDefToolbars}
              onDrop={systemImageUpload.handleDrop}
              onUploadImg={systemImageUpload.handleUploadImg}
              style={{ height: '100%' }}
            />
          </div>
        </section>
      </div>

      <UnsavedLeaveDialog />
    </Modal>
  );
}
