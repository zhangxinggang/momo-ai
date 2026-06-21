/** 获取 preload 暴露的 Electron 桌面能力 API */
export function getElectronApi(): Window['electron'] | undefined {
  return typeof window !== 'undefined' ? window.electron : undefined;
}

export function isElectronApiAvailable(): boolean {
  return !!getElectronApi();
}
