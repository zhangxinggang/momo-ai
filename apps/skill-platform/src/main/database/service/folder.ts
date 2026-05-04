import type { DCreateFolder, DUpdateFolder, EFolderVisibility, IFolder } from '@/types/modules';
import type { EntityManager } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { FolderRepository } from '../repository/folder';

/** 文件夹业务逻辑 */
export class FolderService {
  private readonly repo = new FolderRepository();

  async create(data: DCreateFolder): Promise<IFolder> {
    const id = uuidv4();
    const now = Date.now();
    const maxOrder = await this.repo.maxSortOrder(data.parentId || null);
    const order = (maxOrder ?? -1) + 1;
    await this.repo.insert(
      id,
      data.name,
      data.icon || null,
      data.parentId || null,
      order,
      data.isPrivate ? 1 : 0,
      now,
      now,
    );
    return (await this.getById(id))!;
  }

  async getById(id: string): Promise<IFolder | null> {
    const row = await this.repo.findById(id);
    return row ? this.rowToFolder(row) : null;
  }

  async getAll(): Promise<IFolder[]> {
    const rows = await this.repo.findAllOrdered();
    return rows.map((r) => this.rowToFolder(r));
  }

  async update(id: string, data: DUpdateFolder): Promise<IFolder | null> {
    const existingFolder = await this.getById(id);
    if (!existingFolder) return null;

    const updates: string[] = [];
    const values: unknown[] = [];
    const now = Date.now();

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.icon !== undefined) {
      updates.push('icon = ?');
      values.push(data.icon);
    }
    if (data.parentId !== undefined) {
      updates.push('parent_id = ?');
      values.push(data.parentId);
    }
    if (data.order !== undefined) {
      updates.push('sort_order = ?');
      values.push(data.order);
    }
    if (data.isPrivate !== undefined) {
      updates.push('is_private = ?');
      values.push(data.isPrivate ? 1 : 0);
    }
    updates.push('updated_at = ?');
    values.push(now);

    if (updates.length === 1) return existingFolder;

    values.push(id);
    await this.repo.updateDynamic(`${updates.join(', ')} WHERE id = ?`, values);

    const updatedFolder: IFolder = {
      ...existingFolder,
      updatedAt: new Date(now).toISOString(),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.isPrivate !== undefined && { isPrivate: data.isPrivate }),
    };
    return updatedFolder;
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.getById(id);
    if (!existing) return false;
    await this.repo.deleteById(id);
    return true;
  }

  async reorder(ids: string[]): Promise<void> {
    await this.repo.reorder(ids);
  }

  async insertFolderDirect(folder: IFolder, manager?: EntityManager): Promise<void> {
    await this.repo.upsertDirect(
      {
        id: folder.id,
        name: folder.name,
        icon: folder.icon ?? null,
        parent_id: folder.parentId ?? null,
        sort_order: folder.order ?? 0,
        is_private: folder.isPrivate ? 1 : 0,
        created_at: folder.createdAt ? new Date(folder.createdAt).getTime() : Date.now(),
        updated_at: folder.updatedAt ? new Date(folder.updatedAt).getTime() : Date.now(),
      },
      manager,
    );
  }

  private rowToFolder(row: Record<string, unknown>): IFolder {
    return {
      id: String(row.id),
      ownerUserId: row.owner_user_id != null ? String(row.owner_user_id) : undefined,
      visibility: ((row.visibility as string) ?? 'private') as EFolderVisibility,
      name: String(row.name),
      icon: row.icon != null ? String(row.icon) : undefined,
      parentId: row.parent_id != null ? String(row.parent_id) : undefined,
      order: Number(row.sort_order),
      isPrivate: Number(row.is_private) === 1,
      createdAt: new Date(Number(row.created_at)).toISOString(),
      updatedAt: new Date(Number(row.updated_at ?? row.created_at)).toISOString(),
    };
  }
}
