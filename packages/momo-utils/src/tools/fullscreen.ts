/** 浏览器全屏 API 抽象 */
export interface IScreenfullLike {
  isEnabled: boolean;
  isFullscreen: boolean;
  request(element?: Element): Promise<void>;
  exit(): Promise<void>;
  toggle(element?: Element): Promise<void>;
  on(event: 'change', handler: () => void): void;
  off(event: 'change', handler: () => void): void;
}

/** 动态加载 screenfull 模块 */
export async function importScreenfull(): Promise<IScreenfullLike | null> {
  try {
    const mod = await import('screenfull');
    const instance = mod.default as IScreenfullLike;
    return instance?.isEnabled ? instance : null;
  } catch {
    return null;
  }
}

export interface INativeFullscreenBridge {
  enter(): void;
  exit(): void;
}

type TNativeFullscreenApi = {
  enterFullscreen?: () => void;
  exitFullscreen?: () => void;
};

/** Electron 等原生窗口全屏桥接 */
export function createNativeFullscreenBridge(
  resolver: () => TNativeFullscreenApi | undefined | null = () => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    return (window as Window & { electron?: TNativeFullscreenApi }).electron;
  },
): INativeFullscreenBridge {
  return {
    enter() {
      resolver()?.enterFullscreen?.();
    },
    exit() {
      resolver()?.exitFullscreen?.();
    },
  };
}
