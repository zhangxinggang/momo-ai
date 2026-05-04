import { MarkdownPreview } from '@renderer/components/ui/MarkdownPreview';
import { Input } from 'antd';
import type { TextAreaRef } from 'antd/es/input/TextArea';
import type { KeyboardEvent, RefObject } from 'react';

interface IProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  textareaRef?: RefObject<TextAreaRef | null>;
  placeholder?: string;
}

/** 提示词全屏：左侧编辑、右侧 Markdown 预览 */
export function PromptFullscreenEditor({
  value,
  onChange,
  onKeyDown,
  textareaRef,
  placeholder = '在这里输入你的 IPrompt...',
}: IProps) {
  return (
    <div className='flex min-h-0 flex-1 overflow-hidden'>
      <div className='border-border flex min-h-0 w-1/2 min-w-0 flex-col overflow-hidden border-r'>
        <div className='border-border bg-muted/20 text-muted-foreground shrink-0 border-b px-4 py-2 text-xs font-medium'>
          编辑
        </div>
        <Input.TextArea
          ref={textareaRef}
          className='bg-background box-border min-h-0 w-full flex-1 resize-none border-none p-[10px] font-mono text-base leading-relaxed outline-none'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
          placeholder={placeholder}
          variant='borderless'
        />
      </div>
      <div className='flex min-h-0 w-1/2 min-w-0 flex-col overflow-hidden'>
        <div className='border-border bg-muted/20 text-muted-foreground shrink-0 border-b px-4 py-2 text-xs font-medium'>
          预览
        </div>
        <div className='min-h-0 flex-1 overflow-auto p-[10px]'>
          <div className='prose prose-sm markdown-content max-w-none'>
            {value ? (
              <MarkdownPreview value={value} />
            ) : (
              <div className='text-muted-foreground text-sm italic'>(无)</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
