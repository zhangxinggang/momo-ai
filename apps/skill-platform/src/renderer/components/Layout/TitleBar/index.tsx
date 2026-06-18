import { useAppName } from '@renderer/hooks/useAppName';
import { Button } from 'antd';
import { MinusIcon, SquareIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
/**
 * Windows 自定义标题栏组件
 * 仅在 Windows 平台显示
 */
export function TitleBar() {
  const appName = useAppName();
  const [isMaximized, setIsMaximized] = useState(false);
  const [isWindows, setIsWindows] = useState(false);
  const [ico, setIco] = useState<string>();

  useEffect(() => {
    // 检测是否为 Windows 平台
    const platform = navigator.userAgent.toLowerCase();
    setIsWindows(platform.includes('win'));
  }, []);

  useEffect(() => {
    void window.api.system.getSystemLogo().then((systemLogo) => {
      setIco(systemLogo);
    });
  }, []);

  // 非 Windows 平台不显示
  if (!isWindows) return null;

  const handleMinimize = () => {
    window.electron?.minimize?.();
  };

  const handleMaximize = () => {
    window.electron?.maximize?.();
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    window.electron?.close?.();
  };

  return (
    <div className='app-wallpaper-panel-strong titlebar-drag border-border flex h-8 select-none items-center justify-between border-b'>
      {/* 应用图标和标题 */}
      <div className='flex items-center gap-2 px-3'>
        {ico ? <img src={ico} alt='' className='h-4 w-4 object-contain' draggable={false} /> : null}
        <span className='text-muted-foreground text-xs'>{appName}</span>
      </div>

      {/* 窗口控制按钮（antd Button，保留 titlebar-no-drag 以支持拖拽区） */}
      <div className='titlebar-no-drag flex h-full items-stretch'>
        <Button
          type='text'
          onClick={handleMinimize}
          className='hover:bg-muted flex h-full w-11 items-center justify-center rounded-none border-0'
          title={'最小化'}
          icon={<MinusIcon className='text-foreground/70 h-4 w-4' />}
        />
        <Button
          type='text'
          onClick={handleMaximize}
          className='hover:bg-muted flex h-full w-11 items-center justify-center rounded-none border-0'
          title={isMaximized ? '还原' : '最大化'}
          icon={<SquareIcon className='text-foreground/70 h-3.5 w-3.5' />}
        />
        <Button
          type='text'
          onClick={handleClose}
          className='text-foreground/70 flex h-full w-11 items-center justify-center rounded-none border-0 hover:!bg-red-500 hover:!text-white'
          title={'关闭'}
          icon={<XIcon className='h-4 w-4' />}
        />
      </div>
    </div>
  );
}
