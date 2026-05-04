import { SettingSection } from '@renderer/components/Settings/setting-primitives';
import { BackgroundImageBackdrop } from '@renderer/components/ui/BackgroundImageBackdrop';
import { isWebRuntime } from '@renderer/runtime';
import { useSettingsStore } from '@renderer/store';
import type { EThemeMode } from '@renderer/types/settings';
import {
  FONT_SIZES,
  getRenderedBackgroundImageBlur,
  getRenderedBackgroundImageOpacity,
  MORANDI_THEMES,
} from '@renderer/utils/settings/appearance';
import { Button, Input, Segmented, Slider, Space } from 'antd';
import {
  CheckIcon,
  ImageIcon,
  MonitorIcon,
  MoonIcon,
  SlidersHorizontalIcon,
  SunIcon,
  TrashIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

interface IProps {
  backgroundImageFileName?: string;
  renderedBackgroundOpacity: number;
  renderedBackgroundBlur: number;
  imageAlt: string;
  emptyLabel: string;
}

function BackgroundPreviewStage({
  backgroundImageFileName,
  renderedBackgroundOpacity,
  renderedBackgroundBlur,
  imageAlt,
  emptyLabel,
}: IProps) {
  if (!backgroundImageFileName) {
    return (
      <div className='text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2'>
        <ImageIcon className='h-8 w-8 opacity-50' />
        <span className='text-sm'>{emptyLabel}</span>
      </div>
    );
  }

  return (
    <div className='background-preview-stage bg-background text-foreground app-background-mode-image pointer-events-none relative h-full w-full select-none overflow-hidden rounded-xl'>
      <BackgroundImageBackdrop
        src={backgroundImageFileName}
        alt={imageAlt}
        opacity={renderedBackgroundOpacity}
        blur={renderedBackgroundBlur}
      />

      <div className='background-preview-shell app-wallpaper-shell relative z-10 flex h-full w-full flex-col overflow-hidden'>
        <div className='border-border app-wallpaper-toolbar flex h-9 shrink-0 items-center gap-2 border-b px-2.5'>
          <div className='app-wallpaper-surface h-5 w-5 shrink-0 rounded-md' />
          <div className='flex-1'>
            <div className='border-border app-wallpaper-search h-5 rounded-md border' />
          </div>
          <div className='app-wallpaper-surface h-5 w-5 shrink-0 rounded-md' />
        </div>

        <div className='flex flex-1 overflow-hidden'>
          <div className='app-left-rail-glass border-border app-wallpaper-panel-strong flex w-20 shrink-0 flex-col gap-2 border-r p-2'>
            <div className='app-wallpaper-surface-strong h-5 rounded-md' />
            <div className='app-wallpaper-surface h-4 rounded-md' />
            <div className='app-wallpaper-surface h-4 rounded-md' />
            <div className='sidebar-tag-section app-wallpaper-panel mt-auto h-8 rounded-lg' />
          </div>

          <div className='app-wallpaper-section flex flex-1 overflow-hidden'>
            <div className='prompt-list-pane border-border flex w-28 shrink-0 flex-col border-r'>
              <div className='prompt-list-header border-border app-wallpaper-toolbar flex h-8 shrink-0 items-center justify-between gap-2 border-b px-2'>
                <div className='bg-foreground/15 h-2 w-8 rounded' />
                <div className='prompt-list-view-toggle border-border app-wallpaper-surface h-5 w-10 rounded-md border' />
              </div>

              <div className='flex flex-1 flex-col gap-2 p-2'>
                <div className='prompt-list-card border-border app-wallpaper-surface-strong h-10 rounded-lg border' />
                <div className='prompt-list-card border-border app-wallpaper-surface h-10 rounded-lg border' />
                <div className='prompt-list-card border-border app-wallpaper-surface h-10 rounded-lg border' />
              </div>
            </div>

            <div className='flex flex-1 flex-col gap-2 p-2'>
              <div className='app-wallpaper-surface h-8 w-24 rounded-lg' />
              <div className='border-border app-wallpaper-panel h-12 rounded-xl border' />
              <div className='border-border app-wallpaper-panel flex-1 rounded-xl border' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppearanceSettings() {
  const settings = useSettingsStore();
  const webRuntime = isWebRuntime();
  const [isPickingBackground, setIsPickingBackground] = useState(false);

  const hasBackgroundImage = Boolean(settings.backgroundImageFileName);
  const backgroundOpacityPercent = useMemo(
    () => Math.round(settings.backgroundImageOpacity * 100),
    [settings.backgroundImageOpacity],
  );
  const renderedBackgroundOpacity = useMemo(
    () => getRenderedBackgroundImageOpacity(settings.backgroundImageOpacity),
    [settings.backgroundImageOpacity],
  );
  const renderedBackgroundBlur = useMemo(
    () => getRenderedBackgroundImageBlur(settings.backgroundImageBlur),
    [settings.backgroundImageBlur],
  );

  const backgroundVisibilityPercent = useMemo(
    () => Math.round(renderedBackgroundOpacity * 100),
    [renderedBackgroundOpacity],
  );

  const handleSelectBackgroundImage = async () => {
    if (webRuntime || isPickingBackground) {
      return;
    }

    setIsPickingBackground(true);
    try {
      const selectedPaths = await window.electron?.selectImage?.();
      const nextImagePath = Array.isArray(selectedPaths) ? selectedPaths[0] : undefined;
      if (!nextImagePath) {
        return;
      }

      const savedFileNames = await window.electron?.saveImage?.([nextImagePath]);
      const fileName = Array.isArray(savedFileNames) ? savedFileNames[0] : undefined;
      if (!fileName) {
        return;
      }

      settings.applyBackgroundImageSelection(fileName);
    } finally {
      setIsPickingBackground(false);
    }
  };

  const handleClearBackgroundImage = () => {
    settings.setBackgroundImageFileName(undefined);
  };

  const themeModes: {
    id: EThemeMode;
    label: string;
    icon: ReactNode;
  }[] = [
    {
      id: 'light',
      label: '浅色',
      icon: <SunIcon className='h-4 w-4' />,
    },
    {
      id: 'dark',
      label: '深色',
      icon: <MoonIcon className='h-4 w-4' />,
    },
    {
      id: 'system',
      label: '跟随系统',
      icon: <MonitorIcon className='h-4 w-4' />,
    },
  ];

  return (
    <div className='space-y-6'>
      <SettingSection title={'主题模式'}>
        <div className='p-4'>
          <Segmented
            block
            value={settings.themeMode}
            onChange={(v) => settings.setThemeMode(v as EThemeMode)}
            options={themeModes.map((mode) => ({
              value: mode.id,
              label: (
                <span className='inline-flex items-center justify-center gap-2'>
                  {mode.icon}
                  {mode.label}
                </span>
              ),
            }))}
          />
        </div>
      </SettingSection>

      <SettingSection title={'主题颜色'}>
        <div className='p-4'>
          {/* 选中颜色名称（不挤占色带空间） */}
          <div className='mb-3 flex items-center justify-end'>
            <div className='text-muted-foreground text-xs tabular-nums'>
              {settings.themeColor === 'custom'
                ? `${'自定义'} ${settings.customThemeHex}`
                : settings.themeColor === 'royal-blue'
                  ? '宝蓝'
                  : settings.themeColor === 'blue'
                    ? '雾蓝'
                    : settings.themeColor === 'purple'
                      ? '烟紫'
                      : settings.themeColor === 'green'
                        ? '豆绿'
                        : settings.themeColor === 'orange'
                          ? '杏橘'
                          : settings.themeColor === 'teal'
                            ? '青黛'
                            : settings.themeColor}
            </div>
          </div>
          {/* 单行色带（均匀分布 + ring 安全边距，避免裁切） */}
          <div className='flex w-full items-center overflow-y-visible px-2 py-2'>
            {MORANDI_THEMES.map((theme) => {
              const colorLabel =
                theme.id === 'royal-blue'
                  ? '宝蓝'
                  : theme.id === 'blue'
                    ? '雾蓝'
                    : theme.id === 'purple'
                      ? '烟紫'
                      : theme.id === 'green'
                        ? '豆绿'
                        : theme.id === 'orange'
                          ? '杏橘'
                          : theme.id === 'teal'
                            ? '青黛'
                            : theme.id;
              const selected = settings.themeColor === theme.id;
              return (
                <div key={theme.id} className='flex min-w-0 flex-1 justify-center'>
                  <Button
                    type='text'
                    onClick={() => settings.setThemeColor(theme.id)}
                    className={`relative h-10 w-10 flex-shrink-0 rounded-full transition-all duration-200 ${
                      selected
                        ? 'ring-primary ring-offset-background ring-2 ring-offset-2'
                        : 'hover:opacity-90'
                    }`}
                    title={colorLabel}
                    aria-label={colorLabel}
                    style={{
                      backgroundColor: `hsl(${theme.hue}, ${theme.saturation}%, 55%)`,
                    }}>
                    {selected && (
                      <span className='absolute inset-0 grid place-items-center'>
                        <CheckIcon className='h-4 w-4 text-white drop-shadow' />
                      </span>
                    )}
                  </Button>
                </div>
              );
            })}
            {/* 自定义颜色入口 */}
            <div className='flex min-w-0 flex-1 justify-center'>
              <Button
                type='text'
                onClick={() => settings.setThemeColor('custom')}
                className={`relative h-10 w-10 flex-shrink-0 rounded-full transition-all duration-200 ${
                  settings.themeColor === 'custom'
                    ? 'ring-primary ring-offset-background ring-2 ring-offset-2'
                    : 'hover:opacity-95'
                }`}
                title={'自定义'}
                aria-label={'自定义'}
                style={{ backgroundColor: settings.customThemeHex }}>
                {settings.themeColor === 'custom' && (
                  <span className='absolute inset-0 grid place-items-center'>
                    <CheckIcon className='h-4 w-4 text-white drop-shadow' />
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* 仅在选择自定义时展开 */}
          {settings.themeColor === 'custom' && (
            <div className='app-settings-subtle animate-in fade-in slide-in-from-bottom-2 mt-4 rounded-xl p-4 duration-200'>
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <div className='text-sm font-medium'>{'自定义'}</div>
                  <div className='text-muted-foreground mt-0.5 text-xs'>
                    {'选择任意颜色，立即应用到全局主题'}
                  </div>
                </div>
                <Space align='center' wrap>
                  <input
                    type='color'
                    value={settings.customThemeHex}
                    onChange={(e) => settings.setCustomThemeHex(e.target.value)}
                    className='border-border h-9 w-10 cursor-pointer rounded-lg border bg-transparent p-1'
                    aria-label={'自定义'}
                  />
                  <Input
                    value={settings.customThemeHex}
                    onChange={(e) => settings.setCustomThemeHex(e.target.value)}
                    className='w-28 font-mono'
                    placeholder='#3b82f6'
                  />
                </Space>
              </div>

              {/* 紧凑预览 */}
              <div className='mt-4 flex items-center gap-2'>
                <div className='bg-primary text-primary-foreground flex h-9 flex-1 items-center justify-center rounded-lg text-sm font-medium'>
                  {'主按钮'}
                </div>
                <div className='bg-accent text-accent-foreground flex h-9 flex-1 items-center justify-center rounded-lg text-sm font-medium'>
                  {'强调'}
                </div>
                <div className='app-settings-input flex h-9 flex-1 items-center justify-center rounded-lg text-sm font-medium'>
                  {'中性'}
                </div>
              </div>
            </div>
          )}
        </div>
      </SettingSection>

      <SettingSection title={'字体大小'}>
        <div className='p-4'>
          <Segmented
            block
            value={settings.fontSize}
            onChange={(v) => settings.setFontSize(String(v))}
            options={FONT_SIZES.map((size) => {
              return {
                value: size.id,
                label: (
                  <span className='flex flex-col items-center gap-0.5 py-0.5 text-[13px]'>
                    <span>
                      {size.id === 'small'
                        ? '小'
                        : size.id === 'medium'
                          ? '中'
                          : size.id === 'large'
                            ? '大'
                            : size.id}
                    </span>
                    <span className='text-[11px] opacity-70'>{size.value}px</span>
                  </span>
                ),
              };
            })}
          />
        </div>
      </SettingSection>

      {!webRuntime ? (
        <SettingSection title={'背景图'}>
          <div className='space-y-4 p-4'>
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0'>
                <div className='text-foreground flex items-center gap-2 text-sm font-medium'>
                  <ImageIcon className='text-muted-foreground h-4 w-4' />
                  {'桌面背景'}
                </div>
                <p className='text-muted-foreground mt-1 text-xs leading-6'>
                  {
                    '选一张喜欢的本地图片，就能把它设成桌面端背景，让 PromptHub 更贴近你的工作氛围，图片会统一保存在 PromptHub 图片目录里，设置中只保留引用，整理、迁移、备份都更省心。'
                  }
                </p>
              </div>
              <Space className='shrink-0' wrap>
                <Button
                  type='primary'
                  loading={isPickingBackground}
                  onClick={() => void handleSelectBackgroundImage()}>
                  {hasBackgroundImage ? '更换图片' : '选择图片'}
                </Button>
                <Button
                  icon={<TrashIcon className='h-4 w-4' />}
                  disabled={!hasBackgroundImage}
                  onClick={handleClearBackgroundImage}>
                  {'清除'}
                </Button>
              </Space>
            </div>

            <div className='app-settings-subtle space-y-3 rounded-2xl p-3'>
              <div className='app-settings-input relative aspect-[16/9] w-full overflow-hidden rounded-xl'>
                <BackgroundPreviewStage
                  backgroundImageFileName={settings.backgroundImageFileName}
                  renderedBackgroundOpacity={renderedBackgroundOpacity}
                  renderedBackgroundBlur={renderedBackgroundBlur}
                  imageAlt={'背景图预览'}
                  emptyLabel={'暂未选择背景图'}
                />
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <div className='text-muted-foreground flex items-center justify-between gap-3 text-xs'>
                    <span className='inline-flex items-center gap-1.5'>
                      <ImageIcon className='h-3.5 w-3.5' />
                      {'背景可见度'}
                    </span>
                    <span>{backgroundOpacityPercent}%</span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={backgroundOpacityPercent}
                    onChange={(v) => settings.setBackgroundImageOpacity(Number(v) / 100)}
                    tooltip={{ formatter: (v) => (v != null ? `${v}%` : '') }}
                  />
                </div>

                <div className='space-y-2'>
                  <div className='text-muted-foreground flex items-center justify-between gap-3 text-xs'>
                    <span className='inline-flex items-center gap-1.5'>
                      <SlidersHorizontalIcon className='h-3.5 w-3.5' />
                      {'虚化强度'}
                    </span>
                    <span>{settings.backgroundImageBlur}px</span>
                  </div>
                  <Slider
                    min={0}
                    max={50}
                    step={0.5}
                    value={settings.backgroundImageBlur}
                    onChange={(v) => settings.setBackgroundImageBlur(Number(v))}
                    tooltip={{ formatter: (v) => (v != null ? `${v}px` : '') }}
                  />
                </div>
              </div>
            </div>
          </div>
        </SettingSection>
      ) : null}
    </div>
  );
}
