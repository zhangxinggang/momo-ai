import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type {
  DKbSegmentSettings,
  DKbUploadFile,
  EKbSegmentMode,
  IKbChunkItem,
  IKbCollection,
  IKbDocument,
  IKbEmbeddingConfig,
  IKbIngestOptions,
  IKbLlmConfig,
  IKbSearchItem,
  IKbUploadResultItem,
} from '@/types/modules/kb';
import { ipcRenderer } from 'electron';

export const kbApi = {
  listCollections: (groupId?: number): Promise<IKbCollection[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.KB_LIST_COLLECTIONS, groupId),

  createCollection: (
    name: string,
    description?: string,
    groupId?: number,
  ): Promise<IKbCollection> =>
    ipcRenderer.invoke(IPC_CHANNELS.KB_CREATE_COLLECTION, name, description, groupId),

  updateCollection: (
    id: number,
    payload: Partial<{ name: string; description: string; group_id: number | null }>,
  ): Promise<{ success: boolean }> =>
    ipcRenderer.invoke(IPC_CHANNELS.KB_UPDATE_COLLECTION, id, payload),

  deleteCollection: (id: number): Promise<{ success: boolean }> =>
    ipcRenderer.invoke(IPC_CHANNELS.KB_DELETE_COLLECTION, id),

  listDocuments: (collectionId: number): Promise<IKbDocument[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.KB_LIST_DOCUMENTS, collectionId),

  uploadFiles: (
    collectionId: number,
    files: DKbUploadFile[],
  ): Promise<{
    items: IKbUploadResultItem[];
    skipped: { filename: string; size: number; reason: string }[];
  }> => ipcRenderer.invoke(IPC_CHANNELS.KB_UPLOAD_FILES, collectionId, files),

  pasteText: (collectionId: number, text: string, filename?: string): Promise<{ docId: number }> =>
    ipcRenderer.invoke(IPC_CHANNELS.KB_PASTE_TEXT, collectionId, text, filename),

  ingestDocument: (
    docId: number,
    embeddingConfig: IKbEmbeddingConfig,
    options?: IKbIngestOptions,
  ): Promise<{ success: boolean; chunks: number; dim: number }> =>
    ipcRenderer.invoke(IPC_CHANNELS.KB_INGEST_DOCUMENT, docId, embeddingConfig, options),

  getDocument: (docId: number): Promise<{ item: IKbDocument | null }> =>
    ipcRenderer.invoke(IPC_CHANNELS.KB_GET_DOCUMENT, docId),

  deleteDocument: (docId: number): Promise<{ success: boolean }> =>
    ipcRenderer.invoke(IPC_CHANNELS.KB_DELETE_DOCUMENT, docId),

  search: (
    collectionId: number,
    query: string,
    embeddingConfig: IKbEmbeddingConfig,
    topK?: number,
  ): Promise<{ items: IKbSearchItem[] }> =>
    ipcRenderer.invoke(IPC_CHANNELS.KB_SEARCH, collectionId, query, embeddingConfig, topK),

  listChunks: (
    docId: number,
    page?: number,
    pageSize?: number,
    keyword?: string,
  ): Promise<{ items: IKbChunkItem[]; total: number }> =>
    ipcRenderer.invoke(IPC_CHANNELS.KB_LIST_CHUNKS, docId, page, pageSize, keyword),

  updateChunk: (chunkId: number, content: string): Promise<{ success: boolean }> =>
    ipcRenderer.invoke(IPC_CHANNELS.KB_UPDATE_CHUNK, chunkId, content),

  deleteChunks: (chunkIds: number[]): Promise<{ success: boolean }> =>
    ipcRenderer.invoke(IPC_CHANNELS.KB_DELETE_CHUNKS, chunkIds),

  resegmentDocument: (
    docId: number,
    embeddingConfig: IKbEmbeddingConfig,
    segmentSettings: DKbSegmentSettings,
    segmentMode: EKbSegmentMode,
    llmConfig?: IKbLlmConfig,
  ): Promise<{ success: boolean; chunks: number; dim: number }> =>
    ipcRenderer.invoke(
      IPC_CHANNELS.KB_RESEGMENT_DOCUMENT,
      docId,
      embeddingConfig,
      segmentSettings,
      segmentMode,
      llmConfig,
    ),

  previewFileSegments: (
    file: DKbUploadFile,
    segmentSettings?: DKbSegmentSettings,
    limit?: number,
    llmConfig?: IKbLlmConfig,
  ): Promise<{ idx: number; content: string }[]> =>
    ipcRenderer.invoke(
      IPC_CHANNELS.KB_PREVIEW_FILE_SEGMENTS,
      file,
      segmentSettings,
      limit,
      llmConfig,
    ),
};
