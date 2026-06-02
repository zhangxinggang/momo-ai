import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { contextBridge, ipcRenderer } from 'electron';
import {
  aiApi,
  aichatApi,
  claudeCodeApi,
  folderApi,
  ioApi,
  kbApi,
  noteApi,
  onlineConfApi,
  promptApi,
  scraperApi,
  settingsApi,
  skillApi,
  systemApi,
  versionApi,
  workflowAgentApi,
  workflowApi,
  workflowBusinessApi,
  workflowFolderApi,
  workspaceApi,
} from './api';

const listenerMap = new Map<(...args: any[]) => void, (...args: any[]) => void>();

const api = {
  // Window controls
  // 窗口控制 (Windows)
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  prompt: promptApi,

  version: versionApi,

  folder: folderApi,

  skill: skillApi,
  note: noteApi,
  kb: kbApi,
  settings: settingsApi,
  system: systemApi,
  io: ioApi,
  ai: aiApi,
  aichat: aichatApi,
  claudeCode: claudeCodeApi,
  workflow: workflowApi,
  workflowAgent: workflowAgentApi,
  workflowBusiness: workflowBusinessApi,
  workflowFolder: workflowFolderApi,
  workspace: workspaceApi,
  scraper: scraperApi,
  onlineConf: onlineConfApi,

  // Listen to main process events (with whitelist)
  // 监听主进程事件（使用白名单）
  on: (channel: string, callback: (...args: any[]) => void) => {
    // Whitelist of allowed channels to listen
    // 允许监听的通道白名单
    const ALLOWED_LISTEN_CHANNELS = [
      'window:close-action',
      'window:showCloseDialog',
      'window:fullscreen-changed',
      'window:visibility-changed',
    ];

    if (!ALLOWED_LISTEN_CHANNELS.includes(channel)) {
      console.warn(`Blocked listening to unauthorized channel: ${channel}`);
      return;
    }
    const wrapper = (_event: any, ...args: any[]) => callback(...args);
    listenerMap.set(callback, wrapper);
    ipcRenderer.on(channel, wrapper);
  },

  // Remove listener
  // 移除监听
  off: (channel: string, callback: (...args: any[]) => void) => {
    const wrapper = listenerMap.get(callback);
    if (wrapper) {
      ipcRenderer.removeListener(channel, wrapper);
      listenerMap.delete(callback);
    }
  },
};

contextBridge.exposeInMainWorld('api', api);

// Expose window control API
// 暴露窗口控制 API
contextBridge.exposeInMainWorld('electron', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  toggleVisibility: () => ipcRenderer.send('window:toggleVisibility'),
  // Fullscreen control
  // 全屏控制
  enterFullscreen: () => ipcRenderer.send('window:enterFullscreen'),
  exitFullscreen: () => ipcRenderer.send('window:exitFullscreen'),
  toggleFullscreen: () => ipcRenderer.send('window:toggleFullscreen'),
  isFullscreen: () => ipcRenderer.invoke('window:isFullscreen'),
  isVisible: () => ipcRenderer.invoke('window:isVisible'),
  setAutoLaunch: (enabled: boolean, minimizeOnLaunch?: boolean) =>
    ipcRenderer.send('app:setAutoLaunch', enabled, minimizeOnLaunch),
  relaunchApp: () => ipcRenderer.invoke(IPC_CHANNELS.APP_RELAUNCH),
  setDebugMode: (enabled: boolean) => ipcRenderer.send('app:setDebugMode', enabled),
  toggleDevTools: () => ipcRenderer.send('window:toggleDevTools'),
  setMinimizeToTray: (enabled: boolean) => ipcRenderer.send('app:setMinimizeToTray', enabled),
  setCloseAction: (action: 'ask' | 'minimize' | 'exit') =>
    ipcRenderer.send('app:setCloseAction', action),
  // Close dialog callbacks
  // 关闭窗口对话框回调
  onShowCloseDialog: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on('window:showCloseDialog', listener);
    // Return unsubscribe function to avoid leaking listeners on remount/unmount
    // 返回取消订阅函数，避免组件卸载/重挂载导致监听泄漏
    return () => {
      ipcRenderer.removeListener('window:showCloseDialog', listener);
    };
  },
  sendCloseDialogResult: (action: 'minimize' | 'exit', remember: boolean) => {
    ipcRenderer.send('window:closeDialogResult', { action, remember });
  },
  sendCloseDialogCancel: () => {
    ipcRenderer.send('window:closeDialogCancel');
  },
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  selectFolders: () => ipcRenderer.invoke('dialog:selectFolders') as Promise<string[]>,
  pathExists: (targetPath: string) =>
    ipcRenderer.invoke('fs:pathExists', targetPath) as Promise<boolean>,
  openPath: (path: string) => ipcRenderer.invoke('shell:openPath', path),
  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke('notification:show', { title, body }),
  // Data directory
  // 数据目录
  getDataPath: () => ipcRenderer.invoke('data:getPath'),
  getDataPathStatus: () => ipcRenderer.invoke('data:getStatus'),
  // Images
  // 图片
  selectImage: () => ipcRenderer.invoke('dialog:selectImage'),
  saveImage: (paths: string[]) => ipcRenderer.invoke('image:save', paths),
  saveImageBuffer: (buffer: ArrayBuffer) =>
    ipcRenderer.invoke('image:save-buffer', Buffer.from(buffer)),
  downloadImage: (url: string) => ipcRenderer.invoke('image:download', url),
  openImage: (fileName: string) => ipcRenderer.invoke('image:open', fileName),
  // Save base64 image with auto-generated filename
  // 保存 base64 图片并自动生成文件名
  saveBase64Image: async (base64: string): Promise<string | null> => {
    const fileName = `ai-generated-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    const result = await ipcRenderer.invoke('image:saveBase64', fileName, base64);
    return result ? fileName : null;
  },
  // Image sync
  // 图片同步相关
  listImages: () => ipcRenderer.invoke('image:list'),
  getImageSize: (fileName: string) => ipcRenderer.invoke('image:getSize', fileName),
  readImageBase64: (fileName: string) => ipcRenderer.invoke('image:readBase64', fileName),
  saveImageBase64: (fileName: string, base64: string) =>
    ipcRenderer.invoke('image:saveBase64', fileName, base64),
  imageExists: (fileName: string) => ipcRenderer.invoke('image:exists', fileName),
  clearImages: () => ipcRenderer.invoke('image:clear'),
  // Videos
  // 视频
  selectVideo: () => ipcRenderer.invoke('dialog:selectVideo'),
  saveVideo: (paths: string[]) => ipcRenderer.invoke('video:save', paths),
  openVideo: (fileName: string) => ipcRenderer.invoke('video:open', fileName),
  listVideos: () => ipcRenderer.invoke('video:list'),
  getVideoSize: (fileName: string) => ipcRenderer.invoke('video:getSize', fileName),
  readVideoBase64: (fileName: string) => ipcRenderer.invoke('video:readBase64', fileName),
  saveVideoBase64: (fileName: string, base64: string) =>
    ipcRenderer.invoke('video:saveBase64', fileName, base64),
  videoExists: (fileName: string) => ipcRenderer.invoke('video:exists', fileName),
  getVideoPath: (fileName: string) => ipcRenderer.invoke('video:getPath', fileName),
  clearVideos: () => ipcRenderer.invoke('video:clear'),
});

// Type declarations
// 类型声明
export type TApi = typeof api;

declare global {
  interface Window {
    api: TApi;
    electron?: {
      /** E2E / 自动化测试注入标记（可选） */
      e2e?: boolean;
      minimize?: () => void;
      maximize?: () => void;
      close?: () => void;
      toggleVisibility?: () => void;
      // Fullscreen control
      // 全屏控制
      enterFullscreen?: () => void;
      exitFullscreen?: () => void;
      isFullscreen?: () => Promise<boolean>;
      isVisible?: () => Promise<boolean>;
      toggleFullscreen?: () => void;
      setAutoLaunch?: (enabled: boolean, minimizeOnLaunch?: boolean) => void;
      relaunchApp?: () => Promise<{ success: boolean }>;
      setDebugMode?: (enabled: boolean) => void;
      toggleDevTools?: () => void;
      setMinimizeToTray?: (enabled: boolean) => void;
      setCloseAction?: (action: 'ask' | 'minimize' | 'exit') => void;
      onShowCloseDialog?: (callback: () => void) => void | (() => void);
      sendCloseDialogResult?: (action: 'minimize' | 'exit', remember: boolean) => void;
      sendCloseDialogCancel?: () => void;
      selectFolder?: () => Promise<string | null>;
      selectFolders?: () => Promise<string[]>;
      pathExists?: (targetPath: string) => Promise<boolean>;
      openPath?: (path: string) => Promise<{ success: boolean; error?: string }>;
      openExternal?: (url: string) => Promise<{ success: boolean; error?: string }>;
      showNotification?: (title: string, body: string) => Promise<boolean>;
      // Data directory
      // 数据目录
      getDataPath?: () => Promise<string>;
      getDataPathStatus?: () => Promise<{
        currentPath: string;
      }>;
      selectImage?: () => Promise<string[]>;
      saveImage?: (paths: string[]) => Promise<string[]>;
      saveBase64Image?: (base64: string) => Promise<string | null>;
      saveImageBuffer?: (buffer: ArrayBuffer) => Promise<string | null>;
      downloadImage?: (url: string) => Promise<string | null>;
      openImage?: (fileName: string) => Promise<boolean>;
      // Image sync
      // 图片同步相关
      listImages?: () => Promise<string[]>;
      getImageSize?: (fileName: string) => Promise<number | null>;
      readImageBase64?: (fileName: string) => Promise<string | null>;
      saveImageBase64?: (fileName: string, base64: string) => Promise<boolean>;
      imageExists?: (fileName: string) => Promise<boolean>;
      clearImages?: () => Promise<boolean>;
      // Videos
      // 视频
      selectVideo?: () => Promise<string[]>;
      saveVideo?: (paths: string[]) => Promise<string[]>;
      openVideo?: (fileName: string) => Promise<boolean>;
      listVideos?: () => Promise<string[]>;
      getVideoSize?: (fileName: string) => Promise<number | null>;
      readVideoBase64?: (fileName: string) => Promise<string | null>;
      saveVideoBase64?: (fileName: string, base64: string) => Promise<boolean>;
      videoExists?: (fileName: string) => Promise<boolean>;
      getVideoPath?: (fileName: string) => Promise<string>;
      clearVideos?: () => Promise<boolean>;
    };
  }
}
