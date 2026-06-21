import { compareVersions } from '@/utils/version';
import { MarkdownRenderer } from '@momo/aichat';
import { SettingItem, SettingSection } from '@renderer/components/Settings/SettingPrimitives';
import { useAiChatViewTheme } from '@renderer/hooks/useAiChatViewTheme';
import { useAppName } from '@renderer/hooks/useAppName';
import { openExternalUrl } from '@renderer/services/desktop';
import { useOnlineConfStore } from '@renderer/store/online-conf';
import { Button, Modal } from 'antd';
import { useState } from 'react';

/** 关于 - 版本信息与更新 */
export function AboutSettings() {
  const appName = useAppName();
  const chatTheme = useAiChatViewTheme();
  const localVersion = useOnlineConfStore((state) => state.localVersion);
  const config = useOnlineConfStore((state) => state.config);
  const hasNewVersion = useOnlineConfStore((state) => {
    const remoteVersion = state.config?.update?.version?.trim();
    if (!remoteVersion) {
      return false;
    }
    return compareVersions(remoteVersion, state.localVersion) > 0;
  });
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  const remoteUpdate = config?.update;
  const remoteVersion = remoteUpdate?.version?.trim();

  const handleDownload = () => {
    const downloadUrl = remoteUpdate?.download?.trim();
    if (!downloadUrl) {
      return;
    }
    void openExternalUrl(downloadUrl);
  };

  return (
    <>
      <div className='space-y-6'>
        <SettingSection title={'版本信息'}>
          <SettingItem label={'当前版本'} description={`本机已安装的 ${appName} 版本号`}>
            <div className='flex items-center gap-2 text-sm'>
              <span>{localVersion}</span>
              {hasNewVersion && remoteVersion ? (
                <button
                  type='button'
                  className='text-primary hover:underline'
                  onClick={() => setUpdateModalOpen(true)}>
                  {'发现新版本'}
                </button>
              ) : null}
            </div>
          </SettingItem>
          {remoteVersion ? (
            <SettingItem label={'最新版本'} description={'在线配置中的最新发布版本'}>
              <span className='text-sm'>{remoteVersion}</span>
            </SettingItem>
          ) : null}
        </SettingSection>
      </div>

      <Modal
        centered
        open={updateModalOpen}
        title={'版本更新'}
        onCancel={() => setUpdateModalOpen(false)}
        footer={[
          <Button key='close' onClick={() => setUpdateModalOpen(false)}>
            {'关闭'}
          </Button>,
          remoteUpdate?.download ? (
            <Button key='download' type='primary' onClick={handleDownload}>
              {'下载更新'}
            </Button>
          ) : null,
        ]}>
        <div className='space-y-3'>
          <div className='text-sm'>
            <span className='text-muted-foreground'>{'新版本：'}</span>
            <span className='font-medium'>{remoteVersion}</span>
          </div>
          {remoteUpdate?.description?.trim() ? (
            <div className='border-border rounded-lg border p-3'>
              <MarkdownRenderer
                instanceKey='about-update-description'
                content={remoteUpdate.description}
                isStreaming={false}
                theme={chatTheme.theme}
                previewTheme={chatTheme.previewTheme}
                codeTheme={chatTheme.codeTheme}
              />
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  );
}
