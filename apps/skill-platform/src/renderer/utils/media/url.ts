function isExternalMediaSrc(src: string): boolean {
  return /^(https?:|data:|blob:)/i.test(src);
}

function stripProtocol(src: string, protocol: 'local-image' | 'local-video'): string {
  const prefix = `${protocol}://`;
  return src.startsWith(prefix) ? src.slice(prefix.length) : src;
}

export function resolveLocalImageSrc(src: string): string {
  if (!src || isExternalMediaSrc(src)) {
    return src;
  }

  const fileName = stripProtocol(src, 'local-image');
  return `local-image://${encodeURIComponent(fileName)}`;
}

export function resolveLocalVideoSrc(src: string): string {
  if (!src || isExternalMediaSrc(src)) {
    return src;
  }

  const fileName = stripProtocol(src, 'local-video');
  return `local-video://${fileName}`;
}
