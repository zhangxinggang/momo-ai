import { SettingSection } from '@renderer/components/Settings/SettingPrimitives';
import { getUserDataPath, getUserDataPathStatus, openPath } from '@renderer/services/desktop';
import { Button } from 'antd';
import { ExternalLinkIcon, FolderIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * 数据管理：数据目录（只读）、打开文件夹、清除数据
 */
export function DataSettings() {
  const [currentDataPath, setCurrentDataPath] = useState('');

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
    </>
  );
}
