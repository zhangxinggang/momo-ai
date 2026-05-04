import { renderFolderIcon } from '@renderer/components/Folder/FolderIconHelper';
import { useToast } from '@renderer/components/ui/Toast';
import { useUnsavedLeaveGuard } from '@renderer/hooks/useUnsavedLeaveGuard';
import { chatCompletion } from '@renderer/services/ai';
import {
  getQuickAddFallbackTitle,
  resolveQuickAddAnalysisConfig,
} from '@renderer/services/prompt/quick-add-utils';
import { useFolderStore, usePromptStore, useSettingsStore } from '@renderer/store';
import type { InputRef } from 'antd';
import { Button, Input, Modal } from 'antd';
import { SparklesIcon, Wand2Icon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    title: string;
    userPrompt: string;
    systemPrompt?: string;
    folderId?: string;
  }) => Promise<any>;
}

export function QuickAddModal({ isOpen, onClose, onCreate }: IProps) {
  const { showToast } = useToast();
  const folders = useFolderStore((state) => state.folders);
  const aiModels = useSettingsStore((state) => state.aiModels);
  const scenarioModelDefaults = useSettingsStore((state) => state.scenarioModelDefaults);
  const aiProvider = useSettingsStore((state) => state.aiProvider);
  const aiApiKey = useSettingsStore((state) => state.aiApiKey);
  const aiApiUrl = useSettingsStore((state) => state.aiApiUrl);
  const aiModel = useSettingsStore((state) => state.aiModel);
  const prompts = usePromptStore((state) => state.prompts);

  const [promptText, setPromptText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);

  const textareaRef = useRef<InputRef>(null);

  const analysisConfig = useMemo(
    () =>
      resolveQuickAddAnalysisConfig({
        aiModels,
        scenarioModelDefaults,
        aiProvider,
        aiApiKey,
        aiApiUrl,
        aiModel,
      }),
    [aiApiKey, aiApiUrl, aiModel, aiModels, aiProvider, scenarioModelDefaults],
  );

  const hasUnsavedChanges = useCallback(() => {
    return promptText.trim() !== '';
  }, [promptText]);

  const resetForm = useCallback(() => {
    setPromptText('');
    setSelectedFolderId(undefined);
  }, []);

  const runBackgroundAnalysis = useCallback(
    async (createdPrompt: { id: string; title: string }, text: string) => {
      try {
        const folderNames = folders.map((f) => f.name).join(', ');
        const existingTags = [...new Set(prompts.flatMap((p) => p.tags || []))].sort();
        const tagsString = existingTags.length > 0 ? existingTags.join(', ') : '无现有标签';

        const analysisPrompt = `请分析以下用户提供的 IPrompt，并返回 JSON 格式的结果：
  
用户 IPrompt:
"""
${text}
"""

可用的文件夹列表：
${folderNames || '暂无文件夹'}

已知存在的标签（请优先从这些标签中提取或匹配）：
${tagsString}

请分析并返回以下 JSON 格式（不要包含任何其他文字，只返回纯 JSON）：
{
  "title": "为这个 IPrompt 起一个简洁的标题（不超过20字）",
  "systemPrompt": "如果 IPrompt 中包含系统提示词/角色设定，提取出来；如果没有，根据 IPrompt 内容生成一个合适的系统提示词",
  "suggestedFolder": "根据内容推荐最适合的文件夹名称，如果没有合适的则返回 null",
  "tags": ["根据内容提取关键词作为标签，优先使用已存在的标签，如果必要可以生成1-2个新标签"]
}`;

        const aiResult = await chatCompletion(
          analysisConfig!,
          [{ role: 'user', content: analysisPrompt }],
          { temperature: 0.3 },
        );

        const responseContent = aiResult.content;
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const parsedResult = JSON.parse(jsonMatch[0]);
          let targetFolderId = selectedFolderId;

          if (!targetFolderId && parsedResult.suggestedFolder) {
            const matchedFolder = folders.find(
              (f) =>
                f.name.toLowerCase().includes(parsedResult.suggestedFolder.toLowerCase()) ||
                parsedResult.suggestedFolder.toLowerCase().includes(f.name.toLowerCase()),
            );
            if (matchedFolder) {
              targetFolderId = matchedFolder.id;
            }
          }

          const { usePromptStore } = await import('@renderer/store/prompt');
          await usePromptStore.getState().updatePrompt(createdPrompt.id, {
            title: parsedResult.title || createdPrompt.title,
            systemPrompt: parsedResult.systemPrompt,
            folderId: targetFolderId,
            tags: Array.isArray(parsedResult.tags) ? parsedResult.tags : [],
          });
        }
      } catch (err) {
        console.error('Background AI analysis failed:', err);
        const { usePromptStore } = await import('@renderer/store/prompt');
        await usePromptStore.getState().updatePrompt(createdPrompt.id, {
          title: getQuickAddFallbackTitle(text, '新建提示词'),
        });
      }
    },
    [analysisConfig, folders, prompts, selectedFolderId],
  );

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!promptText.trim() || isSubmitting) {
      return false;
    }

    if (!analysisConfig) {
      showToast('请先在设置中配置 AI 供应商，才能使用智能分析功能。', 'error');
      return false;
    }

    setIsSubmitting(true);

    try {
      const text = promptText;
      const createdPrompt = await onCreate({
        title: '正在分析...',
        userPrompt: text,
        folderId: selectedFolderId,
      });

      if (!createdPrompt) {
        return false;
      }

      resetForm();
      void runBackgroundAnalysis(createdPrompt, text);
      return true;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    analysisConfig,
    isSubmitting,
    onCreate,
    promptText,
    resetForm,
    runBackgroundAnalysis,
    selectedFolderId,
    showToast,
  ]);

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

  // 打开时重置表单
  useEffect(() => {
    if (isOpen) {
      setPromptText('');
      setSelectedFolderId(undefined);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={handleCloseRequest}
        title={
          <span className='flex items-center gap-2'>
            <SparklesIcon className='text-primary h-5 w-5' />
            <span>{'快速添加'}</span>
          </span>
        }
        width={672}
        footer={
          <div className='flex justify-end gap-2'>
            <Button onClick={handleCloseRequest}>'取消'</Button>
            <Button
              type='primary'
              loading={isSubmitting}
              disabled={!promptText.trim()}
              onClick={() => void handleSaveClick()}>
              创建
            </Button>
          </div>
        }
        destroyOnClose
        afterOpenChange={(open) => {
          if (open) {
            setTimeout(() => textareaRef.current?.focus?.(), 100);
          }
        }}
        styles={{
          body: { maxHeight: 'min(70vh, 520px)', overflowY: 'auto', paddingTop: 8 },
        }}>
        <div className='space-y-6'>
          <div className='space-y-2'>
            <label className='text-muted-foreground text-sm font-medium'>
              {'粘贴你的 IPrompt'}
              <span className='text-destructive ml-1'>*</span>
            </label>
            <Input.TextArea
              ref={textareaRef}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={'在这里粘贴你的 IPrompt 内容...'}
              rows={10}
              className='text-sm leading-relaxed'
              style={{ minHeight: '12rem' }}
            />
          </div>

          <div className='space-y-2'>
            <label className='text-muted-foreground text-sm font-medium'>{'文件夹（可选）'}</label>
            <div className='custom-scrollbar grid max-h-40 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3'>
              <Button
                type={!selectedFolderId ? 'primary' : 'default'}
                onClick={() => setSelectedFolderId(undefined)}
                className={`flex h-auto items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${
                  !selectedFolderId
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border-transparent'
                }`}>
                <Wand2Icon className='h-4 w-4 shrink-0' />
                <span className='truncate'>{'AI 智能自动分类'}</span>
              </Button>
              {folders.map((folder) => (
                <Button
                  key={folder.id}
                  type={selectedFolderId === folder.id ? 'primary' : 'default'}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`flex h-auto items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${
                    selectedFolderId === folder.id
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border-transparent'
                  }`}
                  title={folder.name}>
                  <span className='flex h-5 w-5 shrink-0 items-center justify-center'>
                    {renderFolderIcon(folder.icon)}
                  </span>
                  <span className='truncate'>{folder.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
      <UnsavedLeaveDialog />
    </>
  );
}
