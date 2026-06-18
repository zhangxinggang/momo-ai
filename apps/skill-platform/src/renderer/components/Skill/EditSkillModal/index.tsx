import type { ISkill } from '@/types/modules';
import { useUnsavedLeaveGuard } from '@renderer/hooks/useUnsavedLeaveGuard';
import { SKILL_NAME_REGEX } from '@renderer/services/skill/detail-utils';
import {
  buildSkillTagActions,
  getExistingSkillTags,
  getUserSkillTags,
  inferOriginalSkillTags,
} from '@renderer/services/skill/modal-utils';
import { useSkillStore } from '@renderer/store';
import { Button, Input, Modal } from 'antd';
import {
  AlertCircleIcon,
  FolderOpenIcon,
  Maximize2Icon,
  Minimize2Icon,
  SaveIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SkillFileEditor } from '../SkillFileEditor';
import { SkillIconPicker } from '../SkillIconPicker';
import { SkillTagEditor } from '../SkillTagEditor';
interface IProps {
  isOpen: boolean;
  onClose: () => void;
  skill: ISkill | null;
}

export function EditSkillModal({ isOpen, onClose, skill }: IProps) {
  const updateSkill = useSkillStore((state) => state.updateSkill);
  const existingSkills = useSkillStore((state) => state.skills);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [iconUrl, setIconUrl] = useState<string | undefined>(undefined);
  const [iconEmoji, setIconEmoji] = useState<string | undefined>(undefined);
  const [iconBackground, setIconBackground] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Name validation state
  const [nameError, setNameError] = useState<string | null>(null);

  // Editor view state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFileEditorOpen, setIsFileEditorOpen] = useState(false);

  const existingTags = useMemo(() => getExistingSkillTags(existingSkills), [existingSkills]);

  const resetFormFromSkill = useCallback(() => {
    if (!skill) {
      return;
    }
    setName(skill.name || '');
    setDescription(skill.description || '');
    setAuthor(skill.author || '');
    setIconUrl(skill.icon_url || undefined);
    setIconEmoji(skill.icon_emoji || undefined);
    setIconBackground(skill.icon_background || undefined);
    setTags(getUserSkillTags(skill));
    setError(null);
    setNameError(null);
  }, [skill]);

  useEffect(() => {
    resetFormFromSkill();
  }, [resetFormFromSkill]);

  const validateName = useCallback((value: string): boolean => {
    if (!value.trim()) {
      setNameError('请输入技能名称');
      return false;
    }
    if (value.length > 64) {
      setNameError('名称不能超过 64 个字符');
      return false;
    }
    if (!SKILL_NAME_REGEX.test(value)) {
      setNameError('名称格式无效（只允许小写字母、数字和连字符）');
      return false;
    }
    setNameError(null);
    return true;
  }, []);

  const hasUnsavedChanges = useCallback((): boolean => {
    if (!skill) {
      return false;
    }
    return (
      name !== (skill.name || '') ||
      description !== (skill.description || '') ||
      author !== (skill.author || '') ||
      iconUrl !== (skill.icon_url || undefined) ||
      iconEmoji !== (skill.icon_emoji || undefined) ||
      iconBackground !== (skill.icon_background || undefined) ||
      JSON.stringify(tags) !== JSON.stringify(getUserSkillTags(skill))
    );
  }, [skill, name, description, author, iconUrl, iconEmoji, iconBackground, tags]);

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!skill) {
      return false;
    }
    if (!validateName(name)) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateSkill(skill.id, {
        name,
        description: description.trim(),
        author: author.trim() || undefined,
        icon_url: iconUrl,
        icon_emoji: iconEmoji,
        icon_background: iconBackground,
        original_tags: inferOriginalSkillTags(skill),
        tags,
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [
    skill,
    validateName,
    name,
    description,
    author,
    iconUrl,
    iconEmoji,
    iconBackground,
    tags,
    updateSkill,
  ]);

  const handleDismiss = useCallback(() => {
    setError(null);
    setNameError(null);
    setIsFullscreen(false);
    onClose();
  }, [onClose]);

  const { confirmLeave, UnsavedLeaveDialog } = useUnsavedLeaveGuard({
    isDirty: hasUnsavedChanges,
    onSave: handleSave,
    onDiscard: resetFormFromSkill,
  });

  const handleCloseRequest = useCallback(() => {
    void (async () => {
      if (!hasUnsavedChanges()) {
        handleDismiss();
        return;
      }
      if (await confirmLeave()) {
        handleDismiss();
      }
    })();
  }, [confirmLeave, handleDismiss, hasUnsavedChanges]);

  const handleSaveClick = useCallback(() => {
    void handleSave().then((ok) => {
      if (ok) {
        handleDismiss();
      }
    });
  }, [handleDismiss, handleSave]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleSaveClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveClick, isOpen]);

  if (!isOpen || !skill) {
    return null;
  }

  const tagActions = buildSkillTagActions({
    tags,
    tagInput,
    setTags,
    setTagInput,
  });

  return (
    <>
      <Modal
        open
        zIndex={100}
        onCancel={handleCloseRequest}
        title={
          <div className='flex w-full items-center justify-between gap-2 pr-8'>
            <span>{'编辑技能元数据'}</span>
            <Button
              type='text'
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? '退出全屏' : '全屏'}
              icon={
                isFullscreen ? (
                  <Minimize2Icon className='h-4 w-4' />
                ) : (
                  <Maximize2Icon className='h-4 w-4' />
                )
              }
            />
          </div>
        }
        width={isFullscreen ? 'min(95vw, 960px)' : 640}
        footer={
          <div className='flex justify-end gap-2'>
            <Button onClick={handleCloseRequest}>{'取消'}</Button>
            <Button
              type='primary'
              loading={isLoading}
              disabled={!!nameError}
              icon={<SaveIcon className='h-4 w-4' />}
              onClick={handleSaveClick}>
              {'保存'}
            </Button>
          </div>
        }
        styles={{
          body: {
            maxHeight: isFullscreen ? 'min(calc(95vh - 180px), 720px)' : 'min(70vh, 560px)',
            overflowY: 'auto',
            paddingTop: 8,
          },
        }}
        destroyOnClose={false}>
        <div className='space-y-5'>
          {error && (
            <div className='bg-destructive/10 border-destructive/20 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm'>
              <AlertCircleIcon className='h-4 w-4 shrink-0' />
              {error}
            </div>
          )}

          {/* 名称 */}
          <div>
            <label className='mb-2 block text-sm font-medium'>
              {'技能名称'} <span className='text-destructive'>*</span>
            </label>
            <Input
              value={name}
              status={nameError ? 'error' : undefined}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                setName(value);
                if (value) validateName(value);
              }}
              placeholder='my-skill-name'
            />
            {nameError && (
              <p className='text-destructive mt-1.5 flex items-center gap-1 text-xs'>
                <AlertCircleIcon className='h-3 w-3' />
                {nameError}
              </p>
            )}
            <p className='text-muted-foreground mt-1.5 text-xs'>
              {'仅小写字母、数字和连字符，例如 my-skill-name'}
            </p>
          </div>

          {/* 描述 */}
          <div>
            <label className='mb-2 block text-sm font-medium'>{'技能描述'}</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={'简短描述技能的功能'}
            />
          </div>

          <SkillIconPicker
            name={name}
            iconUrl={iconUrl}
            iconEmoji={iconEmoji}
            iconBackground={iconBackground}
            onChange={({
              iconUrl: nextIconUrl,
              iconEmoji: nextIconEmoji,
              iconBackground: nextIconBackground,
            }) => {
              setIconUrl(nextIconUrl);
              setIconEmoji(nextIconEmoji);
              setIconBackground(nextIconBackground);
            }}
          />

          <div>
            <label className='mb-2 block text-sm font-medium'>{'作者'}</label>
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder={'作者名称'}
            />
          </div>

          <SkillTagEditor
            tags={tags}
            tagInput={tagInput}
            existingTags={existingTags}
            onTagInputChange={setTagInput}
            onAddTag={tagActions.handleAddTag}
            onRemoveTag={tagActions.handleRemoveTag}
            onExistingTagClick={tagActions.handleAddExistingTag}
          />

          <div className='border-border bg-accent/20 space-y-3 rounded-xl border p-4'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h3 className='text-sm font-medium'>{'指令内容在文件编辑器中维护'}</h3>
                <p className='text-muted-foreground mt-1 text-xs leading-5'>
                  {
                    'SKILL.md 和其他文件请在文件页或文件编辑器里直接修改。这里仅编辑名称、描述、作者、标签等元数据。'
                  }
                </p>
              </div>
              <Button
                type='default'
                icon={<FolderOpenIcon className='h-4 w-4' />}
                onClick={() => setIsFileEditorOpen(true)}>
                {'打开文件编辑器'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <UnsavedLeaveDialog />
      {skill && (
        <SkillFileEditor
          skillId={skill.id}
          skillName={skill.name}
          isOpen={isFileEditorOpen}
          onClose={() => setIsFileEditorOpen(false)}
        />
      )}
    </>
  );
}
