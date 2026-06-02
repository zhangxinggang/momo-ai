import type { EntityManager } from 'typeorm';

import { runQuery } from './sql-runner';

/** workflows 表访问 */
export class WorkflowRepository {
  async insert(
    params: {
      id: string;
      name: string;
      graph_json: string;
      folder_id: string | null;
      created_at: number;
      updated_at: number;
    },
    manager?: EntityManager,
  ): Promise<void> {
    await runQuery(
      `INSERT INTO workflows (id, name, graph_json, folder_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        params.id,
        params.name,
        params.graph_json,
        params.folder_id,
        params.created_at,
        params.updated_at,
      ],
      manager,
    );
  }

  async findById(id: string): Promise<Record<string, unknown> | undefined> {
    const rows = await runQuery<Record<string, unknown>[]>('SELECT * FROM workflows WHERE id = ?', [
      id,
    ]);
    return Array.isArray(rows) ? rows[0] : undefined;
  }

  async findAllOrdered(): Promise<Record<string, unknown>[]> {
    const rows = await runQuery<Record<string, unknown>[]>(
      'SELECT * FROM workflows ORDER BY updated_at DESC',
    );
    return Array.isArray(rows) ? rows : [];
  }

  async updateDynamic(
    setsSql: string,
    values: unknown[],
    id: string,
    manager?: EntityManager,
  ): Promise<void> {
    await runQuery(`UPDATE workflows SET ${setsSql} WHERE id = ?`, [...values, id], manager);
  }

  async deleteById(id: string, manager?: EntityManager): Promise<void> {
    await runQuery('DELETE FROM workflows WHERE id = ?', [id], manager);
  }
}
