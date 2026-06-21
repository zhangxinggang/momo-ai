import { fetchFilePreviewBaseUrl } from '@renderer/services/system';
import { useEffect, useState } from 'react';

/** 渲染进程获取 appConf.filePreviewBaseUrl */
export function useFilePreviewBaseUrl(): string | undefined {
  const [filePreviewBaseUrl, setFilePreviewBaseUrl] = useState<string | undefined>();

  useEffect(() => {
    void fetchFilePreviewBaseUrl().then((url) => {
      setFilePreviewBaseUrl(url || undefined);
    });
  }, []);

  return filePreviewBaseUrl;
}

export { fetchFilePreviewBaseUrl };
