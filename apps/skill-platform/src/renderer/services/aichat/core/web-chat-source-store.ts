import type { IChatSourceInput, IChatSourceRef, IResolvedChatSource } from '@momo/aichat';

const DATABASE_NAME = 'momo-ai-chat-sources-v1';
const STORE_NAME = 'sources';
const DATABASE_VERSION = 1;

interface IStoredSource extends IResolvedChatSource {
  namespace: string;
  createdAt: number;
  lastAccessedAt: number;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'sourceId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('无法打开附件快照存储'));
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('附件快照存储失败'));
  });
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** 内容寻址的独立附件快照存储；会话 JSON 只保存 SourceRef。 */
export function createWebChatSourceStore(namespace: string) {
  return {
    save: async (sources: IChatSourceInput[]): Promise<IChatSourceRef[]> => {
      if (sources.length === 0) {
        return [];
      }
      const now = Date.now();
      const records = await Promise.all(
        sources.map(async (source): Promise<IStoredSource> => {
          const revision = await sha256(
            source.mimeType + '\0' + source.encoding + '\0' + source.content,
          );
          return {
            sourceId: namespace + ':' + revision,
            revision,
            name: source.name,
            mimeType: source.mimeType,
            encoding: source.encoding,
            size: source.content.length,
            namespace,
            content: source.content,
            createdAt: now,
            lastAccessedAt: now,
          };
        }),
      );
      const database = await openDatabase();
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      for (const record of records) {
        store.put(record);
      }

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error || new Error('附件快照保存失败'));
        transaction.onabort = () => reject(transaction.error || new Error('附件快照保存中止'));
      });
      database.close();
      return records.map(
        ({
          content: _content,
          namespace: _namespace,
          createdAt: _createdAt,
          lastAccessedAt: _lastAccessedAt,
          ...ref
        }) => ref,
      );
    },

    load: async (refs: IChatSourceRef[]): Promise<IResolvedChatSource[]> => {
      if (refs.length === 0) {
        return [];
      }
      const database = await openDatabase();
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const records = await Promise.all(
        refs.map((ref) => requestResult(store.get(ref.sourceId) as IDBRequest<IStoredSource>)),
      );
      const result: IResolvedChatSource[] = [];
      records.forEach((record, index) => {
        const ref = refs[index];
        if (record && record.namespace === namespace && record.revision === ref.revision) {
          result.push({
            sourceId: record.sourceId,
            revision: record.revision,
            name: record.name,
            mimeType: record.mimeType,
            encoding: record.encoding,
            size: record.size,
            content: record.content,
          });
        }
      });
      database.close();
      return result;
    },
  };
}
