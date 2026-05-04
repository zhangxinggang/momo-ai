import type { TApi } from '@preload';
import type {
  IDatabaseBackup,
  IImportSkippedStats,
} from '@renderer/services/database/backup-format';
import type React from 'react';

declare module '@momo/markdown-styles';

declare global {
  interface PromptHubWebContext {
    mode: 'self-hosted';
    origin: string;
    username?: string;
    registrationAllowed?: boolean;
    initialized?: boolean;
  }

  interface Window {
    api: TApi;
    __PROMPTHUB_WEB__?: boolean;
    __PROMPTHUB_WEB_CONTEXT__?: PromptHubWebContext;
    __PROMPTHUB_WEB_LOGOUT__?: (() => Promise<void>) | (() => void);
    __PROMPTHUB_E2E_BACKUP__?: {
      exportDatabase: (options?: {
        skipVideoContent?: boolean;
        limitMedia?: boolean;
      }) => Promise<IDatabaseBackup>;
      restoreFromBackup: (backup: IDatabaseBackup) => Promise<IImportSkippedStats>;
    };
  }
}

export {};

declare namespace JSX {
  interface IntrinsicElements {
    webview: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        allowpopups?: string | boolean;
        partition?: string;
      },
      HTMLElement
    >;
  }
}
