import { CheckIcon, CopyIcon, PencilIcon, RotateCwIcon, Trash2Icon } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface IProps {
  content: string;
  /** 是否显示重试按钮（仅回复失败时） */
  showRetry?: boolean;
  disabled?: boolean;
  onEdit?: () => void;
  onRetry?: () => void;
  onDelete?: () => void;
}

/** 用户消息下方的操作栏（鼠标移入显示） */
export const MessageUserActions: React.FC<IProps> = ({
  content,
  showRetry = false,
  disabled = false,
  onEdit,
  onRetry,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    const text = content.trim();
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [content]);

  if (!content.trim()) {
    return null;
  }

  const actionClassName =
    'text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center rounded-md p-1 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className='mt-1 flex items-center justify-end gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
      <button
        type='button'
        disabled={disabled}
        onClick={() => void handleCopy()}
        className={actionClassName}
        aria-label={copied ? '已复制' : '复制消息'}
        title={copied ? '已复制' : '复制'}>
        {copied ? (
          <CheckIcon className='h-3.5 w-3.5' aria-hidden />
        ) : (
          <CopyIcon className='h-3.5 w-3.5' aria-hidden />
        )}
      </button>
      {onEdit ? (
        <button
          type='button'
          disabled={disabled}
          onClick={onEdit}
          className={actionClassName}
          aria-label='编辑消息'
          title='编辑'>
          <PencilIcon className='h-3.5 w-3.5' aria-hidden />
        </button>
      ) : null}
      {showRetry && onRetry ? (
        <button
          type='button'
          disabled={disabled}
          onClick={onRetry}
          className={actionClassName}
          aria-label='重试'
          title='重试'>
          <RotateCwIcon className='h-3.5 w-3.5' aria-hidden />
        </button>
      ) : null}
      {onDelete ? (
        <button
          type='button'
          disabled={disabled}
          onClick={onDelete}
          className={actionClassName}
          aria-label='删除消息'
          title='删除'>
          <Trash2Icon className='h-3.5 w-3.5' aria-hidden />
        </button>
      ) : null}
    </div>
  );
};
