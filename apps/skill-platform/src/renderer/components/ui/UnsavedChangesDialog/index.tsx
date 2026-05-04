import { Button, Modal } from 'antd';
import { AlertCircleIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

export function UnsavedChangesDialog({ isOpen, onClose, onSave, onDiscard }: IProps) {
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => {
        saveButtonRef.current?.focus();
      }, 50);
      return () => window.clearTimeout(id);
    }
  }, [isOpen]);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={'未保存的更改'}
      footer={
        <div className='flex w-full gap-3'>
          <Button className='flex-1' onClick={onClose}>
            {'取消'}
          </Button>
          <Button className='flex-1' danger onClick={onDiscard}>
            {'不保存'}
          </Button>
          <Button ref={saveButtonRef} className='flex-1' type='primary' onClick={onSave}>
            {'保存'}
          </Button>
        </div>
      }
      centered
      destroyOnClose
      closable
      maskClosable>
      <div className='mb-4 flex justify-center'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30'>
          <AlertCircleIcon className='h-6 w-6 text-amber-600 dark:text-amber-400' />
        </div>
      </div>
      <p className='text-muted-foreground text-center text-sm'>
        {'您有未保存的更改，是否要保存？'}
      </p>
    </Modal>
  );
}
