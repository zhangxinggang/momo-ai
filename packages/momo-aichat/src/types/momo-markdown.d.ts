declare module '@momo/markdown' {
  import type { CSSProperties, FC } from 'react';

  export interface IMdPreviewProps {
    id?: string;
    value?: string;
    theme?: 'light' | 'dark';
    previewTheme?: string;
    codeTheme?: string;
    language?: string;
    className?: string;
    style?: CSSProperties;
    showCodeRowNumber?: boolean;
  }

  export const MdPreview: FC<IMdPreviewProps>;
}
