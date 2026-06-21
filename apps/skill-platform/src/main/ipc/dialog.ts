import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { getMainWindow } from '@momo/electron';
import { dialog, ipcMain } from 'electron';

/** 注册文件夹选择对话框 IPC */
export function registerDialogIPC(): void {
  ipcMain.handle(IPC_CHANNELS.DIALOG_SELECT_FOLDER, async () => {
    const result = await dialog.showOpenDialog(getMainWindow()!, {
      properties: ['openDirectory'],
      title: '选择数据目录',
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  ipcMain.handle(IPC_CHANNELS.DIALOG_SELECT_FOLDERS, async () => {
    const result = await dialog.showOpenDialog(getMainWindow()!, {
      properties: ['openDirectory', 'multiSelections'],
      title: '选择工作区目录',
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths;
    }
    return [];
  });
}
