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
import type { Database } from 'better-sqlite3';
import { ipcMain } from 'electron';

import { getKbService } from '../services/kb';

function normalizeUploadFiles(raw: DKbUploadFile[]): DKbUploadFile[] {
  return raw.map((f) => ({
    ...f,
    data: f.data instanceof Uint8Array ? f.data : new Uint8Array(f.data as ArrayBuffer),
  }));
}

/**
 * 注册知识库 IPC（无用户鉴权）
 */
export function registerKbIPC(db: Database): void {
  const service = () => getKbService(db);

  ipcMain.handle(
    IPC_CHANNELS.KB_LIST_COLLECTIONS,
    async (_event, groupId?: number): Promise<IKbCollection[]> => {
      return service().listCollections(groupId);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.KB_CREATE_COLLECTION,
    async (
      _event,
      name: string,
      description?: string,
      groupId?: number,
    ): Promise<IKbCollection> => {
      return service().createCollection(name, description, groupId);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.KB_UPDATE_COLLECTION,
    async (
      _event,
      id: number,
      payload: Partial<{ name: string; description: string; group_id: number | null }>,
    ): Promise<{ success: boolean }> => {
      service().updateCollection(id, payload);
      return { success: true };
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.KB_DELETE_COLLECTION,
    async (_event, id: number): Promise<{ success: boolean }> => {
      service().deleteCollection(id);
      return { success: true };
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.KB_LIST_DOCUMENTS,
    async (_event, collectionId: number): Promise<IKbDocument[]> => {
      return service().listDocuments(collectionId);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.KB_UPLOAD_FILES,
    async (
      _event,
      collectionId: number,
      files: DKbUploadFile[],
    ): Promise<{
      items: IKbUploadResultItem[];
      skipped: { filename: string; size: number; reason: string }[];
    }> => {
      return service().uploadFiles(collectionId, normalizeUploadFiles(files));
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.KB_PASTE_TEXT,
    async (
      _event,
      collectionId: number,
      text: string,
      filename?: string,
    ): Promise<{ docId: number }> => {
      return service().pasteText(collectionId, text, filename);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.KB_INGEST_DOCUMENT,
    async (
      _event,
      docId: number,
      embeddingConfig: IKbEmbeddingConfig,
      options?: IKbIngestOptions,
    ): Promise<{ success: boolean; chunks: number; dim: number }> => {
      const result = await service().ingestDocument(docId, embeddingConfig, options);
      return { success: true, ...result };
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.KB_GET_DOCUMENT,
    async (_event, docId: number): Promise<{ item: IKbDocument | null }> => {
      const item = service().getDocumentProgress(docId);
      return { item };
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.KB_DELETE_DOCUMENT,
    async (_event, docId: number): Promise<{ success: boolean }> => {
      service().deleteDocument(docId);
      return { success: true };
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.KB_LIST_CHUNKS,
    async (
      _event,
      docId: number,
      page?: number,
      pageSize?: number,
      keyword?: string,
    ): Promise<{ items: IKbChunkItem[]; total: number }> => {
      return service().listChunks(docId, page, pageSize, keyword);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.KB_UPDATE_CHUNK,
    async (_event, chunkId: number, content: string): Promise<{ success: boolean }> => {
      service().updateChunk(chunkId, content);
      return { success: true };
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.KB_DELETE_CHUNKS,
    async (_event, chunkIds: number[]): Promise<{ success: boolean }> => {
      service().deleteChunks(chunkIds);
      return { success: true };
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.KB_RESEGMENT_DOCUMENT,
    async (
      _event,
      docId: number,
      embeddingConfig: IKbEmbeddingConfig,
      segmentSettings: DKbSegmentSettings,
      segmentMode: EKbSegmentMode,
      llmConfig?: IKbLlmConfig,
    ): Promise<{ success: boolean; chunks: number; dim: number }> => {
      const result = await service().resegmentDocument(
        docId,
        embeddingConfig,
        segmentSettings,
        segmentMode,
        llmConfig,
      );
      return { success: true, ...result };
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.KB_PREVIEW_FILE_SEGMENTS,
    async (
      _event,
      file: DKbUploadFile,
      segmentSettings?: DKbSegmentSettings,
      limit?: number,
      llmConfig?: IKbLlmConfig,
    ): Promise<{ idx: number; content: string }[]> => {
      const [normalized] = normalizeUploadFiles([file]);
      return service().previewFileSegments(normalized, segmentSettings, limit, llmConfig);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.KB_SEARCH,
    async (
      _event,
      collectionId: number,
      query: string,
      embeddingConfig: IKbEmbeddingConfig,
      topK?: number,
    ): Promise<{ items: IKbSearchItem[] }> => {
      const items = await service().search(collectionId, query, embeddingConfig, topK ?? 10);
      return { items };
    },
  );
}
