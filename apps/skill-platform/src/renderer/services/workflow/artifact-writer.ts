import {
  parseSkillArtifacts,
  type ISkillArtifactFile,
} from '@renderer/services/skill/skill-artifacts';
import { writeWorkflowNodeArtifacts } from './agent-files';

/** 从模型回复解析 artifact 并写入工作流节点目录 */
export async function persistWorkflowArtifactsFromReply(
  workflowName: string,
  nodeName: string,
  reply: string,
): Promise<string[]> {
  const artifacts = parseSkillArtifacts(reply);
  if (artifacts.length === 0) {
    return [];
  }
  return writeWorkflowNodeArtifacts(workflowName, nodeName, artifacts);
}

export type { ISkillArtifactFile };
