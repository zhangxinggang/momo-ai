import { MdPreview } from '@momo/markdown';
import '@momo/markdown-styles';
import { useSettingsStore } from '@renderer/store';
import { useId, useMemo } from 'react';
import styles from './index.module.less';

export interface IProps {
  value: string;
  className?: string;
  previewTheme?: string;
  id?: string;
}

/** 与 renderer 侧 React 类型版本不完全一致 */
const MdPreviewView = MdPreview as any;

/**
 * 基于 @momo/markdown 的只读 Markdown 预览
 */
export function MarkdownPreview({ value, className, previewTheme, id }: IProps) {
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const generatedId = useId().replace(/:/g, '');
  const editorId = id ?? `markdown-preview-${generatedId}`;

  const theme = isDarkMode ? 'dark' : 'light';
  const resolvedPreviewTheme = useMemo(
    () => previewTheme ?? (isDarkMode ? 'cyanosis' : 'default'),
    [isDarkMode, previewTheme],
  );

  if (!value.trim()) {
    return null;
  }

  return (
    <div className={[styles.preview, className].filter(Boolean).join(' ')}>
      <MdPreviewView
        id={editorId}
        value={value}
        theme={theme}
        previewTheme={resolvedPreviewTheme}
        style={{ background: 'transparent' }}
      />
    </div>
  );
}
