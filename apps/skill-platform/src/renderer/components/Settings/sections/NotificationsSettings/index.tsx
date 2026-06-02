import { SettingItem, SettingSection } from '@renderer/components/Settings/SettingPrimitives';
import { useSettingsStore } from '@renderer/store';
import { Switch } from 'antd';

export function NotificationsSettings() {
  const settings = useSettingsStore();

  return (
    <div className='space-y-6'>
      <SettingSection title={'通知'}>
        <SettingItem label={'启用通知'} description={'允许应用发送桌面通知'}>
          <Switch
            checked={settings.enableNotifications}
            onChange={settings.setEnableNotifications}
          />
        </SettingItem>
        <SettingItem label={'复制成功提示'} description={'复制 IPrompt 后显示提示'}>
          <Switch
            checked={settings.showCopyNotification}
            onChange={settings.setShowCopyNotification}
          />
        </SettingItem>
        <SettingItem label={'保存成功提示'} description={'保存更改后显示提示'}>
          <Switch
            checked={settings.showSaveNotification}
            onChange={settings.setShowSaveNotification}
          />
        </SettingItem>
      </SettingSection>
    </div>
  );
}
