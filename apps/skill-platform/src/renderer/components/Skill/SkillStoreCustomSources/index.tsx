import type { ISkillStoreSource } from '@/types/modules';
import { Button } from 'antd';
import { LinkIcon, Loader2Icon, PowerIcon, TrashIcon } from 'lucide-react';

interface IProps {
  customStoreSources: ISkillStoreSource[];
  loadStoreSource: (sourceId: string, forceRefresh?: boolean) => Promise<void>;
  loadingSourceId: string | null;
  remoteStoreEntries: Record<
    string,
    { loadedAt: number; error?: string | null; skills: { slug: string }[] }
  >;
  removeCustomStoreSource: (id: string) => void;
  selectStoreSource: (id: string) => void;
  selectedCustomSource: ISkillStoreSource | null;
  selectedStoreSourceId: string;
  toggleCustomStoreSource: (id: string) => void;
}

export function SkillStoreCustomSources({
  customStoreSources,
  loadStoreSource,
  loadingSourceId,
  remoteStoreEntries,
  removeCustomStoreSource,
  selectStoreSource,
  selectedCustomSource,
  selectedStoreSourceId,

  toggleCustomStoreSource,
}: IProps) {
  if (!selectedCustomSource && customStoreSources.length === 0) {
    return (
      <div className='app-wallpaper-panel border-border text-muted-foreground rounded-2xl border border-dashed p-8 text-center'>
        <LinkIcon className='mx-auto mb-3 h-10 w-10 opacity-30' />
        <h4 className='text-foreground mb-1 text-base font-semibold'>{'还没有自定义商店'}</h4>
        <p className='text-sm'>{'点击左侧虚线框「添加商店」开始接入你自己的 skill 来源。'}</p>
      </div>
    );
  }

  if (selectedCustomSource) {
    return (
      <div className='app-wallpaper-panel border-border space-y-4 rounded-2xl border p-6'>
        <div className='flex items-center gap-3'>
          <div className='bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl'>
            <LinkIcon className='h-4 w-4' />
          </div>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <h4 className='text-foreground truncate font-semibold'>
                {selectedCustomSource.name}
              </h4>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  selectedCustomSource.enabled
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-muted text-muted-foreground'
                }`}>
                {selectedCustomSource.enabled ? '已启用' : '已停用'}
              </span>
            </div>
            <p className='text-muted-foreground mt-1 truncate text-xs'>
              {selectedCustomSource.url}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            onClick={() => toggleCustomStoreSource(selectedCustomSource.id)}
            className='bg-accent text-foreground hover:bg-accent/80 h-auto rounded-lg px-3 py-2 text-sm'>
            {selectedCustomSource.enabled ? '停用' : '启用'}
          </Button>
          <Button
            onClick={() => void loadStoreSource(selectedCustomSource.id, true)}
            icon={
              <Loader2Icon
                className={`h-4 w-4 ${
                  loadingSourceId === selectedCustomSource.id ? 'animate-spin' : ''
                }`}
              />
            }
            className='bg-accent text-foreground hover:bg-accent/80 h-auto rounded-lg px-3 py-2 text-sm'>
            {'刷新'}
          </Button>
          <Button
            danger
            type='text'
            onClick={() => {
              removeCustomStoreSource(selectedCustomSource.id);
              selectStoreSource('claude-code');
            }}
            className='text-destructive hover:bg-destructive/10 h-auto rounded-lg px-3 py-2 text-sm'>
            {'删除'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='grid gap-3'>
      {customStoreSources.map((source) => {
        const count = remoteStoreEntries[source.id]?.skills.length || 0;
        const isSelected = selectedStoreSourceId === source.id;
        return (
          <div
            key={source.id}
            onClick={() => selectStoreSource(source.id)}
            className={`app-wallpaper-panel flex items-center gap-4 rounded-2xl border p-4 text-left ${
              isSelected ? 'border-primary shadow-sm' : 'border-border'
            }`}>
            <div className='bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl'>
              <LinkIcon className='h-4 w-4' />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <h4 className='text-foreground truncate font-semibold'>{source.name}</h4>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    source.enabled
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                  {source.enabled ? '已启用' : '已停用'}
                </span>
                <span className='bg-accent text-muted-foreground rounded-full px-2 py-0.5 text-[10px]'>
                  {count} {'个技能'}
                </span>
              </div>
              <p className='text-muted-foreground mt-1 truncate text-xs'>{source.url}</p>
            </div>
            <Button
              type='text'
              onClick={(event) => {
                event.stopPropagation();
                toggleCustomStoreSource(source.id);
              }}
              className='text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg p-2'
              title={source.enabled ? '停用' : '启用'}
              icon={<PowerIcon className='h-4 w-4' />}
            />
            <Button
              type='text'
              onClick={(event) => {
                event.stopPropagation();
                void loadStoreSource(source.id, true);
              }}
              className='text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg p-2'
              title={'刷新'}
              icon={
                <Loader2Icon
                  className={`h-4 w-4 ${loadingSourceId === source.id ? 'animate-spin' : ''}`}
                />
              }
            />
            <Button
              type='text'
              danger
              onClick={(event) => {
                event.stopPropagation();
                removeCustomStoreSource(source.id);
              }}
              className='text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg p-2'
              title={'删除'}
              icon={<TrashIcon className='h-4 w-4' />}
            />
          </div>
        );
      })}
    </div>
  );
}
