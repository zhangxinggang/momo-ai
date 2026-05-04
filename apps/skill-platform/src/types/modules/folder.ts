/**
 * Folder type definitions
 * 文件夹类型定义
 */

export type EFolderVisibility = 'private' | 'shared';

export interface IFolder {
  id: string;
  ownerUserId?: string | null;
  visibility?: EFolderVisibility;
  name: string;
  icon?: string; // emoji
  parentId?: string;
  order: number;
  isPrivate?: boolean;
  createdAt: string; // ISO 8601 format / ISO 8601 格式
  updatedAt: string; // ISO 8601 format / ISO 8601 格式
}

export interface DCreateFolder {
  name: string;
  icon?: string;
  parentId?: string;
  isPrivate?: boolean;
  visibility?: EFolderVisibility;
}

export interface DUpdateFolder {
  name?: string;
  icon?: string;
  parentId?: string;
  order?: number;
  isPrivate?: boolean;
  visibility?: EFolderVisibility;
}
