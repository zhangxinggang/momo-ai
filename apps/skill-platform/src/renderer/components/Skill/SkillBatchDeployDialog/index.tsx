import type { ISkillPlatform } from '@/types/constants/platforms';
import type { ISkill } from '@/types/modules';
import { PlatformIcon } from '@renderer/components/ui/PlatformIcon';
import { useToast } from '@renderer/components/ui/Toast';
import { useAppName } from '@renderer/hooks/useAppName';
import { detectSkillPlatforms, getSupportedSkillPlatforms } from '@renderer/services/skill/api';
import {
  syncSkillsToPlatforms,
  unsyncSkillsFromPlatforms,
  type ESkillInstallMode,
} from '@renderer/services/skill/platform-sync';
import { useSettingsStore } from '@renderer/store';
import { Button, Modal } from 'antd';
import {
  ArrowRightIcon,
  CheckSquareIcon,
  Loader2Icon,
  RefreshCwIcon,
  SendIcon,
  SquareIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface IProps {
  skills: ISkill[];
  onClose: () => void;
  onComplete?: () => Promise<void> | void;
}

export function SkillBatchDeployDialog({ skills, onClose, onComplete }: IProps) {
  const appName = useAppName();
  const { showToast } = useToast();
  const [actionMode, setActionMode] = useState<'deploy' | 'undeploy'>('deploy');
  const skillInstallMethod = useSettingsStore((state) => state.skillInstallMethod);
  const [installMode, setInstallMode] = useState<ESkillInstallMode>(skillInstallMethod);
  const [supportedPlatforms, setSupportedPlatforms] = useState<ISkillPlatform[]>([]);
  const [detectedPlatforms, setDetectedPlatforms] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [loadingPlatforms, setLoadingPlatforms] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [lastFailures, setLastFailures] = useState<
    Array<{ skillName: string; platformId: string; reason: string }>
  >([]);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    skillName: string;
    platformId: string;
  } | null>(null);

  const availablePlatforms = useMemo(
    () => supportedPlatforms.filter((platform) => detectedPlatforms.includes(platform.id)),
    [detectedPlatforms, supportedPlatforms],
  );
  const totalTargets = skills.length * selectedPlatforms.size;

  useEffect(() => {
    if (availablePlatforms.length === 0) return;

    setSelectedPlatforms((previous) => {
      if (previous.size > 0) {
        return previous;
      }
      return new Set(availablePlatforms.map((platform) => platform.id));
    });
  }, [availablePlatforms]);

  useEffect(() => {
    let cancelled = false;

    async function loadPlatforms() {
      setLoadingPlatforms(true);
      try {
        const [platforms, detected] = await Promise.all([
          getSupportedSkillPlatforms(),
          detectSkillPlatforms(),
        ]);
        if (cancelled) {
          return;
        }
        setSupportedPlatforms(platforms);
        setDetectedPlatforms(detected);
      } catch (error) {
        console.error('Failed to load skill platforms:', error);
      } finally {
        if (!cancelled) {
          setLoadingPlatforms(false);
        }
      }
    }

    void loadPlatforms();

    return () => {
      cancelled = true;
    };
  }, []);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((previous) => {
      const next = new Set(previous);
      if (next.has(platformId)) {
        next.delete(platformId);
      } else {
        next.add(platformId);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    if (selectedPlatforms.size === availablePlatforms.length) {
      setSelectedPlatforms(new Set());
      return;
    }
    setSelectedPlatforms(new Set(availablePlatforms.map((platform) => platform.id)));
  };

  const handleDeploy = async () => {
    if (skills.length === 0 || selectedPlatforms.size === 0) {
      return;
    }

    setIsDeploying(true);
    setLastFailures([]);
    try {
      const result =
        actionMode === 'deploy'
          ? await syncSkillsToPlatforms(
              skills,
              Array.from(selectedPlatforms),
              installMode,
              setProgress,
            )
          : await unsyncSkillsFromPlatforms(skills, Array.from(selectedPlatforms), setProgress);
      await onComplete?.();
      setLastFailures(result.failures);

      if (result.successCount > 0) {
        showToast(
          actionMode === 'deploy'
            ? `已同步 ${result.successCount}/${result.totalCount} 个目标`
            : `已从 ${result.successCount}/${result.totalCount} 个目标卸载`,
          result.failures.length === 0 ? 'success' : 'warning',
        );
      }

      if (result.failures.length > 0) {
        const preview = result.failures
          .slice(0, 2)
          .map((item) => `${item.skillName} -> ${item.platformId}`)
          .join(', ');
        showToast(`${result.failures.length} 个目标同步失败：${preview}`, 'error');
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Failed to batch deploy skills:', error);
      showToast(`更新失败: ${String(error)}`, 'error');
    } finally {
      setIsDeploying(false);
      setProgress(null);
    }
  };

  return (
    <Modal
      open
      zIndex={1050}
      onCancel={onClose}
      title={
        <div>
          <div className='flex items-center gap-2'>
            <SendIcon className='text-primary h-5 w-5' />
            <span className='text-lg font-semibold'>{'批量同步到平台'}</span>
          </div>
          <p className='text-muted-foreground mt-1 text-xs'>
            {`将 ${skills.length} 个 skill 同步到选定平台。`}
          </p>
        </div>
      }
      width={672}
      footer={
        <div className='flex justify-end gap-3'>
          <Button onClick={onClose} disabled={isDeploying}>
            {'取消'}
          </Button>
          <Button
            type='primary'
            loading={isDeploying}
            disabled={
              isDeploying ||
              loadingPlatforms ||
              selectedPlatforms.size === 0 ||
              availablePlatforms.length === 0
            }
            icon={!isDeploying ? <SendIcon className='h-4 w-4' /> : undefined}
            onClick={() => void handleDeploy()}>
            {isDeploying ? '同步中' : actionMode === 'deploy' ? '批量同步到平台' : '批量从平台卸载'}
          </Button>
        </div>
      }
      styles={{
        body: { maxHeight: 'min(85vh, 720px)', overflowY: 'auto', padding: '24px' },
        mask: { backdropFilter: 'blur(4px)' },
      }}
      destroyOnHidden={false}>
      <div className='space-y-4'>
        <section className='border-border bg-background/60 rounded-2xl border p-4'>
          <h3 className='text-sm font-semibold'>{'操作模式'}</h3>
          <div className='mt-3 grid gap-2 sm:grid-cols-2'>
            {(
              [
                ['deploy', '批量同步到平台'],
                ['undeploy', '批量从平台卸载'],
              ] as const
            ).map(([mode, label]) => (
              <Button
                key={mode}
                onClick={() => setActionMode(mode)}
                className={`h-auto rounded-xl border px-4 py-3 text-left transition-colors ${
                  actionMode === mode
                    ? 'border-primary/40 bg-primary/5 text-primary'
                    : 'border-border app-wallpaper-surface hover:border-primary/25'
                }`}>
                <div className='text-sm font-medium'>{label}</div>
              </Button>
            ))}
          </div>
        </section>

        <section className='border-border bg-background/60 rounded-2xl border p-4'>
          <h3 className='text-sm font-semibold'>{actionMode === 'deploy' ? '安装方式' : '操作'}</h3>
          {actionMode === 'deploy' ? (
            <div className='mt-3 grid gap-2 sm:grid-cols-2'>
              {(['copy', 'symlink'] as ESkillInstallMode[]).map((mode) => (
                <Button
                  key={mode}
                  onClick={() => setInstallMode(mode)}
                  className={`h-auto whitespace-normal rounded-xl border px-4 py-3 text-left transition-colors ${
                    installMode === mode
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border app-wallpaper-surface hover:border-primary/25'
                  }`}>
                  <div className='text-sm font-medium'>
                    {mode === 'symlink' ? '软链接' : '复制'}
                  </div>
                  <div className='text-muted-foreground mt-1 text-xs'>
                    {mode === 'symlink'
                      ? '在平台目录中创建符号链接，后续更新更轻量。'
                      : '将 SKILL.md 复制到平台目录中，兼容性更好。'}
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className='border-border app-wallpaper-surface text-muted-foreground mt-3 rounded-xl border px-4 py-3 text-sm'>
              {`从选定平台目录移除对应 skill，不影响 ${appName} 本地仓库。`}
            </div>
          )}
        </section>

        <section className='border-border bg-background/60 rounded-2xl border p-4'>
          <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
            <h3 className='text-sm font-semibold'>{'目标平台'}</h3>
            <div className='flex flex-wrap items-center gap-3'>
              {availablePlatforms.length > 0 ? (
                <span className='bg-primary/10 text-primary rounded-full px-2.5 py-1 text-[11px] font-medium'>
                  {`已选 ${selectedPlatforms.size} 个`}
                </span>
              ) : null}
              {availablePlatforms.length > 0 ? (
                <Button
                  type='link'
                  size='small'
                  onClick={handleToggleAll}
                  className='text-primary h-auto p-0 text-xs font-medium'>
                  {selectedPlatforms.size === availablePlatforms.length
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
              ) : null}
            </div>
          </div>

          {loadingPlatforms ? (
            <div className='text-muted-foreground flex items-center gap-2 text-sm'>
              <Loader2Icon className='h-4 w-4 animate-spin' />
              {'加载中…'}
            </div>
          ) : availablePlatforms.length === 0 ? (
            <div className='border-border text-muted-foreground rounded-xl border border-dashed px-4 py-6 text-center text-sm'>
              {'没有检测到可同步的平台目录'}
            </div>
          ) : (
            <>
              <div className='border-primary/15 bg-primary/[0.04] text-muted-foreground mb-3 rounded-2xl border px-4 py-3 text-xs leading-6'>
                {actionMode === 'deploy'
                  ? '默认已选中当前检测到的平台。开始批量同步前请先确认目标平台。'
                  : `仅会从所选平台移除 ${appName} 分发出去的 skill，不会删除本地仓库中的原始文件。`}
              </div>
              <div className='grid gap-3 sm:grid-cols-2'>
                {availablePlatforms.map((platform) => {
                  const isSelected = selectedPlatforms.has(platform.id);
                  return (
                    <Button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`flex h-auto items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                        isSelected
                          ? 'border-primary/40 bg-primary/5 shadow-primary/10 shadow-sm'
                          : 'border-border app-wallpaper-surface hover:border-primary/25'
                      }`}>
                      <div className='bg-accent rounded-xl p-2'>
                        <PlatformIcon platformId={platform.id} size={20} />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='text-sm font-medium'>{platform.name}</div>
                        <div className='text-muted-foreground text-xs'>{platform.id}</div>
                      </div>
                      {isSelected ? (
                        <CheckSquareIcon className='text-primary h-4 w-4' />
                      ) : (
                        <SquareIcon className='text-muted-foreground h-4 w-4' />
                      )}
                    </Button>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <section className='border-border bg-background/60 rounded-2xl border p-4'>
          <div className='mb-3 flex items-center justify-between'>
            <h3 className='text-sm font-semibold'>{'已选技能'}</h3>
            <span className='bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-medium'>
              {skills.length}
            </span>
          </div>
          <div className='max-h-56 space-y-2 overflow-y-auto pr-1'>
            {skills.map((skill) => (
              <div
                key={skill.id}
                className='border-border app-wallpaper-surface flex items-center justify-between rounded-xl border px-3 py-2'>
                <div className='min-w-0'>
                  <div className='truncate text-sm font-medium'>{skill.name}</div>
                  {skill.description ? (
                    <div className='text-muted-foreground truncate text-xs'>
                      {skill.description}
                    </div>
                  ) : null}
                </div>
                {skill.version ? (
                  <span className='bg-primary/10 text-primary ml-3 shrink-0 rounded-full px-2 py-0.5 text-[10px]'>
                    v{skill.version}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className='border-border bg-background/60 rounded-2xl border p-4'>
          <h3 className='text-sm font-semibold'>{'同步摘要'}</h3>
          <div className='mt-4 grid grid-cols-3 gap-2'>
            <div className='border-border app-wallpaper-surface rounded-xl border px-3 py-2'>
              <div className='text-muted-foreground text-[10px] font-medium uppercase leading-tight tracking-wide'>
                {'已选技能'}
              </div>
              <div className='text-foreground mt-1 text-xl font-semibold'>{skills.length}</div>
            </div>
            <div className='border-border app-wallpaper-surface rounded-xl border px-3 py-2'>
              <div className='text-muted-foreground text-[10px] font-medium uppercase leading-tight tracking-wide'>
                {'目标平台'}
              </div>
              <div className='text-foreground mt-1 text-xl font-semibold'>
                {selectedPlatforms.size}
              </div>
            </div>
            <div className='border-border app-wallpaper-surface rounded-xl border px-3 py-2'>
              <div className='text-muted-foreground text-[10px] font-medium uppercase leading-tight tracking-wide'>
                {'目标总数'}
              </div>
              <div className='text-foreground mt-1 text-xl font-semibold'>{totalTargets}</div>
            </div>
          </div>

          <div className='border-border app-wallpaper-surface mt-4 rounded-2xl border px-4 py-3'>
            <div className='text-muted-foreground text-[11px] font-medium uppercase tracking-wide'>
              {'执行计划'}
            </div>
            <div className='text-foreground mt-2 flex items-center gap-2 text-sm'>
              <span className='bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-medium'>
                {actionMode === 'deploy' ? '批量同步到平台' : '批量从平台卸载'}
              </span>
              <ArrowRightIcon className='text-muted-foreground h-4 w-4' />
              <span className='truncate'>
                {selectedPlatforms.size > 0
                  ? availablePlatforms
                      .filter((platform) => selectedPlatforms.has(platform.id))
                      .map((platform) => platform.name)
                      .join(', ')
                  : '尚未选择平台'}
              </span>
            </div>
          </div>

          {progress ? (
            <div className='border-primary/20 bg-primary/5 mt-4 rounded-xl border p-3'>
              <div className='text-foreground flex items-center gap-2 text-sm font-medium'>
                <RefreshCwIcon className='text-primary h-4 w-4 animate-spin' />
                {`正在同步 ${progress.current}/${progress.total}...`}
              </div>
              <div className='text-muted-foreground mt-1 text-xs'>
                {progress.skillName} {'->'} {progress.platformId}
              </div>
              <div className='bg-primary/10 mt-3 h-2 overflow-hidden rounded-full'>
                <div
                  className='bg-primary h-full rounded-full transition-all'
                  style={{
                    width: `${Math.max(6, Math.round((progress.current / progress.total) * 100))}%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          {lastFailures.length > 0 ? (
            <div className='border-destructive/20 bg-destructive/5 mt-4 rounded-xl border p-3'>
              <div className='text-foreground text-sm font-medium'>{'失败目标'}</div>
              <div className='text-muted-foreground mt-2 space-y-1 text-xs'>
                {lastFailures.slice(0, 6).map((failure) => (
                  <div key={`${failure.skillName}-${failure.platformId}`}>
                    {failure.skillName} {'->'} {failure.platformId}: {failure.reason}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </Modal>
  );
}
