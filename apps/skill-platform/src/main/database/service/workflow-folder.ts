import type {
  DCreateWorkflowFolder,
  DUpdateWorkflowFolder,
  IWorkflowFolder,
} from '@/types/modules';
import { v4 as uuidv4 } from 'uuid';

import { WorkflowFolderRepository } from '../repository/workflow-folder';

function rowToFolder(row: Record<string, unknown>): IWorkflowFolder {
  return {
    id: String(row.id),
    name: String(row.name),
    parentId: row.parent_id != null ? String(row.parent_id) : undefined,
    order: Number(row.sort_order ?? row.order ?? 0),
    createdAt: Number(row.created_at ?? row.createdAt),
    updatedAt: Number(row.updated_at ?? row.updatedAt),
  };
}

/** 工作流侧栏目录 CRUD */
export class WorkflowFolderService {
  private readonly repo = new WorkflowFolderRepository();

  async create(data: DCreateWorkflowFolder): Promise<IWorkflowFolder> {
    const id = uuidv4();
    const now = Date.now();
    const parentId = data.parentId ?? null;
    const maxOrder = await this.repo.maxSortOrder(parentId);
    const sortOrder = data.order ?? (maxOrder != null ? maxOrder + 1 : 0);

    await this.repo.insert({
      id,
      name: data.name.trim() || '未命名目录',
      parent_id: parentId,
      sort_order: sortOrder,
      created_at: now,
      updated_at: now,
    });

    return (await this.getById(id))!;
  }

  async getById(id: string): Promise<IWorkflowFolder | null> {
    const row = await this.repo.findById(id);
    return row ? rowToFolder(row) : null;
  }

  async getAll(): Promise<IWorkflowFolder[]> {
    const rows = await this.repo.findAllOrdered();
    return rows.map((row) => rowToFolder(row));
  }

  async update(id: string, data: DUpdateWorkflowFolder): Promise<IWorkflowFolder | null> {
    const existing = await this.getById(id);
    if (!existing) {
      return null;
    }

    const now = Date.now();
    const sets: string[] = ['updated_at = ?'];
    const values: unknown[] = [now];

    if (data.name !== undefined) {
      sets.push('name = ?');
      values.push(data.name.trim() || existing.name);
    }
    if (data.parentId !== undefined) {
      sets.push('parent_id = ?');
      values.push(data.parentId ?? null);
    }
    if (data.order !== undefined) {
      sets.push('sort_order = ?');
      values.push(data.order);
    }

    await this.repo.updateDynamic(sets.join(', '), values, id);
    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.getById(id);
    if (!existing) {
      return false;
    }
    await this.repo.deleteById(id);
    return true;
  }

  async updateOrders(updates: { id: string; order: number }[]): Promise<void> {
    await this.repo.reorder(updates.map((item) => item.id));
  }
}
