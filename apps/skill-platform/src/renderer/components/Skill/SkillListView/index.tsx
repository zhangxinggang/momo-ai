import type { ISkillPlatform } from '@/types/constants/platforms';
import type { ESkillSafetyLevel, ISkill } from '@/types/modules';
import { PlatformIcon } from '@renderer/components/ui/PlatformIcon';
import { getRuntimeCapabilities } from '@renderer/runtime';
import { useSkillStore } from '@renderer/store';
import { Button } from 'antd';
import {
  BellDotIcon,
  CheckSquareIcon,
  CuboidIcon,
  DownloadIcon,
  MessagesSquare,
  ShieldAlertIcon,
  ShieldCheckIcon,
  ShieldIcon,
  SquareIcon,
  StarIcon,
  TrashIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SkillIcon } from '../SkillIcon';

const MAX_STAGGERED_ROWS = 12;

function getSafetyIconProps(level: ESkillSafetyLevel): {
  Icon: typeof ShieldCheckIcon;
  className: string;
  label: string;
} {
  switch (level) {
    case 'safe':
      return {
        Icon: ShieldCheckIcon,
        className: 'text-emerald-500',
        label: 'Safe',
      };
    case 'warn':
      return {
        Icon: ShieldAlertIcon,
        className: 'text-yellow-500',
        label: 'Needs review',
      };
    case 'high-risk':
      return {
        Icon: ShieldAlertIcon,
        className: 'text-orange-500',
        label: 'High risk',
      };
    case 'blocked':
      return {
        Icon: ShieldAlertIcon,
        className: 'text-destructive',
        label: 'Blocked',
      };
  }
}

function normalizePlatformStatusMap(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, boolean] => {
      const [, installed] = entry;
      return typeof installed === 'boolean';
    }),
  );
}

interface IProps {
  skills: ISkill[];
  skillsWithStoreUpdates?: Set<string>;
  onQuickInstall: (skill: ISkill) => void;
  onOpenSkillAiChat: (skillId: string) => void;
  onRequestDelete?: (skillId: string, skillName: string) => void;
  selectionMode?: boolean;
  selectedSkillIds?: Set<string>;
  onToggleSelection?: (skillId: string) => void;
}

const skillPlatformStatusCache = new Map<string, Record<string, boolean>>();

/**
 * Compact List View for Skills
 * 技能紧凑列表视图
 */
export function SkillListView({
  skills,
  skillsWithStoreUpdates = new Set<string>(),
  onQuickInstall,
  onOpenSkillAiChat,
  onRequestDelete,
  selectionMode = false,
  selectedSkillIds = new Set<string>(),
  onToggleSelection,
}: IProps) {
  const selectedSkillId = useSkillStore((state) => state.selectedSkillId);
  const selectSkill = useSkillStore((state) => state.selectSkill);
  const toggleFavorite = useSkillStore((state) => state.toggleFavorite);
  const filterType = useSkillStore((state) => state.filterType);
  const storeView = useSkillStore((state) => state.storeView);
  const runtimeCapabilities = getRuntimeCapabilities();

  // Platform status cache
  const [platformStatuses, setPlatformStatuses] = useState<Record<string, Record<string, boolean>>>(
    {},
  );
  const [supportedPlatforms, setSupportedPlatforms] = useState<ISkillPlatform[]>([]);
  const [detectedPlatforms, setDetectedPlatforms] = useState<string[]>([]);

  // Load platforms on mount
  useEffect(() => {
    if (!runtimeCapabilities.skillPlatformIntegration) {
      setSupportedPlatforms([]);
      setDetectedPlatforms([]);
      return;
    }

    const loadPlatforms = async () => {
      try {
        const platforms = await window.api.skill.getSupportedPlatforms();
        setSupportedPlatforms(platforms);
        const detected = await window.api.skill.detectPlatforms();
        setDetectedPlatforms(detected);
      } catch (e) {
        console.error('Failed to load platforms:', e);
      }
    };
    loadPlatforms();
  }, [runtimeCapabilities.skillPlatformIntegration]);

  // Load install status for all skills
  useEffect(() => {
    if (!runtimeCapabilities.skillPlatformIntegration) {
      setPlatformStatuses({});
      return;
    }

    const loadStatuses = async () => {
      const nextStatuses = Object.fromEntries(
        skills.map((skill) => [skill.id, skillPlatformStatusCache.get(skill.name) ?? {}]),
      );
      setPlatformStatuses(nextStatuses);

      const missingNames = Array.from(
        new Set(
          skills.map((skill) => skill.name).filter((name) => !skillPlatformStatusCache.has(name)),
        ),
      );

      if (missingNames.length === 0) {
        return;
      }

      try {
        const statusByName = (await window.api.skill.getMdInstallStatusBatch(
          missingNames,
        )) as Record<string, unknown>;

        for (const [name, status] of Object.entries(statusByName)) {
          skillPlatformStatusCache.set(name, normalizePlatformStatusMap(status));
        }

        setPlatformStatuses(
          Object.fromEntries(
            skills.map((skill) => [skill.id, skillPlatformStatusCache.get(skill.name) ?? {}]),
          ),
        );
      } catch (error) {
        console.error('Failed to load install status batch:', error);
      }
    };
    if (skills.length > 0) {
      void loadStatuses();
    } else {
      setPlatformStatuses({});
    }
  }, [runtimeCapabilities.skillPlatformIntegration, skills]);

  const availablePlatforms = useMemo(() => {
    return supportedPlatforms.filter((p) => detectedPlatforms.includes(p.id));
  }, [supportedPlatforms, detectedPlatforms]);

  // Get install count for a skill
  const getInstallCount = (skillId: string) => {
    const status = platformStatuses[skillId];
    if (!status) return 0;
    return Object.values(status).filter(Boolean).length;
  };

  if (skills.length === 0) {
    const isDistributionView = storeView === 'distribution';
    const webSkillLibraryMode =
      !runtimeCapabilities.skillDistribution && !runtimeCapabilities.skillStore;
    return (
      <div className='text-muted-foreground animate-in fade-in zoom-in-95 flex h-full flex-col items-center justify-center py-20 duration-500'>
        <div className='bg-accent/30 relative mb-6 rounded-full p-8'>
          <CuboidIcon className='h-20 w-20 opacity-20' />
          <div className='border-primary/10 absolute inset-0 animate-pulse rounded-full border-4' />
        </div>
        <h3 className='text-foreground mb-2 text-xl font-semibold'>
          {isDistributionView
            ? '暂无技能'
            : filterType === 'favorites'
              ? '暂无收藏技能'
              : '暂无技能'}
        </h3>
        <p className='mb-8 max-w-sm text-center text-sm opacity-70'>
          {webSkillLibraryMode
            ? '在此创建或导入你自己的技能。平台分发与技能商店仅在桌面客户端可用。'
            : isDistributionView
              ? '先导入 skill，再在这里安装、同步或卸载到 Claude、Cursor 等平台。'
              : filterType === 'favorites'
                ? '点击技能卡片上的星标添加收藏'
                : '创建、导入或从商店安装你的第一个技能'}
        </p>
      </div>
    );
  }

  return (
    <div className='h-full'>
      <div className='w-full'>
        <div className='divide-border divide-y'>
          {skills.map((skill, index) => {
            const isSelected = selectedSkillId === skill.id;
            const isChecked = selectedSkillIds.has(skill.id);
            const installCount = getInstallCount(skill.id);
            const totalPlatforms = availablePlatforms.length;
            const hasStoreUpdate = skillsWithStoreUpdates.has(skill.id);

            return (
              <div
                key={skill.id}
                onClick={() => {
                  if (selectionMode) {
                    onToggleSelection?.(skill.id);
                    return;
                  }
                  selectSkill(skill.id);
                }}
                style={{
                  animationDelay: `${Math.min(index, MAX_STAGGERED_ROWS) * 30}ms`,
                  contentVisibility: 'auto',
                  containIntrinsicSize: '84px',
                }}
                className={`animate-in fade-in slide-in-from-left-2 group flex cursor-pointer items-center gap-4 px-6 py-4 transition-all ${
                  selectionMode && isChecked
                    ? 'bg-primary/8'
                    : isSelected
                      ? 'bg-primary/5'
                      : 'hover:bg-accent/50'
                }`}>
                {selectionMode && (
                  <Button
                    type='text'
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelection?.(skill.id);
                    }}
                    className={`shrink-0 rounded-md p-1 ${
                      isChecked
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                    title={isChecked ? '已选中' : '选择'}
                    icon={
                      isChecked ? (
                        <CheckSquareIcon className='h-4 w-4' />
                      ) : (
                        <SquareIcon className='h-4 w-4' />
                      )
                    }
                  />
                )}

                {/* Icon */}
                <div className='shrink-0'>
                  <SkillIcon
                    iconUrl={skill.icon_url}
                    iconEmoji={skill.icon_emoji}
                    backgroundColor={skill.icon_background}
                    name={skill.name}
                    size='md'
                    className={isSelected ? 'ring-primary shadow-primary/20 shadow-lg ring-2' : ''}
                  />
                </div>

                {/* Info */}
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <h3
                      className={`truncate font-semibold transition-colors ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                      {skill.name}
                    </h3>
                    {hasStoreUpdate ? (
                      <span
                        className='inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-300'
                        title={'有可用更新'}>
                        <BellDotIcon className='h-3 w-3 animate-pulse' />
                        {'有可用更新'}
                      </span>
                    ) : null}
                    {/* Safety shield icon */}
                    {skill.safetyReport ? (
                      (() => {
                        const { Icon, className, label } = getSafetyIconProps(
                          skill.safetyReport.level,
                        );
                        return (
                          <span title={`风险等级: ${label}`}>
                            <Icon className={`h-3.5 w-3.5 shrink-0 ${className}`} />
                          </span>
                        );
                      })()
                    ) : (
                      <span title={'尚未进行安全扫描'}>
                        <ShieldIcon className='text-muted-foreground/30 h-3.5 w-3.5 shrink-0' />
                      </span>
                    )}
                  </div>
                  <p className='text-muted-foreground mt-0.5 truncate text-xs'>
                    {skill.description || '技能描述，帮助 AI 理解何时使用此技能'}
                  </p>
                </div>

                {/* Platform indicators */}
                {runtimeCapabilities.skillPlatformIntegration && totalPlatforms > 0 && (
                  <div className='flex shrink-0 items-center gap-1'>
                    {availablePlatforms.slice(0, 3).map((platform) => {
                      const isInstalled = platformStatuses[skill.id]?.[platform.id];
                      return (
                        <div
                          key={platform.id}
                          className='flex items-center justify-center'
                          title={`${platform.name}: ${isInstalled ? '已安装' : '未安装'}`}>
                          <PlatformIcon
                            platformId={platform.id}
                            size={16}
                            className={isInstalled ? 'opacity-100' : 'opacity-40'}
                          />
                        </div>
                      );
                    })}
                    <span className='text-primary ml-1 text-[10px] font-medium'>
                      {installCount}/{totalPlatforms}
                    </span>
                  </div>
                )}

                {/* Actions */}
                {!selectionMode && (
                  <div className='flex shrink-0 items-center gap-1'>
                    <Button
                      type='text'
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSkillAiChat(skill.id);
                      }}
                      className='text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg p-2 active:scale-90'
                      title={'AI 对话'}
                      icon={<MessagesSquare className='h-4 w-4' />}
                    />
                    {runtimeCapabilities.skillPlatformIntegration && (
                      <Button
                        type='text'
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickInstall(skill);
                        }}
                        className='text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg p-2 active:scale-90'
                        title={'快速安装'}
                        icon={<DownloadIcon className='h-4 w-4' />}
                      />
                    )}
                    <Button
                      type='text'
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(skill.id);
                      }}
                      className={`rounded-lg p-2 active:scale-90 ${
                        skill.is_favorite
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-muted-foreground hover:bg-yellow-500/10 hover:text-yellow-500'
                      }`}
                      title={skill.is_favorite ? '取消收藏' : '添加收藏'}
                      icon={
                        <StarIcon
                          className={`h-4 w-4 ${skill.is_favorite ? 'fill-current' : ''}`}
                        />
                      }
                    />
                    <Button
                      type='text'
                      danger
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onRequestDelete) {
                          onRequestDelete(skill.id, skill.name);
                        }
                      }}
                      className='text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg p-2 active:scale-90'
                      title={'删除'}
                      icon={<TrashIcon className='h-4 w-4' />}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
