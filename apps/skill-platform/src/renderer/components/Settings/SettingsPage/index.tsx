import { ArrowLeftOutlined } from '@ant-design/icons';
import { isWebRuntime } from '@renderer/runtime';
import { Button, Layout, Menu, Typography } from 'antd';
import {
  BellIcon,
  BrainIcon,
  DatabaseIcon,
  PaletteIcon,
  ServerCogIcon,
  SettingsIcon,
  SparklesIcon,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { useMemo, useState } from 'react';
import { AISettingsPrototype } from '../AISettingsPrototype';
import { AppearanceSettings } from '../AppearanceSettings';
import { DataSettings } from '../DataSettings';
import { GeneralSettings } from '../GeneralSettings';
import { NotificationsSettings } from '../NotificationsSettings';
import { SkillSettings } from '../SkillSettings';
import { WebDeviceSettings } from '../WebDeviceSettings';
import { WebWorkspaceSettings } from '../WebWorkspaceSettings';

const { Sider, Content } = Layout;

interface IProps {
  onBack: () => void;
}

type SettingsMenuItem = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const DESKTOP_SETTINGS_MENU: SettingsMenuItem[] = [
  { id: 'general', label: '常规设置', icon: SettingsIcon },
  { id: 'appearance', label: '显示设置', icon: PaletteIcon },
  { id: 'data', label: '数据设置', icon: DatabaseIcon },
  { id: 'skill', label: 'Agent管理', icon: SparklesIcon },
  { id: 'ai', label: 'AI 模型', icon: BrainIcon },
  { id: 'notifications', label: '通知', icon: BellIcon },
];

const WEB_SETTINGS_MENU: SettingsMenuItem[] = [
  { id: 'web', label: '网页工作区', icon: ServerCogIcon },
  { id: 'devices', label: '设备管理', icon: SettingsIcon },
  { id: 'appearance', label: '显示设置', icon: PaletteIcon },
  { id: 'data', label: '数据设置', icon: DatabaseIcon },
  { id: 'ai', label: 'AI 模型', icon: BrainIcon },
];

export function SettingsPage({ onBack }: IProps) {
  const webRuntime = isWebRuntime();
  const settingsMenu = webRuntime ? WEB_SETTINGS_MENU : DESKTOP_SETTINGS_MENU;
  const [activeSection, setActiveSection] = useState(webRuntime ? 'web' : 'general');

  const menuItems = useMemo(
    () =>
      settingsMenu.map((item) => {
        const Icon = item.icon;
        return {
          key: item.id,
          icon: <Icon className='h-4 w-4' />,
          label: item.label,
        };
      }),
    [settingsMenu],
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'web':
        return <WebWorkspaceSettings onNavigate={setActiveSection} />;
      case 'devices':
        return <WebDeviceSettings />;
      case 'general':
        return <GeneralSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'data':
        return <DataSettings />;
      case 'skill':
        return <SkillSettings />;
      case 'ai':
        return <AISettingsPrototype />;
      case 'notifications':
        return <NotificationsSettings />;
      default:
        return null;
    }
  };

  const activeLabel = settingsMenu.find((m) => m.id === activeSection)?.label;

  return (
    <Layout className='min-h-0 flex-1 bg-transparent'>
      <Sider width={224} className='app-wallpaper-panel border-border border-r bg-transparent'>
        <div className='border-border border-b p-3'>
          <Button
            type='text'
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            className='text-muted-foreground'>
            {'返回'}
          </Button>
        </div>
        <Menu
          mode='inline'
          selectedKeys={[activeSection]}
          items={menuItems}
          onClick={({ key }) => setActiveSection(String(key))}
          className='border-0 bg-transparent'
          style={{ borderInlineEnd: 0 }}
        />
      </Sider>
      <Content className='app-wallpaper-section min-h-0 overflow-y-auto px-6 py-5'>
        <div className='mx-auto max-w-4xl'>
          <Typography.Title level={4} className='!mb-4 !mt-0'>
            {activeLabel ?? ''}
          </Typography.Title>
          <div
            key={activeSection}
            className='animate-in fade-in slide-in-from-bottom-2 duration-200'>
            {renderContent()}
          </div>
        </div>
      </Content>
    </Layout>
  );
}
