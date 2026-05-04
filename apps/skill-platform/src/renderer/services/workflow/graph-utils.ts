import { parseWorkflowGraphJson, type IWorkflowResourceNodeData } from '@momo/workflow';
import type { Node } from '@xyflow/react';

export interface IWorkflowNodeTag {
  name: string;
  resourceKind: 'prompt' | 'skill';
}

/** 从 graphJson 提取资源节点名称与类型标签 */
export function getWorkflowNodeTags(graphJson: string): IWorkflowNodeTag[] {
  const { nodes } = parseWorkflowGraphJson(graphJson);
  return nodes
    .filter((n) => {
      const d = n.data as IWorkflowResourceNodeData | undefined;
      return d && (d.resourceKind === 'prompt' || d.resourceKind === 'skill');
    })
    .map((n) => {
      const d = n.data as IWorkflowResourceNodeData;
      return {
        name: d.nodeName?.trim() || d.label?.trim() || d.resourceId,
        resourceKind: d.resourceKind as 'prompt' | 'skill',
      };
    });
}

/** 统计资源节点数量 */
export function countWorkflowResourceNodes(graphJson: string): number {
  const { nodes } = parseWorkflowGraphJson(graphJson);
  return nodes.filter((n) => {
    const d = n.data as IWorkflowResourceNodeData | undefined;
    return d && (d.resourceKind === 'prompt' || d.resourceKind === 'skill');
  }).length;
}

export function isResourceNode(node: Node): node is Node<IWorkflowResourceNodeData> {
  const d = node.data as IWorkflowResourceNodeData | undefined;
  return (
    !!d &&
    (d.resourceKind === 'prompt' || d.resourceKind === 'skill') &&
    typeof d.resourceId === 'string'
  );
}
