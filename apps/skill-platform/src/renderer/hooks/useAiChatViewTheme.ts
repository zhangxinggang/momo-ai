import { useSettingsStore } from '@renderer/store';
import { useMemo } from 'react';

/** AiChatView / MarkdownRenderer 主题：跟随应用明暗模式，预览默认明日方舟 */
export function useAiChatViewTheme() {
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  return useMemo(
    () => ({
      theme: (isDarkMode ? 'dark' : 'light') as 'light' | 'dark',
      previewTheme: 'cyanosis',
      codeTheme: 'atom',
    }),
    [isDarkMode],
  );
}
