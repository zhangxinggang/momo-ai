import type { BrowserWindow } from 'electron';
import { Menu, Tray, app, nativeImage } from 'electron';
import { getMainWindow } from '../../main-window';
import { getSystemLogo } from '../../utils';
import { isMac, isWin } from '../../utils/env';

let tray: Tray | null = null;
const systemLogo = getSystemLogo();

/** 创建托盘时的可选配置（可通过 configureTrayDefaults 设置应用级默认值） */
export interface ICreateTrayOptions {
  /** 托盘悬停提示，默认取 app.getName() */
  toolTip?: string;
  /** 用户在托盘菜单选择「退出」时、在 app.quit 之前调用（例如同步 isQuitting） */
  onBeforeAppQuit?: () => void;
}

let defaultCreateTrayOptions: ICreateTrayOptions = {};

/**
 * 配置 createTray 的默认参数（无参调用 createTray 时合并），便于宿主应用注入资源路径等
 */
export function configureTrayDefaults(options: ICreateTrayOptions): void {
  defaultCreateTrayOptions = { ...defaultCreateTrayOptions, ...options };
}

/** 主窗口关闭时是否最小化到托盘的判定依赖 */
export interface IAttachWindowCloseTrayBehaviorOptions {
  getIsQuitting: () => boolean;
  getCloseAction: () => 'ask' | 'minimize' | 'exit';
  getPendingCloseAction: () => boolean;
  setPendingCloseAction: (value: boolean) => void;
  getMinimizeToTray: () => boolean;
  /** Windows 下 closeAction 为 ask 且尚未在处理中时，通知渲染进程展示关闭对话框 */
  notifyShowCloseDialog?: (win: BrowserWindow) => void;
}
/**
 * macOS 下无宿主路径时使用静态目录中的 png 兜底
 */
function createMacTrayIconFallback(): Electron.NativeImage {
  const icon = nativeImage.createFromPath(systemLogo);
  if (!icon.isEmpty()) {
    icon.setTemplateImage(true);
    return icon.resize({ width: 18, height: 18 });
  }
  return icon;
}

/**
 * 创建系统托盘（重复调用会直接返回，不重复创建）
 */
export function createTray(options?: ICreateTrayOptions): void {
  if (tray) return;
  const merged: ICreateTrayOptions = { ...defaultCreateTrayOptions, ...options };
  const toolTip = merged.toolTip ?? app.getName();
  const onBeforeAppQuit = merged.onBeforeAppQuit;
  let icon: Electron.NativeImage;
  if (isMac) {
    icon = createMacTrayIconFallback();
  } else {
    icon = nativeImage.createFromPath(systemLogo);
    if (!icon.isEmpty()) {
      icon = icon.resize({ width: 18, height: 18 });
    }
  }

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        getMainWindow()?.show();
        getMainWindow()?.focus();
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        onBeforeAppQuit?.();
        app.quit();
      },
    },
  ]);

  tray.setToolTip(toolTip);
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    const w = getMainWindow();
    if (w?.isVisible()) {
      w.focus();
    } else {
      w?.show();
      w?.focus();
    }
  });
}

/**
 * 销毁托盘图标
 */
export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

/**
 * 注册主窗口 close 事件：按平台与设置决定最小化到托盘或真正关闭
 */
export function attachWindowCloseTrayBehavior(
  win: BrowserWindow,
  opts: IAttachWindowCloseTrayBehaviorOptions,
): void {
  win.on('close', (event) => {
    if (opts.getIsQuitting()) return;

    if (isWin) {
      const closeAction = opts.getCloseAction();
      if (closeAction === 'ask' && !opts.getPendingCloseAction()) {
        event.preventDefault();
        opts.setPendingCloseAction(true);
        opts.notifyShowCloseDialog?.(win);
        return;
      }
      if (closeAction === 'minimize') {
        event.preventDefault();
        win.hide();
        return;
      }
      return;
    }

    if (opts.getMinimizeToTray()) {
      event.preventDefault();
      win.hide();
    }
  });
}
