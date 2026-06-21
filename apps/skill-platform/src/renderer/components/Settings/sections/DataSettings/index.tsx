import { SettingItem, SettingSection } from '@renderer/components/Settings/SettingPrimitives';
import { useToast } from '@renderer/components/ui/Toast';
import { clearDatabase } from '@renderer/services/database';
import { getUserDataPath, getUserDataPathStatus, openPath } from '@renderer/services/desktop';
import { Button, Modal } from 'antd';
import { ExternalLinkIcon, FolderIcon, TrashIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * 数据管理：数据目录（只读）、打开文件夹、清除数据
 */
export function DataSettings() {
  const { showToast } = useToast();
  const [currentDataPath, setCurrentDataPath] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      const status = await getUserDataPathStatus();
      const resolvedPath = status?.currentPath ?? (await getUserDataPath());
      if (mounted && resolvedPath) {
        setCurrentDataPath(resolvedPath);
      }
    })().catch((error) => {
      if (mounted) {
        console.error('Failed to load data path:', error);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

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
        <SettingSection title={'数据目录'}>
          <div className='space-y-3 p-4'>
            <div className='flex items-center gap-3'>
              <FolderIcon className='text-muted-foreground h-5 w-5' />
              <div className='flex-1'>
                <p className='text-sm font-medium'>{'数据目录'}</p>
                <Button
                  type='link'
                  onClick={() => currentDataPath && void openPath(currentDataPath)}
                  className='text-primary mt-0.5 flex h-auto cursor-pointer items-center gap-1 p-0 font-mono text-xs hover:underline'
                  title={'打开文件夹'}>
                  {currentDataPath || '加载中…'}
                  <ExternalLinkIcon className='h-3 w-3' />
                </Button>
              </div>
            </div>
          </div>
        </SettingSection>

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

        <SettingSection title={'本地数据路径'}>
          <div className='text-muted-foreground space-y-1 p-4 text-sm'>
            {currentDataPath ? (
              ['aim.db', 'data/', 'config/', 'skills/', 'logs/'].map((sub) => (
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
