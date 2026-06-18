/**
 * IndexedDB Database Service
 * 使用 IndexedDB 存储数据（Web 运行时降级路径）
 */

import type { IFolder, IPrompt, IPromptVersion } from '@/types/modules';

const DB_NAME = 'AIMDB';
const DB_VERSION = 1;

// Generate UUID using browser native API
// 使用浏览器原生 API 生成 UUID
const generateId = () => crypto.randomUUID();

// Database storage names
// 数据库存储名称
const STORES = {
  PROMPTS: 'prompts',
  VERSIONS: 'versions',
  FOLDERS: 'folders',
  SETTINGS: 'settings',
} as const;

let db: IDBDatabase | null = null;

/**
 * 初始化数据库
 * Initialize database
 */
export async function initDatabase(): Promise<IDBDatabase> {
  // 如果已有连接，先关闭
  // If there's an existing connection, close it first
  if (db) {
    try {
      db.close();
    } catch (e) {
      console.warn('Failed to close existing db connection:', e);
    }
    db = null;
  }

  return new Promise((resolve, reject) => {
    // 添加超时机制，防止无限等待
    // Add timeout mechanism to prevent infinite waiting
    const timeout = setTimeout(() => {
      console.error('Database open timeout after 10s');
      reject(new Error('Database open timeout'));
    }, 10000);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to open database'));
    };

    request.onblocked = () => {
      console.warn('Database open blocked - another connection is open');
      // 不立即 reject，等待 onsuccess 或超时
      // Don't reject immediately, wait for onsuccess or timeout
    };

    request.onsuccess = () => {
      clearTimeout(timeout);
      db = request.result;

      // 监听版本变化事件，当其他标签页升级数据库时关闭连接
      // Listen for version change events, close connection when other tabs upgrade database
      db.onversionchange = () => {
        console.log('Database version change detected, closing connection');
        db?.close();
        db = null;
      };

      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // 创建 prompts 存储
      // Create prompts store
      if (!database.objectStoreNames.contains(STORES.PROMPTS)) {
        const promptStore = database.createObjectStore(STORES.PROMPTS, {
          keyPath: 'id',
        });
        promptStore.createIndex('folderId', 'folderId', { unique: false });
        promptStore.createIndex('isFavorite', 'isFavorite', { unique: false });
        promptStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // 创建 versions 存储
      // Create versions store
      if (!database.objectStoreNames.contains(STORES.VERSIONS)) {
        const versionStore = database.createObjectStore(STORES.VERSIONS, {
          keyPath: 'id',
        });
        versionStore.createIndex('promptId', 'promptId', { unique: false });
        versionStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 创建 folders 存储
      // Create folders store
      if (!database.objectStoreNames.contains(STORES.FOLDERS)) {
        const folderStore = database.createObjectStore(STORES.FOLDERS, {
          keyPath: 'id',
        });
        folderStore.createIndex('parentId', 'parentId', { unique: false });
      }

      // 创建 settings 存储
      // Create settings store
      if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
        database.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    };
  });
}

/**
 * 获取数据库实例
 * Get database instance
 */
export async function getDatabase(): Promise<IDBDatabase> {
  if (db) return db;
  return initDatabase();
}

/**
 * 删除并重建数据库（用于开发调试）
 * Delete and recreate database (for development debugging)
 */
export async function resetDatabase(): Promise<void> {
  // 关闭现有连接
  // Close existing connection
  if (db) {
    db.close();
    db = null;
  }

  // 删除数据库
  // Delete database
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => {
      console.log('Database deleted successfully');
      resolve();
    };
    request.onerror = () => {
      console.error('Failed to delete database');
      reject(request.error);
    };
  });
}

// ==================== IPrompt 操作 ====================
// ==================== IPrompt Operations ====================

export async function getAllPrompts(): Promise<IPrompt[]> {
  if (window.api?.prompt?.getAll) {
    return (await window.api.prompt.getAll()) ?? [];
  }

  return legacyGetAllPrompts();
}

async function legacyGetAllPrompts(): Promise<IPrompt[]> {
  const database = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.PROMPTS, 'readonly');
    const store = transaction.objectStore(STORES.PROMPTS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getPromptById(id: string): Promise<IPrompt | undefined> {
  if (window.api?.prompt?.get) {
    return (await window.api.prompt.get(id)) ?? undefined;
  }

  const database = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.PROMPTS, 'readonly');
    const store = transaction.objectStore(STORES.PROMPTS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function createPrompt(
  data: Omit<IPrompt, 'id' | 'createdAt' | 'updatedAt' | 'version'>,
): Promise<IPrompt> {
  if (window.api?.prompt?.create) {
    return window.api.prompt.create({
      title: data.title,
      systemPrompt: data.systemPrompt ?? undefined,
      systemPromptEn: data.systemPromptEn ?? undefined,
      userPrompt: data.userPrompt,
      userPromptEn: data.userPromptEn ?? undefined,
      variables: data.variables,
      tags: data.tags,
      folderId: data.folderId ?? undefined,
      source: data.source ?? undefined,
    });
  }

  const database = await getDatabase();
  const now = new Date().toISOString();
  const prompt: IPrompt = {
    ...data,
    id: generateId(),
    version: 1,
    createdAt: now,
    updatedAt: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.PROMPTS, 'readwrite');
    const store = transaction.objectStore(STORES.PROMPTS);
    const request = store.add(prompt);

    request.onsuccess = () => resolve(prompt);
    request.onerror = () => reject(request.error);
  });
}

export async function updatePrompt(
  id: string,
  data: Partial<IPrompt>,
  incrementVersion = true,
): Promise<IPrompt> {
  if (window.api?.prompt?.update) {
    const updated = await window.api.prompt.update(id, {
      title: data.title,
      systemPrompt: data.systemPrompt ?? undefined,
      systemPromptEn: data.systemPromptEn ?? undefined,
      userPrompt: data.userPrompt,
      userPromptEn: data.userPromptEn ?? undefined,
      variables: data.variables,
      tags: data.tags,
      folderId: data.folderId ?? undefined,
      isFavorite: data.isFavorite,
      isPinned: data.isPinned,
      usageCount: data.usageCount,
      source: data.source ?? undefined,
      lastAiResponse: data.lastAiResponse ?? undefined,
    });
    if (!updated) {
      throw new Error(`IPrompt not found: ${id}`);
    }
    return updated;
  }

  const database = await getDatabase();
  const existing = await getPromptById(id);
  if (!existing) throw new Error('IPrompt not found');

  // 只有内容变化才增加版本号
  // Only increment version number when content changes
  const hasContentChange = data.systemPrompt !== undefined || data.userPrompt !== undefined;
  const shouldIncrementVersion = incrementVersion && hasContentChange;

  const updated: IPrompt = {
    ...existing,
    ...data,
    id,
    updatedAt: new Date().toISOString(),
    version: shouldIncrementVersion ? existing.version + 1 : existing.version,
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.PROMPTS, 'readwrite');
    const store = transaction.objectStore(STORES.PROMPTS);
    const request = store.put(updated);

    request.onsuccess = () => resolve(updated);
    request.onerror = () => reject(request.error);
  });
}

export async function deletePrompt(id: string): Promise<void> {
  if (window.api?.prompt?.delete) {
    await window.api.prompt.delete(id);
    return;
  }

  const database = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.PROMPTS, 'readwrite');
    const store = transaction.objectStore(STORES.PROMPTS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * 批量移动 IPrompt 到指定文件夹
 * Batch move prompts to a folder
 */
export async function movePrompts(ids: string[], folderId: string): Promise<void> {
  if (window.api?.prompt?.update) {
    await Promise.all(ids.map((id) => window.api.prompt.update(id, { folderId })));
    return;
  }

  const database = await getDatabase();
  const now = new Date().toISOString();

  // 逐个更新 IPrompt 的文件夹
  // Update prompt folders one by one
  for (const id of ids) {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORES.PROMPTS, 'readwrite');
      const store = transaction.objectStore(STORES.PROMPTS);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const prompt = getRequest.result;
        if (prompt) {
          prompt.folderId = folderId;
          prompt.updatedAt = now;
          const putRequest = store.put(prompt);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }
}

// ==================== Version 操作 ====================
// ==================== Version Operations ====================

export async function getPromptVersions(promptId: string): Promise<IPromptVersion[]> {
  if (window.api?.version?.getAll) {
    return (await window.api.version.getAll(promptId)) ?? [];
  }

  return legacyGetPromptVersions(promptId);
}

async function legacyGetPromptVersions(promptId: string): Promise<IPromptVersion[]> {
  const database = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.VERSIONS, 'readonly');
    const store = transaction.objectStore(STORES.VERSIONS);
    const index = store.index('promptId');
    const request = index.getAll(promptId);

    request.onsuccess = () => {
      const versions = request.result.sort((a, b) => b.version - a.version);
      resolve(versions);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function createPromptVersion(
  promptId: string,
  data: { systemPrompt?: string; userPrompt: string; version: number },
): Promise<IPromptVersion> {
  if (window.api?.version?.create) {
    const version = await window.api.version.create(promptId);
    if (!version) {
      throw new Error(`Failed to create version for prompt: ${promptId}`);
    }
    return version;
  }

  const database = await getDatabase();
  const now = new Date().toISOString();
  const versionRecord: IPromptVersion = {
    id: generateId(),
    promptId,
    version: data.version,
    systemPrompt: data.systemPrompt,
    userPrompt: data.userPrompt,
    variables: [],
    createdAt: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.VERSIONS, 'readwrite');
    const store = transaction.objectStore(STORES.VERSIONS);
    const request = store.add(versionRecord);

    request.onsuccess = () => resolve(versionRecord);
    request.onerror = () => reject(request.error);
  });
}

export async function deletePromptVersion(versionId: string): Promise<void> {
  if (window.api?.version?.delete) {
    await window.api.version.delete(versionId);
    return;
  }

  const database = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.VERSIONS, 'readwrite');
    const store = transaction.objectStore(STORES.VERSIONS);
    const request = store.delete(versionId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ==================== Folder 操作 ====================
// ==================== Folder Operations ====================

export async function getAllFolders(): Promise<IFolder[]> {
  if (window.api?.folder?.getAll) {
    return (await window.api.folder.getAll()) ?? [];
  }

  return legacyGetAllFolders();
}

async function legacyGetAllFolders(): Promise<IFolder[]> {
  const database = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.FOLDERS, 'readonly');
    const store = transaction.objectStore(STORES.FOLDERS);
    const request = store.getAll();

    request.onsuccess = () => {
      // 按 order 字段排序
      // Sort by order field
      const folders = request.result.sort((a, b) => (a.order || 0) - (b.order || 0));
      resolve(folders);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function createFolder(
  data: Omit<IFolder, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<IFolder> {
  if (window.api?.folder?.create) {
    return window.api.folder.create({
      name: data.name,
      icon: data.icon,
      parentId: data.parentId,
      isPrivate: data.isPrivate,
      visibility: data.visibility,
    });
  }

  const database = await getDatabase();
  const now = new Date().toISOString();
  const folder: IFolder = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.FOLDERS, 'readwrite');
    const store = transaction.objectStore(STORES.FOLDERS);
    const request = store.add(folder);

    request.onsuccess = () => resolve(folder);
    request.onerror = () => reject(request.error);
  });
}

export async function updateFolder(id: string, data: Partial<IFolder>): Promise<IFolder> {
  if (window.api?.folder?.update) {
    const updated = await window.api.folder.update(id, {
      name: data.name,
      icon: data.icon,
      parentId: data.parentId,
      order: data.order,
      isPrivate: data.isPrivate,
      visibility: data.visibility,
    });
    if (!updated) {
      throw new Error(`Folder not found: ${id}`);
    }
    return updated;
  }

  const database = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.FOLDERS, 'readwrite');
    const store = transaction.objectStore(STORES.FOLDERS);

    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const existing = getRequest.result;
      if (!existing) {
        reject(new Error('Folder not found'));
        return;
      }

      const updated: IFolder = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      const putRequest = store.put(updated);
      putRequest.onsuccess = () => resolve(updated);
      putRequest.onerror = () => reject(putRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function deleteFolder(id: string): Promise<void> {
  if (window.api?.folder?.delete) {
    await window.api.folder.delete(id);
    return;
  }

  const database = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.FOLDERS, 'readwrite');
    const store = transaction.objectStore(STORES.FOLDERS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function updateFolderOrders(updates: { id: string; order: number }[]): Promise<void> {
  if (window.api?.folder?.update) {
    await Promise.all(updates.map(({ id, order }) => window.api.folder.update(id, { order })));
    return;
  }

  const database = await getDatabase();

  // 逐个更新文件夹顺序
  // Update folder order one by one
  for (const { id, order } of updates) {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORES.FOLDERS, 'readwrite');
      const store = transaction.objectStore(STORES.FOLDERS);
      const request = store.get(id);

      request.onsuccess = () => {
        const folder = request.result;
        if (folder) {
          folder.order = order;
          folder.updatedAt = new Date().toISOString();
          const putRequest = store.put(folder);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * 清空数据库
 * Clear database
 */
export async function clearDatabase(): Promise<void> {
  const database = await getDatabase();

  // 获取所有存在的 store 名称
  // Get all existing store names
  const storeNames = Array.from(database.objectStoreNames);
  const storesToClear = [STORES.PROMPTS, STORES.FOLDERS, STORES.VERSIONS].filter((store) =>
    storeNames.includes(store),
  );

  if (storesToClear.length === 0) {
    console.warn('No stores to clear');
    return;
  }

  const transaction = database.transaction(storesToClear, 'readwrite');

  for (const storeName of storesToClear) {
    transaction.objectStore(storeName).clear();
  }

  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });

  // 清除图片文件
  // Clear image files
  try {
    await window.electron?.clearImages?.();
    console.log('Images cleared');
  } catch (error) {
    console.warn('Failed to clear images:', error);
  }

  // 清除视频文件
  // Clear video files
  try {
    await window.electron?.clearVideos?.();
    console.log('Videos cleared');
  } catch (error) {
    console.warn('Failed to clear videos:', error);
  }
}

/**
 * 获取数据库存储位置信息
 * Get database storage location information
 */
export function getDatabaseInfo(): { name: string; description: string } {
  return {
    name: 'SQLite + Workspace Files',
    description: 'IPrompt/IFolder/Version 存储在主进程 SQLite，并同步为 workspace 文件',
  };
}
