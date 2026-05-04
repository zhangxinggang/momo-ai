declare module '@momo/markdown' {
  import type { CSSProperties, FC } from 'react';

  export const MdPreview: FC<{
    id?: string;
    value?: string;
    theme?: 'light' | 'dark';
    previewTheme?: string;
    codeTheme?: string;
    language?: string;
    className?: string;
    style?: CSSProperties;
    showCodeRowNumber?: boolean;
  }>;
}
