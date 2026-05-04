import { SettingItem, SettingSection } from '@renderer/components/Settings/setting-primitives';
import { useToast } from '@renderer/components/ui/Toast';
import { isWebRuntime } from '@renderer/runtime';
import { clearDatabase } from '@renderer/services/database';
import { useSettingsStore } from '@renderer/store';
import { App, Button, Modal } from 'antd';
import { ExternalLinkIcon, FolderIcon, TrashIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

type DataPathChangeAction = 'migrate' | 'switch' | 'overwrite';

interface IDataPathChangePreview {
  success: boolean;
  error?: string;
  targetPath?: string;
  exists?: boolean;
  hasPromptHubData?: boolean;
  isCurrentPath?: boolean;
  markers?: Array<{ name: string }>;
  targetSummary?: {
    promptCount: number;
    folderCount: number;
    skillCount: number;
    available: boolean;
  };
}

/**
 * 数据管理：数据目录、清除数据
 */
export function DataSettings() {
  const { modal } = App.useApp();
  const { showToast } = useToast();
  const webRuntime = isWebRuntime();
  const persistedDataPath = useSettingsStore((state) => state.dataPath);
  const setDataPath = useSettingsStore((state) => state.setDataPath);
  const [currentDataPath, setCurrentDataPath] = useState('');
  const [pendingDataPath, setPendingDataPath] = useState<string | null>(null);
  const [pendingDataPathChange, setPendingDataPathChange] = useState<IDataPathChangePreview | null>(
    null,
  );
  const [dataPathActionLoading, setDataPathActionLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  const restartApp = async () => {
    if (window.electron?.relaunchApp) {
      await window.electron.relaunchApp();
      return;
    }
    window.location.reload();
  };

  const refreshDataPathStatus = async () => {
    const status = await window.electron?.getDataPathStatus?.();
    if (status?.currentPath) {
      setCurrentDataPath(status.currentPath);
      setPendingDataPath(status.needsRestart ? status.configuredPath || null : null);
      if (status.configuredPath && status.configuredPath !== persistedDataPath) {
        setDataPath(status.configuredPath);
      }
      return;
    }

    const resolvedPath = await window.electron?.getDataPath?.();
    if (!resolvedPath) {
      return;
    }
    setCurrentDataPath(resolvedPath);
    setPendingDataPath(null);
    if (resolvedPath !== persistedDataPath) {
      setDataPath(resolvedPath);
    }
  };

  useEffect(() => {
    let mounted = true;
    void refreshDataPathStatus().catch((error) => {
      if (mounted) {
        console.error('Failed to load data path status:', error);
      }
    });
    return () => {
      mounted = false;
    };
  }, [persistedDataPath, setDataPath]);

  const finishDataPathChange = async (
    result:
      | {
          success: boolean;
          newPath?: string;
          needsRestart?: boolean;
          error?: string;
        }
      | undefined,
    action: DataPathChangeAction,
    fallbackPath: string,
  ) => {
    if (!result?.success) {
      showToast(`数据迁移失败: ${result?.error || ''}`, 'error');
      return;
    }

    const resolvedPath = result.newPath || fallbackPath;
    setDataPath(resolvedPath);
    setPendingDataPathChange(null);
    await refreshDataPathStatus();

    const message =
      action === 'switch'
        ? '数据目录已切换'
        : action === 'overwrite'
          ? '数据已迁移，并已创建目标目录备份'
          : '数据目录已更改';
    const requiresRestart = result.needsRestart !== false;
    showToast(requiresRestart ? `${message} ${'请重启应用'}` : message, 'success');

    if (!requiresRestart) {
      return;
    }

    setTimeout(() => {
      modal.confirm({
        zIndex: 1100,
        title: '是否立即重启？',
        content: '数据目录已切换，需要重启应用后生效。是否现在重启？',
        okText: '立即重启',
        cancelText: '稍后',
        onOk: () => void restartApp(),
      });
    }, 1000);
  };

  const applyDataPathChange = async (targetPath: string, action: DataPathChangeAction) => {
    setDataPathActionLoading(true);
    try {
      const result = window.electron?.applyDataPathChange
        ? await window.electron.applyDataPathChange(targetPath, action)
        : await window.electron?.migrateData?.(targetPath);
      await finishDataPathChange(result, action, targetPath);
    } finally {
      setDataPathActionLoading(false);
    }
  };

  const handleChangeDataPath = async () => {
    const newPath = await window.electron?.selectFolder?.();
    if (!newPath) {
      return;
    }

    if (!window.electron?.previewDataPathChange) {
      await new Promise<void>((resolve) => {
        modal.confirm({
          zIndex: 1100,
          title: '确认迁移数据目录？',
          content: '确定要将数据迁移到新目录吗？\n\n迁移完成后需要重启应用。',
          okText: '确定',
          cancelText: '取消',
          onOk: async () => {
            await applyDataPathChange(newPath, 'migrate');
            resolve();
          },
          onCancel: () => resolve(),
        });
      });
      return;
    }

    const preview = await window.electron.previewDataPathChange(newPath);
    if (!preview?.success) {
      showToast(`数据迁移失败: ${preview?.error || ''}`, 'error');
      return;
    }

    if (preview.isCurrentPath) {
      await finishDataPathChange(
        {
          success: true,
          newPath: preview.targetPath || newPath,
          needsRestart: false,
        },
        'switch',
        newPath,
      );
      return;
    }

    if (preview.hasPromptHubData) {
      setPendingDataPathChange(preview);
      return;
    }

    await new Promise<void>((resolve) => {
      modal.confirm({
        zIndex: 1100,
        title: '确认迁移数据目录？',
        content: '确定要将数据迁移到新目录吗？\n\n迁移完成后需要重启应用。',
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          await applyDataPathChange(preview.targetPath || newPath, 'migrate');
          resolve();
        },
        onCancel: () => resolve(),
      });
    });
  };

  const handleClearData = () => {
    setShowClearConfirm(true);
  };

  const handleConfirmClear = async () => {
    setClearLoading(true);
    try {
      await clearDatabase();
      showToast('数据已清空', 'success');
      setShowClearConfirm(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Clear failed:', error);
      showToast('清空失败', 'error');
    } finally {
      setClearLoading(false);
    }
  };

  return (
    <>
      <div className='space-y-6'>
        {!webRuntime ? (
          <SettingSection title={'数据目录'}>
            <div className='space-y-3 p-4'>
              <div className='flex items-center gap-3'>
                <FolderIcon className='text-muted-foreground h-5 w-5' />
                <div className='flex-1'>
                  <p className='text-sm font-medium'>{'数据目录'}</p>
                  <Button
                    type='link'
                    onClick={() => currentDataPath && window.electron?.openPath?.(currentDataPath)}
                    className='text-primary mt-0.5 flex h-auto cursor-pointer items-center gap-1 p-0 font-mono text-xs hover:underline'
                    title={'打开文件夹'}>
                    {currentDataPath || '加载中…'}
                    <ExternalLinkIcon className='h-3 w-3' />
                  </Button>
                  {pendingDataPath && pendingDataPath !== currentDataPath ? (
                    <p className='text-muted-foreground mt-1 text-xs'>
                      {'重启后将切换到此目录：'}{' '}
                      <span className='font-mono'>{pendingDataPath}</span>
                    </p>
                  ) : null}
                </div>
                <Button
                  onClick={() => void handleChangeDataPath()}
                  disabled={dataPathActionLoading}
                  className='bg-muted hover:bg-muted/80 h-8 rounded-lg px-3 text-sm transition-colors'>
                  {dataPathActionLoading ? '加载中…' : '更改'}
                </Button>
              </div>
            </div>
          </SettingSection>
        ) : null}

        {!webRuntime ? (
          <SettingSection title={'危险操作'}>
            <SettingItem label={'清空数据'} description={'删除所有本地数据'}>
              <Button
                danger
                type='primary'
                onClick={handleClearData}
                className='bg-destructive hover:bg-destructive/90 h-9 rounded-lg px-4 text-sm font-medium text-white transition-colors'>
                {'清空数据'}
              </Button>
            </SettingItem>
          </SettingSection>
        ) : null}

        <SettingSection title={'本地数据路径'}>
          <div className='text-muted-foreground space-y-1 p-4 text-sm'>
            {currentDataPath ? (
              ['prompthub.db', 'data/', 'config/', 'skills/', 'logs/'].map((sub) => (
                <p key={sub} className='break-all font-mono text-xs'>
                  {currentDataPath.replace(/\/$/, '')}/{sub}
                </p>
              ))
            ) : (
              <p className='italic'>{'加载中…'}</p>
            )}
          </div>
        </SettingSection>
      </div>

      <Modal
        open={Boolean(pendingDataPathChange)}
        zIndex={1050}
        onCancel={() => !dataPathActionLoading && setPendingDataPathChange(null)}
        title={'目标目录已包含 PromptHub 数据'}
        footer={[
          <Button
            key='cancel'
            onClick={() => setPendingDataPathChange(null)}
            disabled={dataPathActionLoading}>
            {'取消'}
          </Button>,
          <Button
            key='switch'
            type='primary'
            disabled={dataPathActionLoading}
            onClick={() =>
              void applyDataPathChange(pendingDataPathChange?.targetPath || '', 'switch')
            }>
            {'切换到该目录'}
          </Button>,
          <Button
            key='overwrite'
            danger
            disabled={dataPathActionLoading}
            onClick={() => {
              const target = pendingDataPathChange?.targetPath;
              if (!target) return;
              modal.confirm({
                zIndex: 1200,
                title: '确认覆盖并迁移？',
                content: '确定要用当前电脑的数据覆盖该目录中的数据吗？继续前会先自动备份目标目录。',
                okText: '覆盖并迁移',
                cancelText: '取消',
                okButtonProps: { danger: true },
                onOk: () => applyDataPathChange(target, 'overwrite'),
              });
            }}>
            {'覆盖并迁移'}
          </Button>,
        ]}
        width={560}
        destroyOnClose={false}>
        {pendingDataPathChange?.targetPath ? (
          <p className='break-all font-mono text-xs'>{pendingDataPathChange.targetPath}</p>
        ) : null}
      </Modal>

      <Modal
        title={
          <span className='flex items-center gap-2 text-red-500'>
            <TrashIcon className='h-5 w-5' />
            {'危险操作'}
          </span>
        }
        open={showClearConfirm}
        onCancel={() => !clearLoading && setShowClearConfirm(false)}
        maskClosable={!clearLoading}
        destroyOnClose
        footer={[
          <Button key='cancel' disabled={clearLoading} onClick={() => setShowClearConfirm(false)}>
            {'取消'}
          </Button>,
          <Button
            key='ok'
            danger
            type='primary'
            loading={clearLoading}
            onClick={() => void handleConfirmClear()}>
            {'确认清除'}
          </Button>,
        ]}>
        <p className='text-muted-foreground text-sm'>{'删除所有本地数据'}</p>
      </Modal>
    </>
  );
}
