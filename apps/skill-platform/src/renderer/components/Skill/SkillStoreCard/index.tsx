import type { IRegistrySkill } from '@/types/modules';
import { Button } from 'antd';
import { CheckIcon, DownloadIcon, Loader2Icon, PlusIcon } from 'lucide-react';
import { SkillIcon } from '../SkillIcon';

const MAX_STAGGERED_STORE_CARDS = 12;

interface IProps {
  skill: IRegistrySkill;
  isInstalled: boolean;
  hasUpdate?: boolean;
  index: number;
  installingSlug?: string | null;
  onQuickInstall?: (skill: IRegistrySkill, e: React.MouseEvent) => void;
  onClick: () => void;
}

export function SkillStoreCard({
  skill,
  isInstalled,
  hasUpdate = false,
  index,
  installingSlug,
  onQuickInstall,
  onClick,
}: IProps) {
  const isInstallingThis = installingSlug === skill.slug;

  return (
    <div
      onClick={onClick}
      style={{
        animationDelay: `${Math.min(index, MAX_STAGGERED_STORE_CARDS) * 30}ms`,
        contentVisibility: 'auto',
        containIntrinsicSize: '86px',
      }}
      className='app-wallpaper-surface border-border hover:border-primary/40 animate-in fade-in slide-in-from-bottom-2 group relative flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all hover:shadow-md'>
      <SkillIcon
        iconUrl={skill.icon_url}
        iconEmoji={skill.icon_emoji}
        backgroundColor={skill.icon_background}
        name={skill.name}
        size='md'
      />

      <div className='min-w-0 flex-1'>
        <h4 className='text-foreground group-hover:text-primary truncate text-sm font-semibold transition-colors'>
          {skill.name}
        </h4>
        <p className='text-muted-foreground mt-0.5 truncate text-[11px]'>{skill.description}</p>
        {skill.weekly_installs && (
          <div className='bg-primary/10 text-primary mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium'>
            {skill.weekly_installs}/wk
          </div>
        )}
      </div>

      <div className='shrink-0'>
        {hasUpdate ? (
          <div className='p-1.5 text-amber-500' title={'有可用更新'}>
            <DownloadIcon className='h-4 w-4' />
          </div>
        ) : isInstalled ? (
          <div className='p-1.5 text-green-500' title={'已导入'}>
            <CheckIcon className='h-4 w-4' />
          </div>
        ) : (
          <Button
            type='text'
            onClick={(e) => onQuickInstall?.(skill, e)}
            disabled={isInstallingThis}
            className='text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg p-1.5 active:scale-90'
            title={'导入'}
            icon={
              isInstallingThis ? (
                <Loader2Icon className='text-primary h-4 w-4 animate-spin' />
              ) : (
                <PlusIcon className='h-4 w-4' />
              )
            }
          />
        )}
      </div>
    </div>
  );
}
