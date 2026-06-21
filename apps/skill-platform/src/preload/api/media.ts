import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { ipcRenderer } from 'electron';

/** 本地图片与视频媒体 IPC API */
export const mediaApi = {
  selectImage: () => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SELECT_IMAGE),
  saveImage: (paths: string[]) => ipcRenderer.invoke(IPC_CHANNELS.IMAGE_SAVE, paths),
  saveImageBuffer: (buffer: ArrayBuffer) =>
    ipcRenderer.invoke(IPC_CHANNELS.IMAGE_SAVE_BUFFER, Buffer.from(buffer)),
  downloadImage: (url: string) => ipcRenderer.invoke(IPC_CHANNELS.IMAGE_DOWNLOAD, url),
  openImage: (fileName: string) => ipcRenderer.invoke(IPC_CHANNELS.IMAGE_OPEN, fileName),
  saveBase64Image: async (base64: string): Promise<string | null> => {
    const fileName = `ai-generated-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    const result = await ipcRenderer.invoke(IPC_CHANNELS.IMAGE_SAVE_BASE64, fileName, base64);
    return result ? fileName : null;
  },
  listImages: () => ipcRenderer.invoke(IPC_CHANNELS.IMAGE_LIST),
  getImageSize: (fileName: string) => ipcRenderer.invoke(IPC_CHANNELS.IMAGE_GET_SIZE, fileName),
  readImageBase64: (fileName: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.IMAGE_READ_BASE64, fileName),
  saveImageBase64: (fileName: string, base64: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.IMAGE_SAVE_BASE64, fileName, base64),
  imageExists: (fileName: string) => ipcRenderer.invoke(IPC_CHANNELS.IMAGE_EXISTS, fileName),
  clearImages: () => ipcRenderer.invoke(IPC_CHANNELS.IMAGE_CLEAR),
  selectVideo: () => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SELECT_VIDEO),
  saveVideo: (paths: string[]) => ipcRenderer.invoke(IPC_CHANNELS.VIDEO_SAVE, paths),
  openVideo: (fileName: string) => ipcRenderer.invoke(IPC_CHANNELS.VIDEO_OPEN, fileName),
  listVideos: () => ipcRenderer.invoke(IPC_CHANNELS.VIDEO_LIST),
  getVideoSize: (fileName: string) => ipcRenderer.invoke(IPC_CHANNELS.VIDEO_GET_SIZE, fileName),
  readVideoBase64: (fileName: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.VIDEO_READ_BASE64, fileName),
  saveVideoBase64: (fileName: string, base64: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.VIDEO_SAVE_BASE64, fileName, base64),
  videoExists: (fileName: string) => ipcRenderer.invoke(IPC_CHANNELS.VIDEO_EXISTS, fileName),
  getVideoPath: (fileName: string) => ipcRenderer.invoke(IPC_CHANNELS.VIDEO_GET_PATH, fileName),
  clearVideos: () => ipcRenderer.invoke(IPC_CHANNELS.VIDEO_CLEAR),
};
