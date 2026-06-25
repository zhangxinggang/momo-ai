import {
  isLeafNode,
  isWebpageNode,
  parseWorkflowGraphJson,
  type IWorkflowResourceNodeData,
  type IWorkflowWebpageNodeData,
} from '@momo/workflow';
import type { Node } from '@xyflow/react';

export interface IWorkflowNodeTag {
  name: string;
  resourceKind: 'prompt' | 'skill' | 'webpage';
}

/** 从 graphJson 提取叶子节点名称与类型标签（含网页） */
export function getWorkflowNodeTags(graphJson: string): IWorkflowNodeTag[] {
  const { nodes } = parseWorkflowGraphJson(graphJson);
  return nodes.filter(isLeafNode).map((n) => {
    if (isWebpageNode(n)) {
      const d = n.data as IWorkflowWebpageNodeData;
      return {
        name: d.nodeName?.trim() || d.label?.trim() || '网页节点',
        resourceKind: 'webpage' as const,
      };
    }
    const d = n.data as IWorkflowResourceNodeData;
    return {
      name: d.nodeName?.trim() || d.label?.trim() || d.resourceId,
      resourceKind: d.resourceKind as 'prompt' | 'skill',
    };
  });
}

/** 统计可执行叶子节点数量（资源 + 网页） */
export function countWorkflowResourceNodes(graphJson: string): number {
  const { nodes } = parseWorkflowGraphJson(graphJson);
  return nodes.filter(isLeafNode).length;
}

export function isResourceNode(node: Node): node is Node<IWorkflowResourceNodeData> {
  const d = node.data as IWorkflowResourceNodeData | undefined;
  return (
    !!d &&
    (d.resourceKind === 'prompt' || d.resourceKind === 'skill') &&
    typeof d.resourceId === 'string'
  );
}
