import { Input } from 'antd';
import type { TextAreaProps as AntTextAreaProps, TextAreaRef } from 'antd/es/input/TextArea';
import { clsx } from 'clsx';
import { forwardRef, useCallback, useRef } from 'react';

// Markdown 列表模式正则
const UNORDERED_LIST_PATTERN = /^(\s*)([-*+])\s(.*)$/;
const ORDERED_LIST_PATTERN = /^(\s*)(\d+)\.\s(.*)$/;
const CHECKBOX_PATTERN = /^(\s*)([-*+])\s\[([ x])\]\s(.*)$/;

export interface IProps extends Omit<AntTextAreaProps, 'onChange'> {
  label?: string;
  error?: string;
  /** 启用 Markdown 列表自动续行功能 */
  enableMarkdownList?: boolean;
  /** 在 flex 容器中撑满剩余高度，并禁用手动 resize */
  fillHeight?: boolean;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}

/**
 * 处理 Textarea 中的 Markdown 列表续行
 */
export function handleMarkdownListKeyDown(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  value: string,
  onChange?: (newValue: string, cursorPos: number) => void,
): boolean {
  if (e.key !== 'Enter' || e.shiftKey) {
    return false;
  }

  const textarea = e.currentTarget;
  const { selectionStart, selectionEnd } = textarea;

  if (selectionStart !== selectionEnd) {
    return false;
  }

  const beforeCursor = value.substring(0, selectionStart);
  const afterCursor = value.substring(selectionEnd);
  const lineStart = beforeCursor.lastIndexOf('\n') + 1;
  const currentLine = beforeCursor.substring(lineStart);

  const lineEndIndex = afterCursor.indexOf('\n');
  const restOfLine = lineEndIndex === -1 ? afterCursor : afterCursor.substring(0, lineEndIndex);
  if (restOfLine.trim() !== '') {
    return false;
  }

  let match = currentLine.match(CHECKBOX_PATTERN);
  if (match) {
    const [, indent, marker, , content] = match;
    if (content.trim() === '') {
      e.preventDefault();
      const newValue = value.substring(0, lineStart) + afterCursor.replace(/^\s*/, '');
      onChange?.(newValue, lineStart);
      return true;
    }
    e.preventDefault();
    const insertion = `\n${indent}${marker} [ ] `;
    const newValue = beforeCursor + insertion + afterCursor;
    onChange?.(newValue, selectionStart + insertion.length);
    return true;
  }

  match = currentLine.match(UNORDERED_LIST_PATTERN);
  if (match) {
    const [, indent, marker, content] = match;
    if (content.trim() === '') {
      e.preventDefault();
      const newValue = value.substring(0, lineStart) + afterCursor.replace(/^\s*/, '');
      onChange?.(newValue, lineStart);
      return true;
    }
    e.preventDefault();
    const insertion = `\n${indent}${marker} `;
    const newValue = beforeCursor + insertion + afterCursor;
    onChange?.(newValue, selectionStart + insertion.length);
    return true;
  }

  match = currentLine.match(ORDERED_LIST_PATTERN);
  if (match) {
    const [, indent, numStr, content] = match;
    if (content.trim() === '') {
      e.preventDefault();
      const newValue = value.substring(0, lineStart) + afterCursor.replace(/^\s*/, '');
      onChange?.(newValue, lineStart);
      return true;
    }
    e.preventDefault();
    const nextNum = parseInt(numStr, 10) + 1;
    const insertion = `\n${indent}${nextNum}. `;
    const newValue = beforeCursor + insertion + afterCursor;
    onChange?.(newValue, selectionStart + insertion.length);
    return true;
  }

  return false;
}

export const Textarea = forwardRef<TextAreaRef, IProps>(
  (
    {
      className,
      label,
      error,
      value,
      onChange,
      enableMarkdownList,
      fillHeight,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const textareaRef = useRef<TextAreaRef>(null);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (enableMarkdownList) {
          const handled = handleMarkdownListKeyDown(
            e,
            String(value || ''),
            (newValue, cursorPos) => {
              if (onChange && textareaRef.current) {
                const native = textareaRef.current.resizableTextArea?.textArea;
                const syntheticEvent = {
                  target: { ...(native ?? {}), value: newValue },
                  currentTarget: { ...(native ?? {}), value: newValue },
                } as React.ChangeEvent<HTMLTextAreaElement>;
                onChange(syntheticEvent);

                requestAnimationFrame(() => {
                  const el = textareaRef.current?.resizableTextArea?.textArea;
                  if (el) {
                    el.selectionStart = cursorPos;
                    el.selectionEnd = cursorPos;
                  }
                });
              }
            },
          );
          if (handled) return;
        }

        onKeyDown?.(e);
      },
      [enableMarkdownList, value, onChange, onKeyDown],
    );

    const setRefs = (element: TextAreaRef | null) => {
      textareaRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    const textareaNode = (
      <Input.TextArea
        ref={setRefs}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        variant='borderless'
        {...props}
        autoSize={fillHeight ? false : props.autoSize}
        className={clsx(
          fillHeight
            ? '!h-full !min-h-0 flex-1 border-0 bg-transparent px-4 py-3'
            : 'min-h-[120px] flex-1 border-0 bg-transparent px-4 py-3',
          'placeholder:text-muted-foreground resize-none font-mono text-sm',
          className,
        )}
        style={{ lineHeight: '1.625', resize: 'none', ...(fillHeight ? { height: '100%' } : {}) }}
        styles={{
          textarea: {
            resize: 'none',
            ...(fillHeight ? { height: '100%', minHeight: 0 } : {}),
          },
        }}
      />
    );

    return (
      <div
        className={clsx(
          fillHeight && 'flex h-full min-h-0 flex-1 flex-col',
          !fillHeight && 'space-y-1.5',
        )}>
        {label ? (
          <label className='text-foreground block text-sm font-medium'>{label}</label>
        ) : null}
        <div
          className={clsx(
            fillHeight ? 'flex min-h-0 flex-1 flex-col' : 'flex',
            'overflow-hidden rounded-xl',
            'bg-muted/50 border-0',
            'focus-within:ring-primary/30 focus-within:bg-background focus-within:ring-2',
            'transition-all duration-200',
            error && 'ring-destructive/50 ring-2',
          )}>
          {textareaNode}
        </div>
        {error ? <p className='text-destructive text-xs'>{error}</p> : null}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
