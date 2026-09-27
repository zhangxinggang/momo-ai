import { useSettingsStore, useSkillStore, useUIStore } from '@renderer/store';
import { Button, Input } from 'antd';
import {
  FolderPlusIcon,
  MoonIcon,
  PanelLeftIcon,
  PlusIcon,
  SearchIcon,
  SunIcon,
} from 'lucide-react';
import { lazy, Suspense, useEffect, useState } from 'react';

const CreateSkillModal = lazy(() =>
  import('@renderer/components/Skill/CreateSkillModal').then((module) => ({
    default: module.CreateSkillModal,
  })),
);

export function TopBar() {
  const appModule = useUIStore((state) => state.appModule);
  const collapsed = useUIStore((state) => state.isSidebarCollapsed);
  const setCollapsed = useUIStore((state) => state.setSidebarCollapsed);
  const isDark = useSettingsStore((state) => state.isDarkMode);
  const setDark = useSettingsStore((state) => state.setDarkMode);
  const storeView = useSkillStore((state) => state.storeView);
  const search = useSkillStore((state) => state.searchQuery);
  const setSearch = useSkillStore((state) => state.setSearchQuery);
  const [creating, setCreating] = useState(false);
  const isSkill = appModule === 'skill';
  const isProject = isSkill && storeView === 'projects';
  const inlineSearch = storeView === 'my-skills' || storeView === 'distribution';

  useEffect(() => {
    const open = () => setCreating(true);
    document.addEventListener('open-create-skill-modal', open);
    return () => document.removeEventListener('open-create-skill-modal', open);
  }, []);

  return (
    <>
      <header
        className='app-wallpaper-toolbar border-border flex h-12 shrink-0 items-center border-b px-4'
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <Button
          type='text'
          onClick={() => setCollapsed(!collapsed)}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          title={collapsed ? '展开' : '收起'}
          aria-label={collapsed ? '展开' : '收起'}
          icon={<PanelLeftIcon className='h-4 w-4' />}
        />
        <div className='flex flex-1 items-center justify-center px-3'>
          {isSkill && !inlineSearch ? (
            <Input
              aria-label='搜索技能'
              placeholder={isProject ? '搜索项目 Skills...' : '搜索 Skills...'}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setSearch('');
              }}
              allowClear
              className='max-w-lg'
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              prefix={<SearchIcon className='h-4 w-4' />}
            />
          ) : null}
        </div>
        <div
          className='flex items-center gap-1'
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          {isSkill ? (
            <Button
              type='primary'
              onClick={() => {
                if (isProject)
                  document.dispatchEvent(new CustomEvent('open-create-skill-project-modal'));
                else setCreating(true);
              }}
              icon={isProject ? <FolderPlusIcon size={16} /> : <PlusIcon size={16} />}>
              {isProject ? '添加项目' : '新建'}
            </Button>
          ) : null}
          <Button
            type='text'
            aria-label={isDark ? '浅色' : '深色'}
            onClick={() => setDark(!isDark)}
            icon={isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          />
        </div>
      </header>
      <Suspense fallback={null}>
        <CreateSkillModal isOpen={creating} onClose={() => setCreating(false)} />
      </Suspense>
    </>
  );
}
