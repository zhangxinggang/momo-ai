import { sendCloseDialogCancel, sendCloseDialogResult } from '@renderer/services/desktop';
import { useSettingsStore } from '@renderer/store';
import { Button, Checkbox, Modal } from 'antd';
import { LogOutIcon, MinusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CloseDialog({ isOpen, onClose }: IProps) {
  const [rememberChoice, setRememberChoice] = useState(false);
  const setCloseAction = useSettingsStore((state) => state.setCloseAction);

  useEffect(() => {
    if (isOpen) {
      setRememberChoice(false);
    }
  }, [isOpen]);

  const handleCancel = () => {
    sendCloseDialogCancel();
    onClose();
  };

  const handleMinimize = () => {
    if (rememberChoice) {
      setCloseAction('minimize');
    }
    sendCloseDialogResult('minimize', rememberChoice);
    onClose();
  };

  const handleExit = () => {
    if (rememberChoice) {
      setCloseAction('exit');
    }
    sendCloseDialogResult('exit', rememberChoice);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      zIndex={10000}
      title={'关闭应用'}
      onCancel={handleCancel}
      footer={null}
      width={400}
      destroyOnHidden={false}
      styles={{ mask: { backdropFilter: 'blur(8px)' } }}>
      <p className='text-muted-foreground mb-4 text-sm'>{'您想要关闭应用还是最小化到系统托盘？'}</p>

      <div className='space-y-3'>
        <Button block size='large' className='!h-auto justify-start !py-4' onClick={handleMinimize}>
          <div className='flex w-full items-center gap-3 text-left'>
            <div className='bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground rounded-lg p-2 transition-colors'>
              <MinusIcon className='h-5 w-5' />
            </div>
            <span className='text-foreground font-medium'>{'最小化到托盘'}</span>
          </div>
        </Button>

        <Button block size='large' className='!h-auto justify-start !py-4' onClick={handleExit}>
          <div className='flex w-full items-center gap-3 text-left'>
            <div className='bg-destructive/10 text-destructive rounded-lg p-2 transition-colors'>
              <LogOutIcon className='h-5 w-5' />
            </div>
            <span className='text-foreground font-medium'>{'退出应用'}</span>
          </div>
        </Button>
      </div>

      <div className='mt-4'>
        <Checkbox checked={rememberChoice} onChange={(e) => setRememberChoice(e.target.checked)}>
          {'记住我的选择'}
        </Checkbox>
      </div>
    </Modal>
  );
}
