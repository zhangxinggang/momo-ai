import type { EntityManager } from 'typeorm';

import { runQuery } from './sql-runner';

/** workflow_businesses 表访问 */
export class WorkflowBusinessRepository {
  async insert(
    params: {
      id: string;
      workflow_id: string;
      name: string;
      remark: string;
      created_at: number;
      updated_at: number;
    },
    manager?: EntityManager,
  ): Promise<void> {
    await runQuery(
      `INSERT INTO workflow_businesses (id, workflow_id, name, remark, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        params.id,
        params.workflow_id,
        params.name,
        params.remark,
        params.created_at,
        params.updated_at,
      ],
      manager,
    );
  }

  async findById(id: string): Promise<Record<string, unknown> | undefined> {
    const rows = await runQuery<Record<string, unknown>[]>(
      'SELECT * FROM workflow_businesses WHERE id = ?',
      [id],
    );
    return Array.isArray(rows) ? rows[0] : undefined;
  }

  async findByWorkflowId(workflowId: string): Promise<Record<string, unknown>[]> {
    const rows = await runQuery<Record<string, unknown>[]>(
      'SELECT * FROM workflow_businesses WHERE workflow_id = ? ORDER BY updated_at DESC',
      [workflowId],
    );
    return Array.isArray(rows) ? rows : [];
  }

  async countByWorkflowId(workflowId: string): Promise<number> {
    const rows = await runQuery<{ count: number }[]>(
      'SELECT COUNT(*) as count FROM workflow_businesses WHERE workflow_id = ?',
      [workflowId],
    );
    const row = Array.isArray(rows) ? rows[0] : undefined;
    return Number(row?.count ?? 0);
  }

  async updateDynamic(
    setsSql: string,
    values: unknown[],
    id: string,
    manager?: EntityManager,
  ): Promise<void> {
    await runQuery(
      `UPDATE workflow_businesses SET ${setsSql} WHERE id = ?`,
      [...values, id],
      manager,
    );
  }

  async deleteById(id: string, manager?: EntityManager): Promise<void> {
    await runQuery('DELETE FROM workflow_businesses WHERE id = ?', [id], manager);
  }

  async deleteByWorkflowId(workflowId: string, manager?: EntityManager): Promise<void> {
    await runQuery('DELETE FROM workflow_businesses WHERE workflow_id = ?', [workflowId], manager);
  }
}
