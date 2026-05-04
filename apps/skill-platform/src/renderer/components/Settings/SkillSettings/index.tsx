import { Button, Input, Segmented, Switch } from 'antd';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  GripVerticalIcon,
  PlusIcon,
  RotateCcwIcon,
  TrashIcon,
} from 'lucide-react';
import { useMemo, useState, type DragEvent } from 'react';

import { SKILL_PLATFORMS, getPlatformRootTemplate } from '@/types/constants/platforms';
import { SettingItem, SettingSection } from '@renderer/components/Settings/setting-primitives';
import { PlatformIcon } from '@renderer/components/ui/PlatformIcon';
import { useToast } from '@renderer/components/ui/Toast';
import { getSafetyScanAIConfig } from '@renderer/services/skill/detail-utils';
import { useSettingsStore, useSkillStore } from '@renderer/store';
import { sortSkillPlatformsByPreference } from '@renderer/utils/skill/platform-sort';

function getCurrentPlatformKey(): 'darwin' | 'win32' | 'linux' {
  const platform = navigator.userAgent.toLowerCase();
  if (platform.includes('win')) return 'win32';
  if (platform.includes('mac')) return 'darwin';
  return 'linux';
}

function joinResolvedPlatformPath(rootPath: string, relativePath: string): string {
  const normalizedRoot = rootPath.trim().replace(/[\\/]+$/, '');
  const segments = relativePath.split(/[\\/]+/).filter(Boolean);
  if (segments.length === 0) {
    return normalizedRoot;
  }

  const separator = normalizedRoot.includes('\\') ? '\\' : '/';
  return `${normalizedRoot}${separator}${segments.join(separator)}`;
}

function useOrderedPlatforms() {
  const settings = useSettingsStore();

  return useMemo(() => {
    return sortSkillPlatformsByPreference(SKILL_PLATFORMS, settings.skillPlatformOrder ?? []);
  }, [settings.skillPlatformOrder]);
}

function reorderPlatformIds(
  currentOrder: string[],
  sourceId: string,
  targetId: string,
): string[] | null {
  if (sourceId === targetId) {
    return null;
  }

  const sourceIndex = currentOrder.indexOf(sourceId);
  const targetIndex = currentOrder.indexOf(targetId);
  if (sourceIndex === -1 || targetIndex === -1) {
    return null;
  }

  const nextOrder = [...currentOrder];
  const [moved] = nextOrder.splice(sourceIndex, 1);
  nextOrder.splice(targetIndex, 0, moved);
  return nextOrder;
}

export function SkillSettings() {
  const settings = useSettingsStore();
  const orderedPlatforms = useOrderedPlatforms();
  const currentPlatformKey = getCurrentPlatformKey();
  const [newScanPath, setNewScanPath] = useState('');
  const [draggingPlatformId, setDraggingPlatformId] = useState<string | null>(null);
  const [dropTargetPlatformId, setDropTargetPlatformId] = useState<string | null>(null);

  const movePlatformOrder = (platformId: string, direction: 'up' | 'down') => {
    const nextOrder = orderedPlatforms.map((platform) => platform.id);
    const currentIndex = nextOrder.indexOf(platformId);
    if (currentIndex === -1) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= nextOrder.length) {
      return;
    }

    [nextOrder[currentIndex], nextOrder[targetIndex]] = [
      nextOrder[targetIndex],
      nextOrder[currentIndex],
    ];
    settings.setSkillPlatformOrder(nextOrder);
  };

  const applyDraggedPlatformOrder = (sourceId: string, targetId: string) => {
    const nextOrder = reorderPlatformIds(
      orderedPlatforms.map((platform) => platform.id),
      sourceId,
      targetId,
    );
    if (!nextOrder) {
      return;
    }
    settings.setSkillPlatformOrder(nextOrder);
  };

  const handleDragStart = (platformId: string) => (event: DragEvent<HTMLDivElement>) => {
    setDraggingPlatformId(platformId);
    setDropTargetPlatformId(platformId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', platformId);
  };

  const handleDragOver = (platformId: string) => (event: DragEvent<HTMLDivElement>) => {
    if (!draggingPlatformId || draggingPlatformId === platformId) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDropTargetPlatformId(platformId);
  };

  const handleDrop = (platformId: string) => (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain') || draggingPlatformId;
    if (sourceId) {
      applyDraggedPlatformOrder(sourceId, platformId);
    }
    setDraggingPlatformId(null);
    setDropTargetPlatformId(null);
  };

  const handleDragEnd = () => {
    setDraggingPlatformId(null);
    setDropTargetPlatformId(null);
  };

  return (
    <>
      <SettingSection title={'ISkill 安装方式'}>
        <div className='space-y-3 p-4'>
          <p className='text-muted-foreground text-xs'>
            {'选择从 PromptHub 库向 AI 工具平台安装 ISkill 的方式。'}
          </p>
          <Segmented
            block
            value={settings.skillInstallMethod}
            onChange={(v) => settings.setSkillInstallMethod(v as 'symlink' | 'copy')}
            options={[
              {
                value: 'symlink',
                label: (
                  <div className='px-1 py-1 text-left'>
                    <div className='text-sm font-semibold'>{'软链接'}</div>
                    <p className='text-muted-foreground mt-1 text-[11px] font-normal leading-snug'>
                      {'在平台目录创建软链接指向 PromptHub 的 Skills 目录，同步更新更高效'}
                    </p>
                  </div>
                ),
              },
              {
                value: 'copy',
                label: (
                  <div className='px-1 py-1 text-left'>
                    <div className='text-sm font-semibold'>{'复制文件'}</div>
                    <p className='text-muted-foreground mt-1 text-[11px] font-normal leading-snug'>
                      {'直接将 SKILL.md 复制到平台目录，与平台目录独立'}
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </SettingSection>

      <SettingSection title={'平台显示顺序'}>
        <div className='space-y-3 p-4'>
          <div className='flex items-center justify-between gap-3'>
            <p className='text-muted-foreground text-xs'>
              {'控制 ISkill 详情页和批量部署面板中的平台展示顺序。'}
            </p>
            <Button
              size='small'
              icon={<RotateCcwIcon className='h-3.5 w-3.5' />}
              onClick={() => settings.resetSkillPlatformOrder()}>
              {'重置顺序'}
            </Button>
          </div>
          <div
            role='list'
            aria-label={'平台显示顺序'}
            className='border-border/70 app-wallpaper-surface space-y-2 rounded-xl border p-3'>
            {orderedPlatforms.map((platform, index) => (
              <div
                key={platform.id}
                role='listitem'
                data-platform-id={platform.id}
                draggable
                onDragStart={handleDragStart(platform.id)}
                onDragOver={handleDragOver(platform.id)}
                onDrop={handleDrop(platform.id)}
                onDragEnd={handleDragEnd}
                className={`app-wallpaper-surface-strong flex cursor-grab items-center justify-between gap-3 rounded-xl border px-3 py-2 transition-colors active:cursor-grabbing ${
                  draggingPlatformId === platform.id
                    ? 'border-primary/40 opacity-60'
                    : dropTargetPlatformId === platform.id
                      ? 'border-primary/60 ring-primary/30 ring-1'
                      : 'border-border/60'
                }`}>
                <div className='flex min-w-0 items-center gap-3'>
                  <GripVerticalIcon className='text-muted-foreground h-4 w-4 shrink-0' />
                  <PlatformIcon platformId={platform.id} size={20} />
                  <div className='min-w-0'>
                    <div className='text-foreground text-sm font-medium'>{platform.name}</div>
                    <div className='text-muted-foreground text-[11px]'>
                      {settings.customPlatformRootPaths[platform.id] ||
                        getPlatformRootTemplate(platform, currentPlatformKey)}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  <Button
                    size='small'
                    type='default'
                    icon={<ArrowUpIcon className='h-3.5 w-3.5' />}
                    onClick={() => movePlatformOrder(platform.id, 'up')}
                    disabled={index === 0}
                    title={'上移'}
                  />
                  <Button
                    size='small'
                    type='default'
                    icon={<ArrowDownIcon className='h-3.5 w-3.5' />}
                    onClick={() => movePlatformOrder(platform.id, 'down')}
                    disabled={index === orderedPlatforms.length - 1}
                    title={'下移'}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SettingSection>

      <SettingSection title={'平台根目录'}>
        <div className='space-y-3 p-4'>
          <p className='text-muted-foreground text-xs'>
            {'为每个 AI 工具覆写平台根目录。PromptHub 会从这里派生 skills、全局规则等内部路径。'}
          </p>
          <div className='border-border overflow-hidden rounded-lg border'>
            {orderedPlatforms.map((platform) => {
              const overridePath = settings.customPlatformRootPaths[platform.id] || '';
              const defaultRootPath = getPlatformRootTemplate(platform, currentPlatformKey);
              const effectiveRootPath = overridePath || defaultRootPath;
              const derivedSkillsPath = joinResolvedPlatformPath(
                effectiveRootPath,
                platform.skillsRelativePath,
              );
              return (
                <div
                  key={platform.id}
                  className='border-border/70 space-y-3 border-b px-3 py-3 last:border-0'>
                  <div className='flex items-center gap-2'>
                    <PlatformIcon platformId={platform.id} size={16} />
                    <span className='text-foreground text-sm font-medium'>{platform.name}</span>
                  </div>
                  <div className='text-muted-foreground text-[11px]'>
                    {'默认路径'}:<span className='ml-1 font-mono'>{defaultRootPath}</span>
                  </div>
                  <div className='bg-muted/30 text-muted-foreground grid gap-2 rounded-lg p-3 text-[11px]'>
                    <div>
                      {'派生 ISkill 路径'}:
                      <span className='ml-1 font-mono'>{derivedSkillsPath}</span>
                    </div>
                    {platform.configFiles?.length ? (
                      <div>
                        {'派生配置文件'}:
                        <span className='ml-1 font-mono'>
                          {platform.configFiles
                            .map((configFile) =>
                              joinResolvedPlatformPath(effectiveRootPath, configFile),
                            )
                            .join(', ')}
                        </span>
                      </div>
                    ) : null}
                    <div className='text-muted-foreground/80 text-[10px]'>
                      {'Skills、Rules 以及相关配置文件都由平台根目录派生。'}
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Input
                      value={overridePath}
                      onChange={(e) =>
                        settings.setCustomPlatformRootPath(platform.id, e.target.value)
                      }
                      placeholder={'留空则使用默认根目录，例如 ~/.trae-cn'}
                      className='flex-1'
                    />
                    <Button
                      onClick={() => settings.resetCustomPlatformRootPath(platform.id)}
                      disabled={!overridePath}>
                      {'恢复默认'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SettingSection>

      <SettingSection title={'额外扫描目录'}>
        <div className='space-y-3 p-4'>
          <p className='text-muted-foreground text-xs'>
            {'添加额外的 ISkill 目录用于导入和发现。这里不会覆盖平台默认目录。'}
          </p>
          <div className='flex items-center gap-2'>
            <Input
              value={newScanPath}
              onChange={(e) => setNewScanPath(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newScanPath.trim()) {
                  settings.addCustomSkillScanPath(newScanPath.trim());
                  setNewScanPath('');
                }
              }}
              placeholder={'输入路径，如 ~/myskills'}
              className='flex-1'
            />
            <Button
              type='primary'
              icon={<PlusIcon className='h-4 w-4' />}
              onClick={() => {
                if (newScanPath.trim()) {
                  settings.addCustomSkillScanPath(newScanPath.trim());
                  setNewScanPath('');
                }
              }}>
              {'添加'}
            </Button>
          </div>
          {settings.customSkillScanPaths.length > 0 ? (
            <div className='border-border overflow-hidden rounded-lg border'>
              {settings.customSkillScanPaths.map((path, idx) => (
                <div
                  key={`${path}-${idx}`}
                  className='border-border/70 hover:bg-muted/20 flex items-center justify-between border-b px-3 py-2.5 transition-colors last:border-0'>
                  <span className='text-foreground mr-3 flex-1 truncate font-mono text-sm'>
                    {path}
                  </span>
                  <Button
                    type='text'
                    danger
                    size='small'
                    icon={<TrashIcon className='h-3.5 w-3.5' />}
                    onClick={() => settings.removeCustomSkillScanPath(path)}
                    title={'删除'}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className='text-muted-foreground/60 text-xs italic'>{'暂未添加自定义路径'}</p>
          )}
        </div>
      </SettingSection>
    </>
  );
}

export function SkillSafetySettingsSection() {
  const settings = useSettingsStore();
  const scanInstalledSkillSafety = useSkillStore((state) => state.scanInstalledSkillSafety);
  const aiModels = settings.aiModels;
  const { showToast } = useToast();
  const [isBatchScanning, setIsBatchScanning] = useState(false);

  return (
    <SettingSection title={'ISkill 安全扫描'}>
      <div className='space-y-0'>
        <p className='text-muted-foreground px-4 pb-3 pt-4 text-xs'>
          {'控制已安装 ISkill 的自动安全扫描，以及从商店安装前的预检查。'}
        </p>
        <SettingItem
          label={'自动扫描已安装 ISkill'}
          description={'打开 ISkill 详情页时自动执行安全扫描，用于检测高风险变更。'}>
          <Switch
            checked={settings.autoScanInstalledSkills}
            onChange={(checked) => settings.setAutoScanInstalledSkills(checked)}
          />
        </SettingItem>
        <SettingItem
          label={'安装前安全扫描'}
          description={
            '默认关闭。启用后，从商店添加 ISkill 前会先执行安全扫描，拦截明显危险的内容。'
          }>
          <Switch
            checked={settings.autoScanStoreSkillsBeforeInstall}
            onChange={(checked) => settings.setAutoScanStoreSkillsBeforeInstall(checked)}
          />
        </SettingItem>
        <div className='border-border/70 bg-muted/20 mx-4 mb-4 mt-2 rounded-xl border p-3'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <div className='text-sm font-semibold'>{'立即扫描全部已安装 ISkill'}</div>
              <p className='text-muted-foreground mt-1 text-xs'>
                {'手动对资料库中的全部 ISkill 执行一次安全扫描，快速定位高风险内容。'}
              </p>
            </div>
            <Button
              type='primary'
              loading={isBatchScanning}
              onClick={() => {
                const run = async () => {
                  setIsBatchScanning(true);
                  try {
                    const summary = await scanInstalledSkillSafety(
                      undefined,
                      getSafetyScanAIConfig(aiModels),
                    );
                    showToast(
                      `已检查 ${summary.total} 个 ISkill · 阻止 ${summary.blocked} 个 · 高风险 ${summary.highRisk} 个 · 警告 ${summary.warn} 个`,
                      summary.blocked > 0 || summary.highRisk > 0
                        ? 'error'
                        : summary.warn > 0
                          ? 'warning'
                          : 'success',
                    );
                  } catch (error) {
                    showToast(String(error), 'error');
                  } finally {
                    setIsBatchScanning(false);
                  }
                };
                void run();
              }}>
              {isBatchScanning ? '扫描中...' : '扫描'}
            </Button>
          </div>
        </div>
      </div>
    </SettingSection>
  );
}
