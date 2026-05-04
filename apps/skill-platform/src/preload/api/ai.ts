import { ipcRenderer } from 'electron';

import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type {
  DAITransportRequest,
  DAITransportResponse,
  DAITransportStreamChunk,
  DAITransportStreamError,
} from '@/types/modules';

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `ai-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const aiApi = {
  request: (request: DAITransportRequest): Promise<DAITransportResponse> =>
    ipcRenderer.invoke(IPC_CHANNELS.AI_HTTP_REQUEST, request),
  requestStream: async (
    request: DAITransportRequest,
    handlers?: {
      onChunk?: (chunk: string) => void;
      onError?: (error: string) => void;
    },
  ): Promise<DAITransportResponse> => {
    const requestId = request.requestId || createRequestId();

    const chunkListener = (_event: Electron.IpcRendererEvent, payload: DAITransportStreamChunk) => {
      if (payload.requestId !== requestId) {
        return;
      }
      handlers?.onChunk?.(payload.chunk);
    };

    const errorListener = (_event: Electron.IpcRendererEvent, payload: DAITransportStreamError) => {
      if (payload.requestId !== requestId) {
        return;
      }
      handlers?.onError?.(payload.error);
    };

    ipcRenderer.on(IPC_CHANNELS.AI_HTTP_STREAM_CHUNK, chunkListener);
    ipcRenderer.on(IPC_CHANNELS.AI_HTTP_STREAM_ERROR, errorListener);

    try {
      return await ipcRenderer.invoke(IPC_CHANNELS.AI_HTTP_STREAM, {
        ...request,
        requestId,
      });
    } finally {
      ipcRenderer.removeListener(IPC_CHANNELS.AI_HTTP_STREAM_CHUNK, chunkListener);
      ipcRenderer.removeListener(IPC_CHANNELS.AI_HTTP_STREAM_ERROR, errorListener);
    }
  },
};
