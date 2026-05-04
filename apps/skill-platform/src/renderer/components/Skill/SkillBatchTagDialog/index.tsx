import type { ISkill } from '@/types/modules';
import {
  collectSkillTags,
  updateSkillTags,
  type ESkillBatchTagMode,
} from '@renderer/services/skill/batch-utils';
import { Button, Input, Modal } from 'antd';
import { TagsIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
interface IProps {
  skills: ISkill[];
  onClose: () => void;
  onSubmit: (tag: string, mode: ESkillBatchTagMode) => Promise<void>;
}

export function SkillBatchTagDialog({ skills, onClose, onSubmit }: IProps) {
  const [mode, setMode] = useState<ESkillBatchTagMode>('add');
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const suggestedTags = useMemo(() => collectSkillTags(skills), [skills]);
  const affectedCount = useMemo(() => {
    const normalized = tagInput.trim().toLowerCase();
    if (!normalized) return 0;

    return skills.filter((skill) => {
      const nextTags = updateSkillTags(skill.tags, normalized, mode);
      return JSON.stringify(nextTags) !== JSON.stringify(skill.tags || []);
    }).length;
  }, [mode, skills, tagInput]);

  const handleSubmit = async () => {
    if (!tagInput.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(tagInput, mode);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open onCancel={onClose} title={'批量管理标签'} width={800} footer={null} destroyOnClose>
      <div className='space-y-4'>
        <div className='border-border bg-background/60 rounded-2xl border p-4'>
          <div className='text-foreground flex items-center gap-2 text-sm font-medium'>
            <TagsIcon className='text-primary h-4 w-4' />
            {`对选中的 ${skills.length} 个 skill 统一添加或移除标签。`}
          </div>
        </div>

        <div className='grid gap-2 sm:grid-cols-2'>
          {(
            [
              ['add', '添加标签'],
              ['remove', '移除标签'],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              onClick={() => setMode(value)}
              className={`h-auto rounded-xl border px-3 py-3 text-left transition-colors ${
                mode === value
                  ? 'border-primary/40 bg-primary/5 text-primary'
                  : 'border-border app-wallpaper-surface hover:border-primary/25'
              }`}>
              <div className='text-sm font-medium'>{label}</div>
            </Button>
          ))}
        </div>

        <div className='space-y-2'>
          <label className='text-foreground text-sm font-medium'>{'标签'}</label>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onPressEnter={() => {
              if (tagInput.trim() && !isSubmitting) void handleSubmit();
            }}
            placeholder={'输入新标签后按回车'}
            className='h-11'
          />
          <div className='text-muted-foreground text-xs'>
            {`预计影响 ${affectedCount} 个 skill`}
          </div>
        </div>

        {suggestedTags.length > 0 ? (
          <div className='space-y-2'>
            <div className='text-muted-foreground text-xs font-medium uppercase tracking-wide'>
              {'已有标签'}
            </div>
            <div className='flex flex-wrap gap-2'>
              {suggestedTags.slice(0, 20).map((tag) => (
                <Button
                  key={tag}
                  size='small'
                  onClick={() => setTagInput(tag)}
                  className='border-border app-wallpaper-surface text-muted-foreground hover:border-primary/25 hover:text-foreground h-auto rounded-full border px-3 py-1 text-xs'>
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        <div className='border-border flex items-center justify-end gap-3 border-t pt-4'>
          <Button onClick={onClose} disabled={isSubmitting}>
            {'取消'}
          </Button>
          <Button
            type='primary'
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !tagInput.trim()}
            loading={isSubmitting}>
            {mode === 'add' ? '添加标签' : '移除标签'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
