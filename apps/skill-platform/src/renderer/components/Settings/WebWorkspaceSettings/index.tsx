import { SettingSection } from '@renderer/components/Settings/setting-primitives';
import { useToast } from '@renderer/components/ui/Toast';
import { getWebContext } from '@renderer/runtime';
import { Button, Input, Space } from 'antd';
import { BrainIcon, DatabaseIcon, GlobeIcon, KeyIcon, LaptopIcon, UserIcon } from 'lucide-react';
import { useState } from 'react';

interface IProps {
  onNavigate: (section: string) => void;
}

export function WebWorkspaceSettings({ onNavigate }: IProps) {
  const { showToast } = useToast();
  const webContext = getWebContext();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword) {
      showToast('请输入当前主密码', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('新的登录密码至少需要 8 个字符', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('两次输入不一致', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(payload?.error?.message || '登录密码修改失败');
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      showToast('登录密码修改成功', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '登录密码修改失败', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const clientLabel =
    typeof navigator === 'undefined'
      ? 'Browser'
      : `${
          /edg\//i.test(navigator.userAgent)
            ? 'Microsoft Edge'
            : /chrome\//i.test(navigator.userAgent) && !/edg\//i.test(navigator.userAgent)
              ? 'Google Chrome'
              : /safari\//i.test(navigator.userAgent) && !/chrome\//i.test(navigator.userAgent)
                ? 'Safari'
                : /firefox\//i.test(navigator.userAgent)
                  ? 'Firefox'
                  : 'Browser'
        } · ${
          /mac os x/i.test(navigator.userAgent)
            ? 'macOS'
            : /windows/i.test(navigator.userAgent)
              ? 'Windows'
              : /android/i.test(navigator.userAgent)
                ? 'Android'
                : /(iphone|ipad|ios)/i.test(navigator.userAgent)
                  ? 'iOS'
                  : /linux/i.test(navigator.userAgent)
                    ? 'Linux'
                    : 'Unknown OS'
        }`;

  return (
    <div className='space-y-6'>
      <SettingSection title={'自部署网页版'}>
        <div className='divide-border/70 divide-y'>
          <div className='px-4 py-4'>
            <div className='flex items-center gap-2 text-sm font-medium'>
              <GlobeIcon className='text-primary h-4 w-4' />
              <span>{'站点地址'}</span>
            </div>
            <p className='text-muted-foreground mt-1 break-all text-sm'>{window.location.origin}</p>
            <p className='text-muted-foreground mt-3 text-xs'>
              {
                '当前是自部署 PromptHub 网页工作区，整体体验沿用桌面版，但会展示浏览器端专属能力和限制。'
              }
            </p>
          </div>

          <div className='grid gap-3 p-4 md:grid-cols-2'>
            <div className='border-border/70 bg-muted/20 rounded-2xl border px-4 py-4'>
              <div className='flex items-center gap-2 text-sm font-medium'>
                <UserIcon className='text-primary h-4 w-4' />
                <span>{'当前用户'}</span>
              </div>
              <p className='text-foreground mt-2 text-sm'>
                {webContext?.username || 'PromptHub User'}
              </p>
            </div>
            <div className='border-border/70 bg-muted/20 rounded-2xl border px-4 py-4'>
              <div className='flex items-center gap-2 text-sm font-medium'>
                <LaptopIcon className='text-primary h-4 w-4' />
                <span>{'连接客户端'}</span>
              </div>
              <p className='text-foreground mt-2 text-sm'>{clientLabel}</p>
            </div>
          </div>

          <div className='grid gap-3 p-4 md:grid-cols-3'>
            <Button
              className='border-border/70 bg-muted/20 hover:bg-muted/40 h-auto justify-between rounded-2xl border px-4 py-4 text-left'
              type='default'
              onClick={() => onNavigate('devices')}>
              <div>
                <div className='text-sm font-medium'>{'设备管理'}</div>
                <p className='text-muted-foreground mt-1 text-xs font-normal'>
                  {'当前连接到这个自部署 PromptHub 工作区的浏览器和操作系统。'}
                </p>
              </div>
              <GlobeIcon className='text-muted-foreground h-4 w-4 shrink-0' />
            </Button>
            <Button
              className='border-border/70 bg-muted/20 hover:bg-muted/40 h-auto justify-between rounded-2xl border px-4 py-4 text-left'
              type='default'
              onClick={() => onNavigate('data')}>
              <div>
                <div className='text-sm font-medium'>{'数据设置'}</div>
                <p className='text-muted-foreground mt-1 text-xs font-normal'>
                  {'ISkill 的备份与恢复请前往「数据」面板 → 全量备份 / 恢复'}
                </p>
              </div>
              <DatabaseIcon className='text-muted-foreground h-4 w-4 shrink-0' />
            </Button>
            <Button
              className='border-border/70 bg-muted/20 hover:bg-muted/40 h-auto justify-between rounded-2xl border px-4 py-4 text-left'
              type='default'
              onClick={() => onNavigate('ai')}>
              <div>
                <div className='text-sm font-medium'>{'AI 模型'}</div>
              </div>
              <BrainIcon className='text-muted-foreground h-4 w-4 shrink-0' />
            </Button>
          </div>

          <div className='px-4 py-4'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <div className='flex items-center gap-2 text-sm font-medium'>
                  <KeyIcon className='text-primary h-4 w-4' />
                  <span>{'登录密码'}</span>
                </div>
                <p className='text-muted-foreground mt-1 text-xs'>
                  {'修改登录此自托管网页工作区使用的密码。'}
                </p>
              </div>
              <Button type='default' onClick={() => setShowPasswordForm((value) => !value)}>
                {showPasswordForm ? '取消' : '修改密码'}
              </Button>
            </div>

            {showPasswordForm && (
              <Space
                direction='vertical'
                size='middle'
                className='border-border/70 bg-muted/20 mt-4 w-full rounded-2xl border p-4'>
                <Input.Password
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={'输入当前主密码'}
                />
                <Input.Password
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={'输入新的登录密码（至少 8 个字符）'}
                />
                <Input.Password
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={'确认新的登录密码'}
                />
                <Button
                  type='primary'
                  onClick={handleChangePassword}
                  loading={isChangingPassword}
                  block>
                  {isChangingPassword ? '加载中…' : '确认修改'}
                </Button>
              </Space>
            )}
          </div>
        </div>
      </SettingSection>
    </div>
  );
}
