import { CreatePromptModal } from '@renderer/components/Prompt/CreatePromptModal';
import { SettingsModal } from '@renderer/components/Settings/SettingsModal';
import { usePromptStore } from '@renderer/store';
import { Button, Input } from 'antd';
import { MoonIcon, PlusIcon, SearchIcon, SettingsIcon, SunIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
export function Header() {
  const searchQuery = usePromptStore((state) => state.searchQuery);
  const setSearchQuery = usePromptStore((state) => state.setSearchQuery);
  const [isDark, setIsDark] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleCreatePrompt = (data: {
    title: string;
    description?: string;
    systemPrompt?: string;
    userPrompt: string;
    tags: string[];
  }) => {
    // TODO: 调用 API 创建 IPrompt
    console.log('Creating prompt:', data);
  };

  useEffect(() => {
    // 检测系统主题
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkModeMediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    darkModeMediaQuery.addEventListener('change', handler);
    return () => darkModeMediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <header className='app-wallpaper-surface border-border titlebar-drag sticky top-0 z-10 flex h-14 items-center gap-4 border-b px-5'>
      {/* 搜索框 - iOS 风格 */}
      <div className='titlebar-no-drag max-w-lg flex-1'>
        <Input
          className='bg-muted/50 h-10 rounded-xl border-0'
          placeholder={'搜索 IPrompt...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          prefix={<SearchIcon className='text-muted-foreground h-4 w-4' />}
          variant='borderless'
          styles={{
            input: {
              background: 'transparent',
            },
          }}
        />
      </div>

      {/* 操作按钮 */}
      <div className='titlebar-no-drag flex items-center gap-2'>
        <Button
          type='primary'
          icon={<PlusIcon className='h-4 w-4' />}
          onClick={() => setIsCreateModalOpen(true)}>
          {'新建'}
        </Button>
        <Button
          type='text'
          aria-label={isDark ? '浅色' : '深色'}
          icon={isDark ? <SunIcon className='h-5 w-5' /> : <MoonIcon className='h-5 w-5' />}
          onClick={() => setIsDark(!isDark)}
        />
        <Button
          type='text'
          aria-label={'设置'}
          icon={<SettingsIcon className='h-5 w-5' />}
          onClick={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* 新建 IPrompt 弹窗 */}
      <CreatePromptModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreatePrompt}
      />

      {/* 设置弹窗 */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
}
