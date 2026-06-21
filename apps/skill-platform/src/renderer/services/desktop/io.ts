import { getElectronApi } from '../electron/api';

/** 选择单个目录 */
export async function pickFolder(): Promise<string | null> {
  const result = await getElectronApi()?.selectFolder?.();
  return result?.trim() ? result.trim() : null;
}

/** 选择多个目录；不支持多选时回退为单选 */
export async function pickFolders(): Promise<string[]> {
  const selectedList = await getElectronApi()?.selectFolders?.();
  if (selectedList?.length) {
    return selectedList.filter((item) => item?.trim()).map((item) => item.trim());
  }
  const single = await pickFolder();
  return single ? [single] : [];
}

/** 检查路径是否存在 */
export async function checkPathExists(folderPath: string): Promise<boolean> {
  const api = getElectronApi();
  if (!api?.pathExists) {
    return true;
  }
  return api.pathExists(folderPath);
}

/** 在系统文件管理器中打开目录（路径存在时才打开） */
export async function openFolderPath(folderPath: string): Promise<void> {
  const exists = await checkPathExists(folderPath);
  if (!exists) {
    return;
  }
  await getElectronApi()?.openPath?.(folderPath);
}

/** 在系统文件管理器中打开路径 */
export async function openPath(
  targetPath: string,
): Promise<{ success: boolean; error?: string } | undefined> {
  return getElectronApi()?.openPath?.(targetPath);
}

/** 在默认浏览器中打开外部链接 */
export async function openExternalUrl(url: string): Promise<void> {
  await getElectronApi()?.openExternal?.(url);
}

/** 发送系统通知 */
export async function showSystemNotification(title: string, body: string): Promise<boolean> {
  const result = await getElectronApi()?.showNotification?.(title, body);
  return result ?? false;
}

/** 获取用户数据目录路径 */
export async function getUserDataPath(): Promise<string> {
  return (await getElectronApi()?.getDataPath?.()) ?? '';
}

/** 获取用户数据目录状态 */
export async function getUserDataPathStatus(): Promise<{ currentPath: string } | undefined> {
  return getElectronApi()?.getDataPathStatus?.();
}
