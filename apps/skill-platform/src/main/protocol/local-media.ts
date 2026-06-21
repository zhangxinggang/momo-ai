import { resolvePathUnderBase } from '@/utils/path-under-base';
import { protocol, session } from 'electron';
import { getImagesDir, getVideosDir } from '../runtime-paths';

const LOCAL_MEDIA_SCHEMES = ['local-image', 'local-video'] as const;

/** 注册 local-image / local-video 特权协议（须在 app ready 之前调用） */
export function registerLocalMediaPrivilegedSchemes(): void {
  protocol.registerSchemesAsPrivileged(
    LOCAL_MEDIA_SCHEMES.map((scheme) => ({
      scheme,
      privileges: {
        secure: true,
        standard: true,
        supportFetchAPI: true,
        stream: true,
      },
    })),
  );
}

function parseProtocolRequestUrl(requestUrl: string, scheme: string): string {
  let url = requestUrl.replace(`${scheme}://`, '');
  url = url.replace(/^\/+/, '').replace(/\/+$/, '');
  return decodeURIComponent(url);
}

function registerLocalMediaFileProtocol(scheme: string, getBaseDir: () => string): void {
  session.defaultSession.protocol.registerFileProtocol(scheme, (request, callback) => {
    try {
      const decodedUrl = parseProtocolRequestUrl(request.url, scheme);
      const baseDir = getBaseDir();
      const filePath = resolvePathUnderBase(baseDir, decodedUrl);

      if (!filePath) {
        console.warn(`Blocked ${scheme} path traversal:`, decodedUrl);
        callback({ path: '' });
        return;
      }

      callback({ path: filePath });
    } catch (error) {
      console.error(`Failed to register ${scheme} protocol`, error);
      callback({ path: '' });
    }
  });
}

/** 注册 local-image / local-video 文件协议处理器（须在 app ready 之后调用） */
export function registerLocalMediaProtocols(): void {
  registerLocalMediaFileProtocol('local-image', getImagesDir);
  registerLocalMediaFileProtocol('local-video', getVideosDir);
}
