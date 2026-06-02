import type { IWorkflow } from '@/types/modules';

import { deleteWorkflowAgentDir } from '@renderer/services/workflow/agent-files';
import {
  deleteBusinessesByWorkflow,
  fetchBusinessList,
} from '@renderer/services/workflow/business';
import { deleteAllWorkflowBusinessChats } from '@renderer/services/workflow/chat-storage';

/** 删除工作流及其全部业务数据、产出目录与对话 */
export async function deleteWorkflowWithCleanup(workflow: IWorkflow): Promise<void> {
  const wfApi = window.api?.workflow;
  if (!wfApi?.delete) {
    throw new Error('当前环境不支持工作流持久化（需桌面端 SQLite）');
  }

  const businesses = await fetchBusinessList(workflow.id);
  const businessIds = businesses.map((item) => item.id);
  await wfApi.delete(workflow.id);
  await deleteBusinessesByWorkflow(workflow.id);
  await deleteWorkflowAgentDir(workflow.name);
  deleteAllWorkflowBusinessChats(workflow.id, businessIds, workflow.graphJson);
}
