import type {
  DCreateWorkflowBusiness,
  DUpdateWorkflowBusiness,
  IWorkflowBusiness,
} from '@/types/modules';
import { v4 as uuidv4 } from 'uuid';

import { WorkflowBusinessRepository } from '../repository/workflow-business';

function rowToBusiness(row: Record<string, unknown>): IWorkflowBusiness {
  return {
    id: String(row.id),
    workflowId: String(row.workflow_id ?? row.workflowId),
    name: String(row.name),
    remark: String(row.remark ?? ''),
    createdAt: Number(row.created_at ?? row.createdAt),
    updatedAt: Number(row.updated_at ?? row.updatedAt),
  };
}

/** 工作流业务实例 CRUD */
export class WorkflowBusinessService {
  private readonly repo = new WorkflowBusinessRepository();

  async create(data: DCreateWorkflowBusiness): Promise<IWorkflowBusiness> {
    const id = uuidv4();
    const now = Date.now();
    const name = data.name.trim();
    const remark = data.remark?.trim() ?? '';
    await this.repo.insert({
      id,
      workflow_id: data.workflowId,
      name,
      remark,
      created_at: now,
      updated_at: now,
    });
    return (await this.getById(id))!;
  }

  async getById(id: string): Promise<IWorkflowBusiness | null> {
    const row = await this.repo.findById(id);
    return row ? rowToBusiness(row) : null;
  }

  async getAllByWorkflowId(workflowId: string): Promise<IWorkflowBusiness[]> {
    const rows = await this.repo.findByWorkflowId(workflowId);
    return rows.map((r) => rowToBusiness(r));
  }

  async hasAny(workflowId: string): Promise<boolean> {
    return (await this.repo.countByWorkflowId(workflowId)) > 0;
  }

  async update(id: string, data: DUpdateWorkflowBusiness): Promise<IWorkflowBusiness | null> {
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
    if (data.remark !== undefined) {
      sets.push('remark = ?');
      values.push(data.remark.trim());
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

  async deleteByWorkflowId(workflowId: string): Promise<void> {
    await this.repo.deleteByWorkflowId(workflowId);
  }
}
