import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { IKnowledgeErrorShape } from '@/types/modules/kb';
import { BrowserWindow, dialog, ipcMain } from 'electron';

import { serializeKnowledgeError } from '../services/knowledge-v2/error';
import { knowledgeWorkerClient } from '../services/knowledge-v2/worker-client';

export type IKnowledgeIpcResponse<T = unknown> =
  | { ok: true; value: T }
  | { ok: false; error: IKnowledgeErrorShape };

export const KNOWLEDGE_CHANNELS = [
  IPC_CHANNELS.KNOWLEDGE_LIST_COLLECTIONS,
  IPC_CHANNELS.KNOWLEDGE_CREATE_COLLECTION,
  IPC_CHANNELS.KNOWLEDGE_UPDATE_COLLECTION,
  IPC_CHANNELS.KNOWLEDGE_DELETE_COLLECTION,
  IPC_CHANNELS.KNOWLEDGE_LIST_DOCUMENTS,
  IPC_CHANNELS.KNOWLEDGE_IMPORT_FILES,
  IPC_CHANNELS.KNOWLEDGE_IMPORT_DIRECTORY,
  IPC_CHANNELS.KNOWLEDGE_PICK_DIRECTORY,
  IPC_CHANNELS.KNOWLEDGE_PASTE_TEXT,
  IPC_CHANNELS.KNOWLEDGE_GET_DOCUMENT,
  IPC_CHANNELS.KNOWLEDGE_DELETE_DOCUMENT,
  IPC_CHANNELS.KNOWLEDGE_LIST_CHUNKS,
  IPC_CHANNELS.KNOWLEDGE_GET_CHUNK,
  IPC_CHANNELS.KNOWLEDGE_EDIT_CHUNK,
  IPC_CHANNELS.KNOWLEDGE_DELETE_CHUNKS,
  IPC_CHANNELS.KNOWLEDGE_PREVIEW_FILE,
  IPC_CHANNELS.KNOWLEDGE_RETRIEVE,
  IPC_CHANNELS.KNOWLEDGE_RETRIEVE_FOR_CHAT,
  IPC_CHANNELS.KNOWLEDGE_LIST_JOBS,
  IPC_CHANNELS.KNOWLEDGE_RETRY_JOB,
  IPC_CHANNELS.KNOWLEDGE_CANCEL_JOB,
] as const;

const KNOWLEDGE_METHODS = [
  [IPC_CHANNELS.KNOWLEDGE_LIST_COLLECTIONS, 'listCollections'],
  [IPC_CHANNELS.KNOWLEDGE_CREATE_COLLECTION, 'createCollection'],
  [IPC_CHANNELS.KNOWLEDGE_UPDATE_COLLECTION, 'updateCollection'],
  [IPC_CHANNELS.KNOWLEDGE_DELETE_COLLECTION, 'deleteCollection'],
  [IPC_CHANNELS.KNOWLEDGE_LIST_DOCUMENTS, 'listDocuments'],
  [IPC_CHANNELS.KNOWLEDGE_IMPORT_FILES, 'importFiles'],
  [IPC_CHANNELS.KNOWLEDGE_IMPORT_DIRECTORY, 'importDirectory'],
  [IPC_CHANNELS.KNOWLEDGE_PASTE_TEXT, 'pasteText'],
  [IPC_CHANNELS.KNOWLEDGE_GET_DOCUMENT, 'getDocument'],
  [IPC_CHANNELS.KNOWLEDGE_DELETE_DOCUMENT, 'deleteDocument'],
  [IPC_CHANNELS.KNOWLEDGE_LIST_CHUNKS, 'listChunks'],
  [IPC_CHANNELS.KNOWLEDGE_GET_CHUNK, 'getChunk'],
  [IPC_CHANNELS.KNOWLEDGE_EDIT_CHUNK, 'editChunk'],
  [IPC_CHANNELS.KNOWLEDGE_DELETE_CHUNKS, 'deleteChunks'],
  [IPC_CHANNELS.KNOWLEDGE_PREVIEW_FILE, 'previewFile'],
  [IPC_CHANNELS.KNOWLEDGE_RETRIEVE, 'retrieve'],
  [IPC_CHANNELS.KNOWLEDGE_RETRIEVE_FOR_CHAT, 'retrieveForChat'],
  [IPC_CHANNELS.KNOWLEDGE_LIST_JOBS, 'listJobs'],
  [IPC_CHANNELS.KNOWLEDGE_RETRY_JOB, 'retryJob'],
  [IPC_CHANNELS.KNOWLEDGE_CANCEL_JOB, 'cancelJob'],
] as const;

/** Register the isolated Knowledge V2 worker boundary. */
export function registerKbIPC(): void {
  for (const [channel, method] of KNOWLEDGE_METHODS) {
    ipcMain.handle(channel, async (_event, ...args: unknown[]): Promise<IKnowledgeIpcResponse> => {
      try {
        return { ok: true, value: await knowledgeWorkerClient.call(method, ...args) };
      } catch (error) {
        return { ok: false, error: serializeKnowledgeError(error) };
      }
    });
  }
  ipcMain.handle(
    IPC_CHANNELS.KNOWLEDGE_PICK_DIRECTORY,
    async (event): Promise<IKnowledgeIpcResponse<string | undefined>> => {
      try {
        const owner = BrowserWindow.fromWebContents(event.sender);
        const result = owner
          ? await dialog.showOpenDialog(owner, { properties: ['openDirectory'] })
          : await dialog.showOpenDialog({ properties: ['openDirectory'] });
        return {
          ok: true,
          value: result.canceled ? undefined : result.filePaths[0],
        };
      } catch (error) {
        return { ok: false, error: serializeKnowledgeError(error) };
      }
    },
  );
}
