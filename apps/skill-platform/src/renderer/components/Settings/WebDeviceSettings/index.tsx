import type { IDeviceManagementSettings } from '@/types/modules';
import { SettingItem, SettingSection } from '@renderer/components/Settings/setting-primitives';
import { getWebContext, logoutWebSession } from '@renderer/runtime';
import {
  DEFAULT_WEB_DEVICE_SETTINGS,
  readWebDeviceSettings,
  writeWebDeviceSettings,
} from '@renderer/services/web/device-settings-storage';
import { Button, Select, Spin, Switch } from 'antd';
import {
  GlobeIcon,
  LaptopIcon,
  LogOutIcon,
  RefreshCwIcon,
  StoreIcon,
  UserIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

function detectClientBrowser(userAgent: string): string {
  if (/edg\//i.test(userAgent)) return 'Microsoft Edge';
  if (/chrome\//i.test(userAgent) && !/edg\//i.test(userAgent)) {
    return 'Google Chrome';
  }
  if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) {
    return 'Safari';
  }
  if (/firefox\//i.test(userAgent)) return 'Firefox';
  if (/opr\//i.test(userAgent) || /opera/i.test(userAgent)) return 'Opera';
  return 'Browser';
}

function detectClientPlatform(userAgent: string): string {
  if (/mac os x/i.test(userAgent)) return 'macOS';
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/android/i.test(userAgent)) return 'Android';
  if (/(iphone|ipad|ios)/i.test(userAgent)) return 'iOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  return 'Unknown OS';
}

const DEFAULT_DEVICE_SETTINGS = DEFAULT_WEB_DEVICE_SETTINGS;

interface IConnectedDeviceRecord {
  id: string;
  type: 'desktop' | 'browser';
  name: string;
  platform: string;
  appVersion?: string;
  clientVersion?: string;
  lastSeenAt: string;
}

function getOrCreateBrowserDeviceId(): string {
  const storageKey = 'prompthub-web-device-id';
  const existing = window.localStorage.getItem(storageKey);
  if (existing) {
    return existing;
  }

  const nextId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `browser-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(storageKey, nextId);
  return nextId;
}

function formatSeenAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export function WebDeviceSettings() {
  const webContext = getWebContext();
  const [deviceSettings, setDeviceSettings] =
    useState<IDeviceManagementSettings>(DEFAULT_DEVICE_SETTINGS);
  const [devices, setDevices] = useState<IConnectedDeviceRecord[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  const clientLabel = useMemo(() => {
    if (typeof navigator === 'undefined') {
      return 'Browser';
    }

    return `${detectClientBrowser(navigator.userAgent)} · ${detectClientPlatform(
      navigator.userAgent,
    )}`;
  }, []);

  const currentBrowserDeviceId = useMemo(
    () => (typeof window === 'undefined' ? '' : getOrCreateBrowserDeviceId()),
    [],
  );

  const loadDevices = useCallback(async () => {
    setLoadingDevices(true);
    try {
      const userAgent = navigator.userAgent;
      await fetch('/api/devices/heartbeat', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentBrowserDeviceId,
          type: 'browser',
          name: detectClientBrowser(userAgent),
          platform: detectClientPlatform(userAgent),
          clientVersion: 'self-hosted-web',
          userAgent,
        }),
      });

      const response = await fetch('/api/devices', {
        credentials: 'same-origin',
      });
      if (!response.ok) {
        throw new Error('Failed to load devices');
      }
      const payload = (await response.json()) as {
        data?: IConnectedDeviceRecord[];
      };
      setDevices(Array.isArray(payload.data) ? payload.data : []);
    } catch (error) {
      console.warn('Failed to load connected devices:', error);
    } finally {
      setLoadingDevices(false);
    }
  }, [currentBrowserDeviceId]);

  useEffect(() => {
    setDeviceSettings(readWebDeviceSettings());
  }, []);

  useEffect(() => {
    void loadDevices();
  }, [loadDevices]);

  const updateDeviceSettings = async (nextPartial: Partial<IDeviceManagementSettings>) => {
    const nextValue = {
      ...deviceSettings,
      ...nextPartial,
    };
    setDeviceSettings(nextValue);
    writeWebDeviceSettings(nextValue);
  };

  return (
    <div className='space-y-6'>
      <SettingSection title={'设备管理'}>
        <SettingItem
          label={'当前用户'}
          description={'当前登录态和访问权限由浏览器会话管理，而不是桌面端运行时。'}>
          <div className='bg-muted flex items-center gap-2 rounded-full px-3 py-1.5 text-sm'>
            <UserIcon className='text-muted-foreground h-4 w-4' />
            <span>{webContext?.username || 'PromptHub User'}</span>
          </div>
        </SettingItem>
        <SettingItem
          label={'连接客户端'}
          description={'当前连接到这个自部署 PromptHub 工作区的浏览器和操作系统。'}>
          <div className='bg-muted text-foreground flex items-center gap-2 rounded-full px-3 py-1.5 text-sm'>
            <LaptopIcon className='text-muted-foreground h-4 w-4' />
            <span>{clientLabel}</span>
          </div>
        </SettingItem>
      </SettingSection>

      <SettingSection title={'已连接设备'}>
        <div className='space-y-3 p-4'>
          <div className='flex items-center justify-between'>
            <p className='text-muted-foreground text-sm'>
              {'最近连接到这个自部署 PromptHub 工作区的桌面端和浏览器客户端。'}
            </p>
            <Button
              icon={<RefreshCwIcon className='h-4 w-4' />}
              onClick={() => void loadDevices()}
              loading={loadingDevices}>
              {'刷新'}
            </Button>
          </div>

          {devices.length === 0 ? (
            <div className='border-border text-muted-foreground flex min-h-[88px] items-center justify-center rounded-xl border border-dashed px-4 py-6 text-sm'>
              {loadingDevices ? <Spin size='small' /> : '暂无已上报的连接设备。'}
            </div>
          ) : (
            <div className='space-y-3'>
              {devices.map((device) => {
                const isCurrentBrowser =
                  device.type === 'browser' && device.id === currentBrowserDeviceId;
                return (
                  <div
                    key={device.id}
                    className='border-border bg-card rounded-xl border px-4 py-4'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='min-w-0'>
                        <div className='flex items-center gap-2'>
                          {device.type === 'desktop' ? (
                            <LaptopIcon className='text-primary h-4 w-4' />
                          ) : (
                            <GlobeIcon className='text-primary h-4 w-4' />
                          )}
                          <span className='text-foreground truncate text-sm font-medium'>
                            {device.name}
                          </span>
                          {isCurrentBrowser ? (
                            <span className='bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium'>
                              {'当前设备'}
                            </span>
                          ) : null}
                        </div>
                        <div className='text-muted-foreground mt-2 grid gap-1 text-xs'>
                          <div>
                            {'设备类型'}:{' '}
                            {device.type === 'desktop' ? '桌面客户端' : '浏览器客户端'}
                          </div>
                          <div>
                            {'平台'}: {device.platform}
                          </div>
                          <div>
                            {'版本号'}: {device.appVersion || device.clientVersion || 'unknown'}
                          </div>
                          <div>
                            {'最后在线'}: {formatSeenAt(device.lastSeenAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SettingSection>

      <SettingSection title={'客户端同步'}>
        <SettingItem
          label={'客户端同步节奏'}
          description={'设置桌面端和浏览器客户端与这个自部署 PromptHub 工作区的同步频率。'}>
          <div className='w-44'>
            <Select
              className='w-full'
              value={deviceSettings.syncCadence || 'manual'}
              onChange={(value) =>
                void updateDeviceSettings({
                  syncCadence: value as IDeviceManagementSettings['syncCadence'],
                })
              }
              options={[
                { value: 'manual', label: '仅手动同步' },
                { value: '15m', label: '每 15 分钟' },
                { value: '1h', label: '每小时' },
                { value: '1d', label: '每天' },
              ]}
            />
          </div>
        </SettingItem>
      </SettingSection>

      <SettingSection title={'商店同步'}>
        <SettingItem
          label={'自动同步 Skill 商店'}
          description={
            '自动刷新官方和已连接的 ISkill 源，让这个工作区和桌面端看到相同的可安装 ISkill。'
          }>
          <Switch
            checked={deviceSettings.storeAutoSync}
            onChange={(checked) =>
              void updateDeviceSettings({
                storeAutoSync: checked,
              })
            }
          />
        </SettingItem>
        <SettingItem
          label={'商店刷新节奏'}
          description={'设置自部署网页版刷新已连接 ISkill 源的频率。'}>
          <div className='w-44'>
            <Select
              className='w-full'
              value={deviceSettings.storeSyncCadence || '1d'}
              onChange={(value) =>
                void updateDeviceSettings({
                  storeSyncCadence: value as IDeviceManagementSettings['storeSyncCadence'],
                })
              }
              options={[
                { value: 'manual', label: '仅手动同步' },
                { value: '1h', label: '每小时' },
                { value: '1d', label: '每天' },
              ]}
            />
          </div>
        </SettingItem>
        <div className='text-muted-foreground px-4 py-4 text-sm'>
          <div className='text-foreground flex items-center gap-2 font-medium'>
            <StoreIcon className='text-primary h-4 w-4' />
            <span>{'商店同步'}</span>
          </div>
          <p className='mt-2'>
            {
              'Skill 商店源需要在后台保持最新，这样桌面客户端和当前网页版看到的可安装 Skill 才能一致。'
            }
          </p>
        </div>
      </SettingSection>

      <SettingSection title={'浏览器会话'}>
        <SettingItem
          label={'退出登录'}
          description={'当前登录态和访问权限由浏览器会话管理，而不是桌面端运行时。'}>
          <Button icon={<LogOutIcon className='h-4 w-4' />} onClick={() => void logoutWebSession()}>
            {'退出登录'}
          </Button>
        </SettingItem>
      </SettingSection>
    </div>
  );
}
