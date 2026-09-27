import { useAppName } from '@renderer/hooks/useAppName';
import {
  closeWindow,
  isWindowFullscreen,
  isWindowMaximized,
  maximizeWindow,
  minimizeWindow,
  subscribeFullscreenChanged,
  subscribeMaximizedChanged,
} from '@renderer/services/desktop';
import { getSystemLogo } from '@renderer/services/system';
import { Button } from 'antd';
import { MinusIcon, SquareIcon, XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function RestoreWindowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      className={className}
      viewBox='0 0 16 16'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.25'>
      <path d='M6 6V4.75A1.25 1.25 0 0 1 7.25 3.5h4A1.25 1.25 0 0 1 12.5 4.75v4A1.25 1.25 0 0 1 11.25 10H10' />
      <rect x='3.5' y='6.5' width='6.5' height='6.5' rx='0.75' />
    </svg>
  );
}

/**
 * Windows 自定义标题栏组件
 * 仅在 Windows 平台显示
 */
export function TitleBar() {
  const appName = useAppName();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isWindows, setIsWindows] = useState(false);
  const [ico, setIco] = useState<string>();
  const titleBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = titleBarRef.current;
    if (!element) return;
    const updateHeight = () =>
      document.documentElement.style.setProperty(
        '--app-titlebar-height',
        `${element.getBoundingClientRect().height}px`,
      );
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--app-titlebar-height');
    };
  }, [isWindows]);

  useEffect(() => {
    // 检测是否为 Windows 平台
    const platform = navigator.userAgent.toLowerCase();
    setIsWindows(platform.includes('win'));
  }, []);

  useEffect(() => {
    void getSystemLogo().then((systemLogo) => {
      setIco(systemLogo);
    });
  }, []);

  useEffect(() => {
    let disposed = false;
    const unsubscribeFullscreen = subscribeFullscreenChanged(setIsFullscreen);
    const unsubscribeMaximized = subscribeMaximizedChanged(setIsMaximized);

    void Promise.all([isWindowFullscreen(), isWindowMaximized()]).then(
      ([fullscreen, maximized]) => {
        if (disposed) return;
        setIsFullscreen(fullscreen);
        setIsMaximized(maximized);
      },
    );

    return () => {
      disposed = true;
      unsubscribeFullscreen();
      unsubscribeMaximized();
    };
  }, []);

  const isRestorable = isFullscreen || isMaximized;

  // 非 Windows 平台不显示
  if (!isWindows) return null;

  const handleMinimize = () => {
    minimizeWindow();
  };

  const handleMaximize = () => {
    maximizeWindow();
  };

  const handleClose = () => {
    closeWindow();
  };

  return (
    <div
      ref={titleBarRef}
      className='app-titlebar app-wallpaper-panel-strong titlebar-drag border-border flex h-8 shrink-0 select-none items-center justify-between border-b'>
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
          title={isRestorable ? '还原' : '最大化'}
          aria-label={isRestorable ? '还原窗口' : '最大化窗口'}
          icon={
            isRestorable ? (
              <RestoreWindowIcon className='text-foreground/70 h-3.5 w-3.5' />
            ) : (
              <SquareIcon className='text-foreground/70 h-3.5 w-3.5' />
            )
          }
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
