import { compareVersions } from '@/utils/version';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useOnlineConfStore } from '@renderer/store/online-conf';
import { Button, Layout, Menu, Typography } from 'antd';
import {
  BellIcon,
  BrainIcon,
  DatabaseIcon,
  InfoIcon,
  PaletteIcon,
  SettingsIcon,
  SparklesIcon,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { useMemo, useState } from 'react';

import badgeStyles from '../SettingBadge/index.module.less';
import { AboutSettings } from '../sections/AboutSettings';
import { AiSettings } from '../sections/AiSettings';
import { AppearanceSettings } from '../sections/AppearanceSettings';
import { DataSettings } from '../sections/DataSettings';
import { GeneralSettings } from '../sections/GeneralSettings';
import { NotificationsSettings } from '../sections/NotificationsSettings';
import { SkillSettings } from '../sections/SkillSettings';
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
  { id: 'about', label: '关于', icon: InfoIcon },
];

export function SettingsPage({ onBack }: IProps) {
  const settingsMenu = DESKTOP_SETTINGS_MENU;
  const [activeSection, setActiveSection] = useState('general');
  const hasNewVersion = useOnlineConfStore((state) => {
    const remoteVersion = state.config?.update?.version?.trim();
    if (!remoteVersion) {
      return false;
    }
    return compareVersions(remoteVersion, state.localVersion) > 0;
  });

  const menuItems = useMemo(
    () =>
      settingsMenu.map((item) => {
        const Icon = item.icon;
        const labelNode: ReactNode =
          item.id === 'about' && hasNewVersion ? (
            <span className={badgeStyles['settings-menu-badge']}>
              {item.label}
              <span className={badgeStyles['settings-menu-badge-dot']} />
            </span>
          ) : (
            item.label
          );
        return {
          key: item.id,
          icon: <Icon className='h-4 w-4' />,
          label: labelNode,
        };
      }),
    [settingsMenu, hasNewVersion],
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'data':
        return <DataSettings />;
      case 'skill':
        return <SkillSettings />;
      case 'ai':
        return <AiSettings />;
      case 'notifications':
        return <NotificationsSettings />;
      case 'about':
        return <AboutSettings />;
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
