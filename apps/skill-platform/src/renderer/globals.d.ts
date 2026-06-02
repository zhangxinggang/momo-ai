import type { TApi } from '@preload';

declare module '@momo/markdown-styles';

declare global {
  interface Window {
    api: TApi;
  }
}

export {};
