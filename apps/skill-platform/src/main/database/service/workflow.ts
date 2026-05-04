import type { DCreateWorkflow, DUpdateWorkflow, IWorkflow } from '@/types/modules';
import { v4 as uuidv4 } from 'uuid';

import { WorkflowRepository } from '../repository/workflow';

const EMPTY_GRAPH = JSON.stringify({ nodes: [], edges: [] });

function rowToWorkflow(row: Record<string, unknown>): IWorkflow {
  return {
    id: String(row.id),
    name: String(row.name),
    graphJson: String(row.graph_json ?? row.graphJson ?? EMPTY_GRAPH),
    createdAt: Number(row.created_at ?? row.createdAt),
    updatedAt: Number(row.updated_at ?? row.updatedAt),
  };
}

/** 工作流 CRUD */
export class WorkflowService {
  private readonly repo = new WorkflowRepository();

  async create(data: DCreateWorkflow): Promise<IWorkflow> {
    const id = uuidv4();
    const now = Date.now();
    const graphJson = data.graphJson?.trim() ? data.graphJson : EMPTY_GRAPH;
    await this.repo.insert({
      id,
      name: data.name.trim() || 'Untitled',
      graph_json: graphJson,
      created_at: now,
      updated_at: now,
    });
    return (await this.getById(id))!;
  }

  async getById(id: string): Promise<IWorkflow | null> {
    const row = await this.repo.findById(id);
    return row ? rowToWorkflow(row) : null;
  }

  async getAll(): Promise<IWorkflow[]> {
    const rows = await this.repo.findAllOrdered();
    return rows.map((r) => rowToWorkflow(r));
  }

  async update(id: string, data: DUpdateWorkflow): Promise<IWorkflow | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const now = Date.now();
    const sets: string[] = ['updated_at = ?'];
    const values: unknown[] = [now];

    if (data.name !== undefined) {
      sets.push('name = ?');
      values.push(data.name.trim() || existing.name);
    }
    if (data.graphJson !== undefined) {
      sets.push('graph_json = ?');
      values.push(data.graphJson);
    }

    await this.repo.updateDynamic(sets.join(', '), values, id);
    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.getById(id);
    if (!existing) return false;
    await this.repo.deleteById(id);
    return true;
  }
}
