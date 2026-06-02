import { AlertTriangleIcon, Loader2 } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
}

/** 确认对话框 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
  isLoading = false,
}: IProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) {
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm]);

  if (!isOpen) {
    return null;
  }

  const content = (
    <div className='fixed inset-0 z-[99999] flex items-center justify-center p-4'>
      <div className='bg-background/60 absolute inset-0 backdrop-blur-sm' onClick={onClose} />
      <div className='app-wallpaper-panel-strong border-border animate-in fade-in zoom-in-95 duration-base relative w-full max-w-sm rounded-xl border p-6 shadow-2xl'>
        {variant === 'destructive' ? (
          <div className='mb-4 flex justify-center'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
              <AlertTriangleIcon className='h-6 w-6 text-red-600 dark:text-red-400' />
            </div>
          </div>
        ) : null}
        {title ? <h3 className='mb-2 text-center text-lg font-semibold'>{title}</h3> : null}
        <div className='text-muted-foreground mb-6 text-center text-sm'>{message}</div>
        <div className='flex gap-3'>
          <button
            ref={cancelButtonRef}
            type='button'
            onClick={onClose}
            disabled={isLoading}
            className='border-border app-wallpaper-surface hover:bg-accent h-10 flex-1 rounded-lg border px-4 text-sm font-medium transition-colors disabled:opacity-50'>
            {cancelText}
          </button>
          <button
            type='button'
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition-colors disabled:opacity-60 ${
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-primary hover:bg-primary/90'
            }`}>
            {isLoading ? <Loader2 className='h-4 w-4 shrink-0 animate-spin' /> : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
