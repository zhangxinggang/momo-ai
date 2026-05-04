export const SYSTEM_EVENT = {
  FULL_SCREEN_CHANGED: 'window:fullscreen-changed',
  APP_RELAUNCH: 'app:relaunch',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_MINIMIZE: 'window:minimize',
} as const;

export type ISystemEvent = (typeof SYSTEM_EVENT)[keyof typeof SYSTEM_EVENT];
