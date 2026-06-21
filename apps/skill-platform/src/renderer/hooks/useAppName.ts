import { fetchAppName } from '@renderer/services/system';
import { useEffect, useState } from 'react';

/** 渲染进程获取 appConf.appName */
export function useAppName(): string {
  const [appName, setAppName] = useState('');

  useEffect(() => {
    void fetchAppName().then(setAppName);
  }, []);

  return appName;
}

export { fetchAppName };
