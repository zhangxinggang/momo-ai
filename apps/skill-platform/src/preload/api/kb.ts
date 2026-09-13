import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type {
  IKbChunkItem,
  IKbCollection,
  IKbDirectoryImportRequest,
  IKbDocument,
  IKbEmbeddingConfig,
  IKbFileImportRequest,
  IKbImportResultItem,
  IKbIngestOptions,
  IKbJob,
  IKbRetrievalRequest,
  IKbRetrievalResult,
  IKnowledgeErrorShape,
} from '@/types/modules/kb';
import { ipcRenderer, webUtils } from 'electron';

type IKnowledgeIpcResponse<T> = { ok: true; value: T } | { ok: false; error: IKnowledgeErrorShape };

async function invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  const response = (await ipcRenderer.invoke(channel, ...args)) as IKnowledgeIpcResponse<T>;
  if ('value' in response) return response.value;
  const error = new Error(response.error.message) as Error & IKnowledgeErrorShape;
  Object.assign(error, response.error);
  throw error;
}

export const kbApi = {
  getPathForFile: (file: File): string => webUtils.getPathForFile(file),
  listCollections: (): Promise<IKbCollection[]> => invoke(IPC_CHANNELS.KNOWLEDGE_LIST_COLLECTIONS),
  createCollection: (name: string, description?: string): Promise<IKbCollection> =>
    invoke(IPC_CHANNELS.KNOWLEDGE_CREATE_COLLECTION, name, description),
  updateCollection: (
    id: string,
    patch: { name?: string; description?: string },
  ): Promise<IKbCollection> => invoke(IPC_CHANNELS.KNOWLEDGE_UPDATE_COLLECTION, id, patch),
  deleteCollection: (id: string): Promise<void> =>
    invoke(IPC_CHANNELS.KNOWLEDGE_DELETE_COLLECTION, id),
  listDocuments: (collectionId: string): Promise<IKbDocument[]> =>
    invoke(IPC_CHANNELS.KNOWLEDGE_LIST_DOCUMENTS, collectionId),
  importFiles: (request: IKbFileImportRequest): Promise<IKbImportResultItem[]> =>
    invoke(IPC_CHANNELS.KNOWLEDGE_IMPORT_FILES, request),
  importDirectory: (request: IKbDirectoryImportRequest): Promise<IKbImportResultItem[]> =>
    invoke(IPC_CHANNELS.KNOWLEDGE_IMPORT_DIRECTORY, request),
  pickDirectory: (): Promise<string | undefined> => invoke(IPC_CHANNELS.KNOWLEDGE_PICK_DIRECTORY),
  pasteText: (request: {
    collectionId: string;
    text: string;
    filename?: string;
    ingest: IKbIngestOptions;
    embedding: IKbEmbeddingConfig;
  }): Promise<IKbImportResultItem> => invoke(IPC_CHANNELS.KNOWLEDGE_PASTE_TEXT, request),
  getDocument: (documentId: string): Promise<IKbDocument | null> =>
    invoke(IPC_CHANNELS.KNOWLEDGE_GET_DOCUMENT, documentId),
  deleteDocument: (documentId: string): Promise<void> =>
    invoke(IPC_CHANNELS.KNOWLEDGE_DELETE_DOCUMENT, documentId),
  listChunks: (
    documentId: string,
    page?: number,
    pageSize?: number,
    keyword?: string,
  ): Promise<{ items: IKbChunkItem[]; total: number }> =>
    invoke(IPC_CHANNELS.KNOWLEDGE_LIST_CHUNKS, documentId, page, pageSize, keyword),
  getChunk: (chunkId: string): Promise<IKbChunkItem> =>
    invoke(IPC_CHANNELS.KNOWLEDGE_GET_CHUNK, chunkId),
  editChunk: (
    chunkId: string,
    content: string,
    embedding: IKbEmbeddingConfig,
  ): Promise<{ jobId: string }> =>
    invoke(IPC_CHANNELS.KNOWLEDGE_EDIT_CHUNK, chunkId, content, embedding),
  deleteChunks: (chunkIds: string[]): Promise<void> =>
    invoke(IPC_CHANNELS.KNOWLEDGE_DELETE_CHUNKS, chunkIds),
  previewFile: (filePath: string, ingest: IKbIngestOptions) =>
    invoke<{
      parserId: string;
      mime: string;
      qualityScore: number;
      notices: string[];
      counts?: Record<string, number>;
      chunks: Array<{
        idx: number;
        content: string;
        headingPath: string[];
        page?: number;
        sheet?: string;
      }>;
    }>(IPC_CHANNELS.KNOWLEDGE_PREVIEW_FILE, filePath, ingest),
  retrieve: (request: IKbRetrievalRequest): Promise<IKbRetrievalResult> =>
    invoke(IPC_CHANNELS.KNOWLEDGE_RETRIEVE, request),
  retrieveForChat: (request: IKbRetrievalRequest): Promise<IKbRetrievalResult> =>
    invoke(IPC_CHANNELS.KNOWLEDGE_RETRIEVE_FOR_CHAT, request),
  listJobs: (limit?: number): Promise<IKbJob[]> => invoke(IPC_CHANNELS.KNOWLEDGE_LIST_JOBS, limit),
  retryJob: (jobId: string, embedding: IKbEmbeddingConfig): Promise<IKbImportResultItem> =>
    invoke(IPC_CHANNELS.KNOWLEDGE_RETRY_JOB, jobId, embedding),
  cancelJob: (jobId: string): Promise<{ cancelled: boolean }> =>
    invoke(IPC_CHANNELS.KNOWLEDGE_CANCEL_JOB, jobId),
};
