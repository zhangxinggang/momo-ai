import type { DAITransportResponse } from '@/types/modules';

import type { IResponseLike } from './types';

export function getAITransport() {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.api?.ai ?? null;
}

export function createResponseLike(response: DAITransportResponse): IResponseLike {
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    text: async () => response.body,
    json: async <T = unknown>() => JSON.parse(response.body) as T,
  };
}

export function createFetchResponseLike(response: Response): IResponseLike {
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    text: async () => response.text(),
    json: async <T = unknown>() => response.json() as Promise<T>,
  };
}
