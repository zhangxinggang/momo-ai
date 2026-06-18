import { useEffect, useState } from 'react';

let cachedAppName: string | null = null;
let fetchPromise: Promise<string> | null = null;

/** 从主进程 appConf 读取应用名称 */
export async function fetchAppName(): Promise<string> {
  if (cachedAppName) {
    return cachedAppName;
  }
  fetchPromise ??= window.api.system.getAppName().then((name) => {
    cachedAppName = name;
    return name;
  });
  return fetchPromise;
}

/** 渲染进程获取 appConf.appName */
export function useAppName(): string {
  const [appName, setAppName] = useState(cachedAppName ?? '');

  useEffect(() => {
    if (cachedAppName) {
      setAppName(cachedAppName);
      return;
    }
    void fetchAppName().then(setAppName);
  }, []);

  return appName;
}
