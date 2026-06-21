import { getElectronApi } from '../electron/api';

export async function selectImages(): Promise<string[] | undefined> {
  return getElectronApi()?.selectImage?.();
}

export async function saveImages(paths: string[]): Promise<string[] | undefined> {
  return getElectronApi()?.saveImage?.(paths);
}

export async function downloadImage(url: string): Promise<string | null | undefined> {
  return getElectronApi()?.downloadImage?.(url);
}

export async function readImageBase64(fileName: string): Promise<string | null | undefined> {
  return getElectronApi()?.readImageBase64?.(fileName);
}

export async function saveImageBase64(
  fileName: string,
  base64: string,
): Promise<boolean | undefined> {
  return getElectronApi()?.saveImageBase64?.(fileName, base64);
}

export async function saveBase64Image(base64: string): Promise<string | null | undefined> {
  return getElectronApi()?.saveBase64Image?.(base64);
}

export async function clearImages(): Promise<boolean | undefined> {
  return getElectronApi()?.clearImages?.();
}

export async function clearVideos(): Promise<boolean | undefined> {
  return getElectronApi()?.clearVideos?.();
}
