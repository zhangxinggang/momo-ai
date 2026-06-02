import type { ISkill } from '@/types/modules';
import { PlatformIcon } from '@renderer/components/ui/PlatformIcon';
import { useToast } from '@renderer/components/ui/Toast';
import { useSkillPlatform } from '@renderer/hooks/useSkillPlatform';
import { getErrorMessage } from '@renderer/services/skill/detail-utils';
import { useSettingsStore } from '@renderer/store';
import { Button, Modal } from 'antd';
import { CheckIcon, CuboidIcon, DownloadIcon } from 'lucide-react';
import { useState } from 'react';

interface IProps {
  skill: ISkill;
  onClose: () => void;
}

/**
 * Quick Install Modal for Skills
 * 技能快速安装弹窗
 */
export function SkillQuickInstall({ skill, onClose }: IProps) {
  const skillInstallMethod = useSettingsStore((state) => state.skillInstallMethod);
  const { showToast } = useToast();
  const [isClosingSoon, setIsClosingSoon] = useState(false);
  const {
    availablePlatforms,
    batchInstall,
    installProgress,
    installStatus,
    isBatchInstalling,
    selectedPlatforms,
    selectAllPlatforms,
    togglePlatformSelection,
    uninstalledPlatforms,
  } = useSkillPlatform(skill, skillInstallMethod);

  const handleInstall = async () => {
    if (selectedPlatforms.size === 0 || isClosingSoon) return;

    try {
      const result = await batchInstall();
      if (result.successCount > 0) {
        showToast(`操作成功 ${result.successCount}/${result.totalCount}`, 'success');
        setIsClosingSoon(true);
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error('Install failed:', error);
      showToast(`更新失败: ${getErrorMessage(error)}`, 'error');
    }
  };

  // All platforms installed
  const allInstalled = availablePlatforms.length > 0 && uninstalledPlatforms.length === 0;

  return (
    <Modal
      open
      zIndex={1050}
      onCancel={onClose}
      title={
        <div className='flex items-center gap-3'>
          <div className='bg-primary/10 text-primary rounded-xl p-2'>
            <CuboidIcon className='h-5 w-5' />
          </div>
          <div className='min-w-0'>
            <div className='text-foreground font-bold'>{'快速安装'}</div>
            <p className='text-muted-foreground max-w-[220px] truncate text-xs'>{skill.name}</p>
          </div>
        </div>
      }
      width={512}
      footer={
        !allInstalled && availablePlatforms.length > 0 ? (
          <Button
            type='primary'
            block
            size='large'
            disabled={selectedPlatforms.size === 0 || isBatchInstalling}
            loading={isBatchInstalling}
            icon={isBatchInstalling ? undefined : <DownloadIcon className='h-4 w-4' />}
            onClick={() => void handleInstall()}>
            {isBatchInstalling
              ? installProgress
                ? `${installProgress.current}/${installProgress.total}`
                : '安装中...'
              : `安装选中项${selectedPlatforms.size > 0 ? ` (${selectedPlatforms.size})` : ''}`}
          </Button>
        ) : null
      }
      styles={{
        body: { maxHeight: 'min(70vh, 560px)', overflowY: 'auto' },
        mask: { backdropFilter: 'blur(4px)' },
      }}
      destroyOnClose={false}>
      <div className='scrollbar-hide space-y-4'>
        {availablePlatforms.length === 0 ? (
          <div className='text-muted-foreground py-8 text-center'>
            <p className='text-sm'>{'未检测到可用平台'}</p>
          </div>
        ) : allInstalled ? (
          <div className='py-8 text-center'>
            <CheckIcon className='mx-auto mb-3 h-12 w-12 text-green-500' />
            <p className='text-foreground font-medium'>{'已安装到所有平台'}</p>
            <p className='text-muted-foreground mt-1 text-xs'>{'此技能已安装到所有检测到的平台'}</p>
          </div>
        ) : (
          <>
            <div className='flex items-center justify-between'>
              <p className='text-muted-foreground text-sm'>{'选择要安装的平台'}</p>
              <Button
                type='link'
                size='small'
                onClick={selectAllPlatforms}
                className='text-primary h-auto p-0 text-xs'
                disabled={isBatchInstalling}>
                {'skill.selectAll'}
              </Button>
            </div>

            <div className='grid grid-cols-2 gap-2'>
              {availablePlatforms.map((platform) => {
                const isInstalled = installStatus[platform.id];
                const isSelected = selectedPlatforms.has(platform.id);

                return (
                  <div
                    key={platform.id}
                    onClick={() => {
                      if (!isInstalled && !isBatchInstalling) {
                        togglePlatformSelection(platform.id);
                      }
                    }}
                    className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
                      isInstalled
                        ? 'cursor-default border-green-500/20 bg-green-500/5'
                        : isSelected
                          ? 'bg-primary/10 border-primary cursor-pointer'
                          : 'bg-accent/30 border-border hover:bg-accent/50 cursor-pointer'
                    } ${isBatchInstalling && !isInstalled ? 'cursor-wait opacity-60' : ''}`}>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center'>
                        <PlatformIcon platformId={platform.id} size={26} />
                      </div>
                      <span className='text-sm font-medium'>{platform.name}</span>
                    </div>
                    {isInstalled ? (
                      <div className='flex items-center gap-1 text-green-500'>
                        <CheckIcon className='h-4 w-4' />
                        <span className='text-xs'>{'已安装'}</span>
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
          </>
        )}
      </div>
    </Modal>
  );
}
