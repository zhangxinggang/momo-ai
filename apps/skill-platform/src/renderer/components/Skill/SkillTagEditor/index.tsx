import { Button, Input } from 'antd';
import { HashIcon, XIcon } from 'lucide-react';
import type { KeyboardEvent, MouseEvent } from 'react';

interface IProps {
  tags: string[];
  tagInput: string;
  existingTags?: string[];
  label?: string;
  variant?: 'default' | 'compact';
  bordered?: boolean;
  className?: string;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onExistingTagClick?: (tag: string) => void;
  onInputClick?: (event: MouseEvent<HTMLInputElement>) => void;
  onAddButtonClick?: (event: MouseEvent<HTMLElement>) => void;
  onRemoveTagButtonClick?: (event: MouseEvent<HTMLElement>, tag: string) => void;
}

export function SkillTagEditor({
  tags,
  tagInput,
  existingTags = [],
  label = '标签（可选）',
  variant = 'default',
  bordered = false,
  className = '',
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onExistingTagClick,
  onInputClick,
  onAddButtonClick,
  onRemoveTagButtonClick,
}: IProps) {
  const isCompact = variant === 'compact';
  const tagChipClass = isCompact
    ? 'bg-primary inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-white'
    : 'bg-primary inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white';
  const labelClass = isCompact
    ? 'text-foreground text-[11px] font-medium'
    : 'text-foreground block text-sm font-medium';
  const existingButtonClass = isCompact
    ? '!h-auto rounded-full px-2 py-1 text-xs'
    : '!h-auto rounded-full px-2 py-1 text-xs';
  const inputClass = isCompact
    ? 'app-wallpaper-surface placeholder:text-muted-foreground h-9 flex-1 rounded-xl border-0 text-xs'
    : 'flex-1';
  const addButtonClass = isCompact
    ? 'app-wallpaper-surface text-foreground hover:app-wallpaper-surface rounded-xl px-3 text-xs font-medium'
    : undefined;
  const addButtonSize = isCompact ? ('small' as const) : undefined;

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onAddTag();
    }
  };

  const content = (
    <div className={`space-y-1.5 ${className}`}>
      <label className={labelClass}>{label}</label>
      {tags.length > 0 ? (
        <div className={isCompact ? 'flex flex-wrap gap-1.5' : 'mb-2 flex flex-wrap gap-2'}>
          {tags.map((tag) => (
            <span key={tag} className={tagChipClass}>
              {!isCompact ? <HashIcon className='h-3 w-3' /> : null}
              {tag}
              <Button
                type='text'
                size='small'
                className={
                  isCompact
                    ? 'h-auto min-w-0 p-0 text-white hover:text-white/70'
                    : 'ml-1 !h-auto !min-w-0 !p-0 text-white hover:!text-white/70'
                }
                onClick={(event) => {
                  onRemoveTagButtonClick?.(event, tag);
                  onRemoveTag(tag);
                }}
                icon={<XIcon className='h-3 w-3' />}
              />
            </span>
          ))}
        </div>
      ) : null}
      {existingTags.length > 0 ? (
        <div className='mb-2'>
          <div className='text-muted-foreground mb-1.5 text-xs'>{'选择已有标签：'}</div>
          <div className='flex flex-wrap gap-1.5'>
            {existingTags
              .filter((existingTag) => !tags.includes(existingTag))
              .map((existingTag) => (
                <Button
                  key={existingTag}
                  type='default'
                  size='small'
                  className={existingButtonClass}
                  onClick={() => onExistingTagClick?.(existingTag)}
                  icon={<HashIcon className='h-3 w-3' />}>
                  {existingTag}
                </Button>
              ))}
          </div>
        </div>
      ) : null}
      <div className='flex gap-2'>
        <Input
          className={inputClass}
          value={tagInput}
          onClick={onInputClick}
          onChange={(event) => onTagInputChange(event.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder={'输入新标签后按回车'}
        />
        <Button
          type='default'
          size={addButtonSize}
          className={addButtonClass}
          onClick={(event) => {
            onAddButtonClick?.(event);
            onAddTag();
          }}
          disabled={!tagInput.trim()}>
          {'添加标签'}
        </Button>
      </div>
    </div>
  );

  if (!bordered) {
    if (!className) {
      return content;
    }
    return <div className={className}>{content}</div>;
  }

  return (
    <div
      className={`border-border bg-accent/20 space-y-2 rounded-xl border p-3 ${className}`.trim()}>
      {content}
    </div>
  );
}
