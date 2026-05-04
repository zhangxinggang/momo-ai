import type { DCreateFolder, DUpdateFolder, IFolder } from '@/types/modules';
import type { EntityManager } from 'typeorm';

import { FolderService } from '../service/folder';

/** 文件夹对外接口（供 IPC 等调用） */
export class FolderController {
  private readonly service = new FolderService();

  create(data: DCreateFolder): Promise<IFolder> {
    return this.service.create(data);
  }

  getById(id: string): Promise<IFolder | null> {
    return this.service.getById(id);
  }

  getAll(): Promise<IFolder[]> {
    return this.service.getAll();
  }

  update(id: string, data: DUpdateFolder): Promise<IFolder | null> {
    return this.service.update(id, data);
  }

  delete(id: string): Promise<boolean> {
    return this.service.delete(id);
  }

  reorder(ids: string[]): Promise<void> {
    return this.service.reorder(ids);
  }

  insertFolderDirect(folder: IFolder, manager?: EntityManager): Promise<void> {
    return this.service.insertFolderDirect(folder, manager);
  }
}
