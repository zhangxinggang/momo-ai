import { useSettingsStore } from '@renderer/store';
import { App, ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

/** 界面固定为简体中文，antd 组件使用 zh_CN */
function pickAntdLocale() {
  return zhCN;
}

/** 与 settings.applyTheme 一致的亮暗判断，用于 antd 算法 */
function useRendererDark(): boolean {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false,
  );

  useEffect(() => {
    if (themeMode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemDark(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [themeMode]);

  if (themeMode === 'system') {
    return systemDark;
  }
  return themeMode === 'dark';
}

interface IProps {
  children: ReactNode;
}

/**
 * 全局 antd 6 配置：主题算法、主色 token、多语言 locale。
 * Global Ant Design 6 config: theme algorithm, primary color, locale.
 */
export function AntdRoot({ children }: IProps) {
  const themeHue = useSettingsStore((s) => s.themeHue);
  const themeSaturation = useSettingsStore((s) => s.themeSaturation);
  const themeColor = useSettingsStore((s) => s.themeColor);
  const customThemeHex = useSettingsStore((s) => s.customThemeHex);

  const isDark = useRendererDark();

  const locale = useMemo(() => pickAntdLocale(), []);

  const colorPrimary = useMemo(() => {
    if (themeColor === 'custom' && /^#[0-9A-Fa-f]{6}$/.test(customThemeHex)) {
      return customThemeHex;
    }
    return `hsl(${themeHue}, ${themeSaturation}%, 48%)`;
  }, [themeColor, customThemeHex, themeHue, themeSaturation]);

  const antdTheme = useMemo(
    () => ({
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary,
      },
    }),
    [isDark, colorPrimary],
  );

  return (
    <ConfigProvider locale={locale} theme={antdTheme}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
