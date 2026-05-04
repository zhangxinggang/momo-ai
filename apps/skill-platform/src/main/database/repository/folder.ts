import type { EntityManager } from 'typeorm';

import { runInTransaction, runQuery } from './sql-runner';

/** folders 表数据访问 */
export class FolderRepository {
  async maxSortOrder(parentId: string | null): Promise<number | null> {
    const rows = await runQuery<{ max: number | null }[]>(
      'SELECT MAX(sort_order) as max FROM folders WHERE parent_id IS ?',
      [parentId],
    );
    const row = Array.isArray(rows) ? rows[0] : rows;
    return row?.max ?? null;
  }

  async insert(
    id: string,
    name: string,
    icon: string | null,
    parentId: string | null,
    sortOrder: number,
    isPrivate: number,
    createdAt: number,
    updatedAt: number,
    manager?: EntityManager,
  ): Promise<void> {
    await runQuery(
      `INSERT INTO folders (id, name, icon, parent_id, sort_order, is_private, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, icon, parentId, sortOrder, isPrivate, createdAt, updatedAt],
      manager,
    );
  }

  async findById(id: string): Promise<Record<string, unknown> | undefined> {
    const rows = await runQuery<Record<string, unknown>[]>('SELECT * FROM folders WHERE id = ?', [
      id,
    ]);
    return Array.isArray(rows) ? rows[0] : undefined;
  }

  async findAllOrdered(): Promise<Record<string, unknown>[]> {
    const rows = await runQuery<Record<string, unknown>[]>(
      'SELECT * FROM folders ORDER BY sort_order ASC',
    );
    return Array.isArray(rows) ? rows : [];
  }

  async updateDynamic(sets: string, values: unknown[], manager?: EntityManager): Promise<void> {
    await runQuery(`UPDATE folders SET ${sets}`, values, manager);
  }

  async deleteById(id: string): Promise<{ affected?: number }> {
    return runQuery('DELETE FROM folders WHERE id = ?', [id]);
  }

  async reorder(ids: string[]): Promise<void> {
    await runInTransaction(async (manager) => {
      for (let index = 0; index < ids.length; index++) {
        await runQuery(
          'UPDATE folders SET sort_order = ? WHERE id = ?',
          [index, ids[index]],
          manager,
        );
      }
    });
  }

  async upsertDirect(
    row: {
      id: string;
      name: string;
      icon: string | null;
      parent_id: string | null;
      sort_order: number;
      is_private: number;
      created_at: number;
      updated_at: number;
    },
    manager?: EntityManager,
  ): Promise<void> {
    await runQuery(
      `INSERT OR REPLACE INTO folders (
          id, name, icon, parent_id, sort_order, is_private, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.name,
        row.icon,
        row.parent_id,
        row.sort_order,
        row.is_private,
        row.created_at,
        row.updated_at,
      ],
      manager,
    );
  }
}
