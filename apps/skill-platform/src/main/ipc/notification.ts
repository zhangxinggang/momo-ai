import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { getSystemLogo } from '@momo/electron';
import { Notification, ipcMain } from 'electron';

const systemLogo = getSystemLogo();

/** 注册系统通知 IPC */
export function registerNotificationIPC(): void {
  ipcMain.handle(
    IPC_CHANNELS.NOTIFICATION_SHOW,
    async (_event, options: { title: string; body: string }) => {
      if (!options || typeof options !== 'object') {
        throw new Error('notification:show requires a non-null options object');
      }
      if (typeof options.title !== 'string' || typeof options.body !== 'string') {
        throw new Error('notification:show requires title and body to be strings');
      }
      if (Notification.isSupported()) {
        const notification = new Notification({
          title: options.title,
          body: options.body,
          icon: systemLogo,
        });
        notification.show();
        return true;
      }
      return false;
    },
  );
}
