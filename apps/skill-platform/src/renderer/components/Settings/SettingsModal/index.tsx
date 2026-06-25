import { useSettingsStore } from '@renderer/store';
import type { EThemeMode } from '@renderer/types/settings';
import { Button, Modal } from 'antd';
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: IProps) {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);

  const themeOptions: Array<{
    value: EThemeMode;
    label: string;
    icon: typeof SunIcon;
  }> = [
    { value: 'light', label: '浅色', icon: SunIcon },
    { value: 'dark', label: '深色', icon: MoonIcon },
    { value: 'system', label: '跟随系统', icon: MonitorIcon },
  ];

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={'设置'}
      width={500}
      footer={null}
      destroyOnHidden>
      <div className='space-y-6'>
        <div className='space-y-3'>
          <h3 className='text-foreground flex items-center gap-2 text-sm font-semibold'>
            <SunIcon className='text-primary h-4 w-4' />
            {'显示设置'}
          </h3>
          <div className='grid grid-cols-3 gap-2'>
            {themeOptions.map((option) => (
              <Button
                key={option.value}
                type='text'
                onClick={() => setThemeMode(option.value)}
                className={`flex h-auto flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  themeMode === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } `}>
                <option.icon
                  className={`h-6 w-6 ${themeMode === option.value ? 'text-primary' : 'text-muted-foreground'}`}
                />
                <span
                  className={`text-sm font-medium ${themeMode === option.value ? 'text-primary' : 'text-foreground'}`}>
                  {option.label}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <div className='flex justify-end pt-2'>
          <Button type='primary' onClick={onClose}>
            {'完成'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
