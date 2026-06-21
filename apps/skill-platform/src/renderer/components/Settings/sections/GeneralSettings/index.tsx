import { SettingItem, SettingSection } from '@renderer/components/Settings/SettingPrimitives';
import { useAppName } from '@renderer/hooks/useAppName';
import { useSettingsStore } from '@renderer/store';
import { Select, Switch } from 'antd';

export function GeneralSettings() {
  const appName = useAppName();
  const settings = useSettingsStore();

  return (
    <div className='space-y-6'>
      <SettingSection title={'启动设置'}>
        <SettingItem label={'开机自启动'} description={`系统启动时自动运行 ${appName}`}>
          <Switch checked={settings.launchAtStartup} onChange={settings.setLaunchAtStartup} />
        </SettingItem>
        <SettingItem label={'启动时最小化'} description={'启动后最小化到系统托盘'}>
          <Switch checked={settings.minimizeOnLaunch} onChange={settings.setMinimizeOnLaunch} />
        </SettingItem>
        {navigator.platform.toLowerCase().includes('win') && (
          <SettingItem label={'关闭窗口行为'} description={'点击关闭按钮时的行为'}>
            <Select
              value={settings.closeAction}
              onChange={(value) => settings.setCloseAction(value as 'ask' | 'minimize' | 'exit')}
              options={[
                { value: 'ask', label: '每次询问' },
                { value: 'minimize', label: '最小化到托盘' },
                { value: 'exit', label: '退出应用' },
              ]}
              className='w-40'
            />
          </SettingItem>
        )}
      </SettingSection>
    </div>
  );
}
