import { useEffect, useState } from 'react';

/** Markdown 预览主题（@vavt/markdown-theme + @vavt/cm-extension） */
export const MD_PREVIEW_THEMES = [
  'cyanosis',
  'default',
  'github',
  'mk-cute',
  'smart-blue',
  'vuepress',
  'arknights',
] as const;

export type TMdPreviewThemeId = (typeof MD_PREVIEW_THEMES)[number];

export const DEFAULT_MD_PREVIEW_THEME: TMdPreviewThemeId = 'cyanosis';

/** 判断是否为合法的预览主题 id */
export function isMdPreviewThemeId(value: string): value is TMdPreviewThemeId {
  return (MD_PREVIEW_THEMES as readonly string[]).includes(value);
}

const MD_PREVIEW_THEME_LABELS: Record<TMdPreviewThemeId, string> = {
  default: '清新',
  cyanosis: '青紫',
  github: 'GitHub',
  'mk-cute': '可爱',
  'smart-blue': '智能蓝',
  vuepress: 'VuePress',
  arknights: '明日方舟',
};

/** 根据主题 id 获取展示名称 */
export function getMdPreviewThemeLabel(themeId: string): string {
  if (isMdPreviewThemeId(themeId)) {
    return MD_PREVIEW_THEME_LABELS[themeId];
  }
  return themeId;
}

/** 供下拉选项使用的主题列表 */
export function buildMdPreviewThemeOptions(): Array<{ label: string; value: TMdPreviewThemeId }> {
  return MD_PREVIEW_THEMES.map((value) => ({
    label: MD_PREVIEW_THEME_LABELS[value],
    value,
  }));
}

/** 跟随 document 根节点 class 同步 Markdown 编辑器亮暗主题 */
export function useMarkdownEditorTheme(): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setTheme(root.classList.contains('dark') ? 'dark' : 'light');
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

/** 预览主题 state，默认 default */
export function useMdPreviewTheme(initialTheme: TMdPreviewThemeId = DEFAULT_MD_PREVIEW_THEME) {
  const [previewTheme, setPreviewTheme] = useState<TMdPreviewThemeId>(initialTheme);
  return [previewTheme, setPreviewTheme] as const;
}
