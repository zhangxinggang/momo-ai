import type { EntityManager } from 'typeorm';

import { runInTransaction, runQuery } from './sql-runner';

/** workflow_folders 表数据访问 */
export class WorkflowFolderRepository {
  async maxSortOrder(parentId: string | null): Promise<number | null> {
    const rows = await runQuery<{ max: number | null }[]>(
      'SELECT MAX(sort_order) as max FROM workflow_folders WHERE parent_id IS ?',
      [parentId],
    );
    const row = Array.isArray(rows) ? rows[0] : rows;
    return row?.max ?? null;
  }

  async insert(
    params: {
      id: string;
      name: string;
      parent_id: string | null;
      sort_order: number;
      created_at: number;
      updated_at: number;
    },
    manager?: EntityManager,
  ): Promise<void> {
    await runQuery(
      `INSERT INTO workflow_folders (id, name, parent_id, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        params.id,
        params.name,
        params.parent_id,
        params.sort_order,
        params.created_at,
        params.updated_at,
      ],
      manager,
    );
  }

  async findById(id: string): Promise<Record<string, unknown> | undefined> {
    const rows = await runQuery<Record<string, unknown>[]>(
      'SELECT * FROM workflow_folders WHERE id = ?',
      [id],
    );
    return Array.isArray(rows) ? rows[0] : undefined;
  }

  async findAllOrdered(): Promise<Record<string, unknown>[]> {
    const rows = await runQuery<Record<string, unknown>[]>(
      'SELECT * FROM workflow_folders ORDER BY sort_order ASC',
    );
    return Array.isArray(rows) ? rows : [];
  }

  async updateDynamic(
    setsSql: string,
    values: unknown[],
    id: string,
    manager?: EntityManager,
  ): Promise<void> {
    await runQuery(`UPDATE workflow_folders SET ${setsSql} WHERE id = ?`, [...values, id], manager);
  }

  async deleteById(id: string, manager?: EntityManager): Promise<void> {
    await runQuery('DELETE FROM workflow_folders WHERE id = ?', [id], manager);
  }

  async reorder(ids: string[]): Promise<void> {
    await runInTransaction(async (manager) => {
      for (let index = 0; index < ids.length; index++) {
        await runQuery(
          'UPDATE workflow_folders SET sort_order = ? WHERE id = ?',
          [index, ids[index]],
          manager,
        );
      }
    });
  }
}
