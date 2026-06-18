import type { ISkillPlatform } from '@/types/constants/platforms';
import type { ISkill } from '@/types/modules';
import { PlatformIcon } from '@renderer/components/ui/PlatformIcon';
import { useAppName } from '@renderer/hooks/useAppName';
import { getProtocolDisplayLabel, getSkillSourceMeta } from '@renderer/services/skill/detail-utils';
import { Button } from 'antd';
import {
  CheckIcon,
  CheckSquareIcon,
  ChevronRightIcon,
  CopyPlusIcon,
  DownloadIcon,
  FileTextIcon,
  FolderOpenIcon,
  GithubIcon,
  LinkIcon,
  PackageIcon,
  SquareIcon,
} from 'lucide-react';
interface IProps {
  availablePlatforms: ISkillPlatform[];
  handleExport: (format: 'skillmd' | 'zip') => void;
  installMode: 'copy' | 'symlink';
  installProgress: { current: number; total: number } | null;
  isBatchInstalling: boolean;
  selectedPlatforms: Set<string>;
  selectedSkill: ISkill;
  selectAllPlatforms: () => void;
  deselectAllPlatforms: () => void;
  setInstallMode: (mode: 'copy' | 'symlink') => void;
  skillMdInstallStatus: Record<string, boolean>;
  togglePlatformSelection: (platformId: string) => void;
  uninstallFromPlatform: (platformId: string) => void;
  uninstalledPlatforms: ISkillPlatform[];
  onBatchInstall: () => void;
}

export function SkillPlatformPanel({
  availablePlatforms,
  handleExport,
  installMode,
  installProgress,
  isBatchInstalling,
  selectedPlatforms,
  selectedSkill,
  selectAllPlatforms,
  deselectAllPlatforms,
  setInstallMode,
  skillMdInstallStatus,
  togglePlatformSelection,
  uninstallFromPlatform,
  uninstalledPlatforms,
  onBatchInstall,
}: IProps) {
  const appName = useAppName();
  const sourceMeta = getSkillSourceMeta(selectedSkill);

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div className='space-y-6'>
        <h3 className='text-muted-foreground flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em]'>
          <span>{'平台集成'}</span>
          <span className='text-[10px]'>SKILL.md</span>
        </h3>

        {availablePlatforms.length > 0 && (
          <section className='app-wallpaper-panel border-border space-y-4 rounded-2xl border p-5'>
            <div className='bg-accent/50 flex items-center gap-1 rounded-lg p-1'>
              <Button
                type={installMode === 'copy' ? 'primary' : 'text'}
                onClick={() => setInstallMode('copy')}
                icon={<CopyPlusIcon className='h-3 w-3' />}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] font-medium ${
                  installMode === 'copy'
                    ? 'shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}>
                {'复制'}
              </Button>
              <Button
                type={installMode === 'symlink' ? 'primary' : 'text'}
                onClick={() => setInstallMode('symlink')}
                icon={<LinkIcon className='h-3 w-3' />}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] font-medium ${
                  installMode === 'symlink'
                    ? 'shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}>
                {'软链接'}
              </Button>
            </div>
            <p className='text-muted-foreground text-[10px] leading-relaxed'>
              {installMode === 'copy'
                ? `复制：将 SKILL.md 文件复制到每个平台目录。各副本独立互不影响，在 ${appName} 中编辑后不会自动同步。`
                : `软链接：创建指向源文件的符号链接。所有平台共享同一份内容，在 ${appName} 中编辑后自动同步，但需要文件系统支持。`}
            </p>

            {uninstalledPlatforms.length > 0 && (
              <div className='bg-accent/30 border-border flex flex-col gap-2 rounded-xl border p-3'>
                <div className='flex items-center justify-between'>
                  <Button
                    type='text'
                    size='small'
                    onClick={
                      selectedPlatforms.size === uninstalledPlatforms.length
                        ? deselectAllPlatforms
                        : selectAllPlatforms
                    }
                    className='text-muted-foreground hover:text-foreground flex h-auto items-center gap-1.5 p-0 text-xs'
                    disabled={isBatchInstalling}
                    icon={
                      selectedPlatforms.size === uninstalledPlatforms.length ? (
                        <CheckSquareIcon className='h-4 w-4' />
                      ) : (
                        <SquareIcon className='h-4 w-4' />
                      )
                    }>
                    {selectedPlatforms.size === uninstalledPlatforms.length ? '取消全选' : '全选'}
                  </Button>
                  {selectedPlatforms.size > 0 && (
                    <span className='text-muted-foreground text-xs'>
                      {selectedPlatforms.size} {'已选择'}
                    </span>
                  )}
                </div>
                <Button
                  type='primary'
                  block
                  onClick={onBatchInstall}
                  disabled={selectedPlatforms.size === 0 || isBatchInstalling}
                  loading={isBatchInstalling}
                  icon={isBatchInstalling ? undefined : <DownloadIcon className='h-3.5 w-3.5' />}
                  className='shadow-primary/20 rounded-lg text-xs font-bold shadow-lg'>
                  {isBatchInstalling
                    ? installProgress
                      ? `${installProgress.current}/${installProgress.total}`
                      : '安装中...'
                    : '批量安装'}
                </Button>
              </div>
            )}

            <div className='space-y-2'>
              {availablePlatforms.map((platform) => {
                const isInstalled = skillMdInstallStatus[platform.id];
                const isSelected = selectedPlatforms.has(platform.id);

                return (
                  <div
                    key={platform.id}
                    onClick={() => {
                      if (isInstalled || isBatchInstalling) return;
                      togglePlatformSelection(platform.id);
                    }}
                    className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
                      isInstalled
                        ? 'bg-primary/5 border-primary cursor-default'
                        : isSelected
                          ? 'bg-primary/10 border-primary cursor-pointer'
                          : 'bg-accent/30 border-border hover:bg-accent/50 cursor-pointer'
                    } ${isBatchInstalling && !isInstalled ? 'cursor-wait opacity-70' : ''}`}>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center'>
                        <PlatformIcon platformId={platform.id} size={28} />
                      </div>
                      <div>
                        <h4 className='text-sm font-medium'>{platform.name}</h4>
                        <p className='text-muted-foreground text-[10px]'>
                          {isInstalled ? '已安装' : isSelected ? '待安装' : '点击选择'}
                        </p>
                      </div>
                    </div>
                    {isInstalled ? (
                      <div className='flex items-center gap-2'>
                        <CheckIcon className='text-primary h-4 w-4' />
                        <Button
                          type='link'
                          danger
                          size='small'
                          onClick={(event) => {
                            event.stopPropagation();
                            uninstallFromPlatform(platform.id);
                          }}
                          className='h-auto p-0 text-[10px]'>
                          {'卸载'}
                        </Button>
                      </div>
                    ) : (
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                          isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                        }`}>
                        {isSelected && <CheckIcon className='h-3 w-3 text-white' />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className='app-wallpaper-panel border-border space-y-4 rounded-2xl border p-5'>
          <h3 className='text-muted-foreground text-xs font-bold uppercase tracking-[0.2em]'>
            {'元数据'}
          </h3>
          <div className='grid grid-cols-1 gap-3'>
            <div className='flex items-center justify-between gap-4 text-sm'>
              <span className='text-muted-foreground'>{'ID'}</span>
              <span className='bg-accent max-w-[150px] truncate rounded px-2 py-0.5 font-mono text-[10px]'>
                {selectedSkill.id}
              </span>
            </div>
            <div className='flex items-center justify-between gap-4 text-sm'>
              <span className='text-muted-foreground'>{'协议'}</span>
              <span className='text-primary flex items-center gap-1 text-xs font-bold uppercase tracking-tight'>
                <ChevronRightIcon className='h-3.5 w-3.5' />
                {getProtocolDisplayLabel(selectedSkill.protocol_type)}
              </span>
            </div>
            <div className='flex items-center justify-between gap-4 text-sm'>
              <span className='text-muted-foreground'>{'创建时间'}</span>
              <span className='text-xs opacity-80'>
                {new Date(selectedSkill.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className='flex items-center justify-between gap-4 text-sm'>
              <span className='text-muted-foreground'>{'更新时间'}</span>
              <span className='text-xs opacity-80'>
                {new Date(selectedSkill.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </section>

        <section className='app-wallpaper-panel border-border space-y-4 rounded-2xl border p-5'>
          <h3 className='text-muted-foreground text-xs font-bold uppercase tracking-[0.2em]'>
            {'导出'}
          </h3>
          <div className='grid grid-cols-2 gap-2'>
            <Button
              onClick={() => handleExport('skillmd')}
              className='bg-accent/50 hover:bg-accent border-border flex h-auto flex-col items-center gap-1 rounded-xl border p-3'>
              <FileTextIcon className='text-primary h-5 w-5' />
              <span className='text-xs font-medium'>SKILL.md</span>
            </Button>
            <Button
              onClick={() => handleExport('zip')}
              className='bg-accent/50 hover:bg-accent border-border flex h-auto flex-col items-center gap-1 rounded-xl border p-3'>
              <PackageIcon className='text-primary h-5 w-5' />
              <span className='text-xs font-medium'>ZIP</span>
            </Button>
          </div>
        </section>
      </div>

      <div className='pt-6'>
        {sourceMeta &&
          (sourceMeta.kind === 'local' ? (
            <Button
              onClick={() => window.electron?.openPath?.(sourceMeta.value)}
              className='bg-accent/70 border-border text-foreground hover:bg-accent flex h-auto min-h-[148px] w-full items-center justify-start gap-3 rounded-2xl border p-5 text-left'
              title={sourceMeta.displayValue}>
              <FolderOpenIcon className='h-5 w-5 shrink-0' />
              <div className='min-w-0 flex-1'>
                <div className='break-words text-sm font-semibold'>{sourceMeta.sourceLabel}</div>
                <div className='text-muted-foreground mt-1 whitespace-normal break-words text-xs leading-relaxed'>
                  {sourceMeta.displayValue}
                </div>
              </div>
            </Button>
          ) : (
            <a
              href={sourceMeta.value}
              target='_blank'
              rel='noreferrer'
              className={`flex min-h-[148px] w-full items-center gap-3 rounded-2xl p-5 text-left text-white transition-opacity hover:opacity-90 ${
                sourceMeta.kind === 'github' ? 'bg-[#24292e]' : 'bg-slate-700'
              }`}
              title={sourceMeta.displayValue}>
              {sourceMeta.kind === 'github' ? (
                <GithubIcon className='h-5 w-5 shrink-0' />
              ) : (
                <LinkIcon className='h-5 w-5 shrink-0' />
              )}
              <div className='min-w-0 flex-1'>
                <div className='break-words text-sm font-semibold'>{sourceMeta.sourceLabel}</div>
                <div className='mt-1 whitespace-normal break-words text-xs leading-relaxed text-white/70'>
                  {sourceMeta.displayValue}
                </div>
              </div>
            </a>
          ))}
      </div>
    </div>
  );
}
