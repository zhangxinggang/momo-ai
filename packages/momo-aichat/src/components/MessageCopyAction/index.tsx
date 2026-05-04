import { CheckIcon, CopyIcon } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface IProps {
  content: string;
  className?: string;
  /** 复制按钮右侧扩展插槽 */
  trailingSlot?: React.ReactNode;
}

/** 助手消息内容下方的单行复制操作 */
export const MessageCopyAction: React.FC<IProps> = ({ content, className = '', trailingSlot }) => {
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

  return (
    <div className={`mt-2 flex w-full items-center gap-2 ${className}`.trim()}>
      <button
        type='button'
        onClick={() => void handleCopy()}
        className='text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-md px-1 py-0.5 text-xs transition-colors duration-200'
        aria-label={copied ? '已复制' : '复制回答内容'}>
        {copied ? (
          <>
            <CheckIcon className='h-3.5 w-3.5' aria-hidden />
            <span>已复制</span>
          </>
        ) : (
          <>
            <CopyIcon className='h-3.5 w-3.5' aria-hidden />
            <span>复制</span>
          </>
        )}
      </button>
      {trailingSlot ? <div className='flex items-center gap-1'>{trailingSlot}</div> : null}
    </div>
  );
};
