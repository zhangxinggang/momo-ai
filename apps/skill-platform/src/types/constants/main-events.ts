/** preload 允许监听的 main → renderer 事件通道 */
export const MAIN_IPC_EVENT_CHANNELS = [
  'window:close-action',
  'window:showCloseDialog',
  'window:fullscreen-changed',
  'window:visibility-changed',
] as const;

export type TMainIpcEventChannel = (typeof MAIN_IPC_EVENT_CHANNELS)[number];
