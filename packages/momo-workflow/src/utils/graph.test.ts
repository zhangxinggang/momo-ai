import type { Edge, Node } from '@xyflow/react';
import { describe, expect, it } from 'vitest';

import {
  WORKFLOW_NODE_TYPE_PARALLEL,
  WORKFLOW_NODE_TYPE_WEBPAGE,
  type IWorkflowParallelNodeData,
  type IWorkflowWebpageNodeData,
} from '../types';
import {
  buildWorkflowResourceSteps,
  buildWorkflowSteps,
  createResourceNode,
  validateWorkflowGraph,
} from './graph';
import {
  createWebpageNode,
  isLeafNode,
  isResourceNode,
  isWebpageNode,
} from './parallel-graph';

function makeParallel(id: string, childIds: string[]): Node<IWorkflowParallelNodeData> {
  return {
    id,
    type: WORKFLOW_NODE_TYPE_PARALLEL,
    position: { x: 0, y: 0 },
    data: { label: '并行节点', childNodeIds: childIds },
  };
}

describe('buildWorkflowSteps', () => {
  it('单链无并行时输出 resource 步骤', () => {
    const a = createResourceNode({
      resourceKind: 'prompt',
      resourceId: 'p1',
      nodeName: 'A',
      nodeId: 'n-a',
    });
    const b = createResourceNode({
      resourceKind: 'skill',
      resourceId: 's1',
      nodeName: 'B',
      nodeId: 'n-b',
    });
    const edges: Edge[] = [{ id: 'e1', source: 'n-a', target: 'n-b' }];
    const result = buildWorkflowSteps([a, b], edges);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0]?.kind).toBe('resource');
    expect(result.steps[1]?.kind).toBe('resource');
  });

  it('A → Parallel(P1,P2) → B 展开为 3 个宏观步骤', () => {
    const a = createResourceNode({
      resourceKind: 'prompt',
      resourceId: 'p0',
      nodeName: 'A',
      nodeId: 'n-a',
    });
    const p1 = createResourceNode({
      resourceKind: 'prompt',
      resourceId: 'p1',
      nodeName: 'P1',
      nodeId: 'n-p1',
    });
    p1.parentId = 'n-par';
    p1.extent = 'parent';
    const p2 = createResourceNode({
      resourceKind: 'skill',
      resourceId: 's1',
      nodeName: 'P2',
      nodeId: 'n-p2',
    });
    p2.parentId = 'n-par';
    p2.extent = 'parent';
    const par = makeParallel('n-par', ['n-p1', 'n-p2']);
    const b = createResourceNode({
      resourceKind: 'prompt',
      resourceId: 'p2',
      nodeName: 'B',
      nodeId: 'n-b',
    });
    const edges: Edge[] = [
      { id: 'e1', source: 'n-a', target: 'n-par' },
      { id: 'e2', source: 'n-par', target: 'n-b' },
    ];
    const result = buildWorkflowSteps([a, p1, p2, par, b], edges);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.steps).toHaveLength(3);
    expect(result.steps[0]?.kind).toBe('resource');
    expect(result.steps[1]?.kind).toBe('parallel');
    if (result.steps[1]?.kind === 'parallel') {
      expect(result.steps[1].children).toHaveLength(2);
      expect(result.steps[1].children[0]?.nodeName).toBe('P1');
    }
    expect(result.steps[2]?.kind).toBe('resource');
  });
});

describe('buildWorkflowResourceSteps', () => {
  it('并行组展开为扁平资源步骤', () => {
    const a = createResourceNode({
      resourceKind: 'prompt',
      resourceId: 'p0',
      nodeName: 'A',
      nodeId: 'n-a',
    });
    const p1 = createResourceNode({
      resourceKind: 'prompt',
      resourceId: 'p1',
      nodeName: 'P1',
      nodeId: 'n-p1',
    });
    p1.parentId = 'n-par';
    const p2 = createResourceNode({
      resourceKind: 'skill',
      resourceId: 's1',
      nodeName: 'P2',
      nodeId: 'n-p2',
    });
    p2.parentId = 'n-par';
    const par = makeParallel('n-par', ['n-p1', 'n-p2']);
    const b = createResourceNode({
      resourceKind: 'prompt',
      resourceId: 'p2',
      nodeName: 'B',
      nodeId: 'n-b',
    });
    const edges: Edge[] = [
      { id: 'e1', source: 'n-a', target: 'n-par' },
      { id: 'e2', source: 'n-par', target: 'n-b' },
    ];
    const result = buildWorkflowResourceSteps([a, p1, p2, par, b], edges);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.steps.map((s) => s.nodeName)).toEqual(['A', 'P1', 'P2', 'B']);
  });
});

it('createWebpageNode 生成 webpageResource，isResourceNode 为 false', () => {
  const node = createWebpageNode({
    nodeId: 'n-web',
    nodeName: '文档页',
    url: 'https://example.com',
    remark: '说明',
  });
  expect(node.type).toBe(WORKFLOW_NODE_TYPE_WEBPAGE);
  expect(isWebpageNode(node)).toBe(true);
  expect(isResourceNode(node)).toBe(false);
  expect(isLeafNode(node)).toBe(true);
  expect((node.data as IWorkflowWebpageNodeData).url).toBe('https://example.com');
});

it('顶层网页节点进入 buildWorkflowSteps', () => {
  const web = createWebpageNode({
    nodeId: 'n-web',
    nodeName: 'Web',
    url: 'https://example.com',
  });
  const result = buildWorkflowSteps([web], []);
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.steps).toHaveLength(1);
  expect(result.steps[0]?.kind).toBe('resource');
  if (result.steps[0]?.kind !== 'resource') return;
  expect(result.steps[0].step.resourceKind).toBe('webpage');
  expect(result.steps[0].step.url).toBe('https://example.com');
  expect(result.steps[0].step.resourceId).toBe('');
});

it('并行组内网页子节点出现在 children', () => {
  const web = createWebpageNode({
    nodeId: 'n-web',
    nodeName: 'Web',
    url: 'https://a.com',
  });
  web.parentId = 'n-par';
  web.extent = 'parent';
  const skill = createResourceNode({
    resourceKind: 'skill',
    resourceId: 's1',
    nodeName: 'S',
    nodeId: 'n-s',
  });
  skill.parentId = 'n-par';
  skill.extent = 'parent';
  const par = makeParallel('n-par', ['n-web', 'n-s']);
  const result = buildWorkflowSteps([web, skill, par], []);
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.steps[0]?.kind).toBe('parallel');
  if (result.steps[0]?.kind !== 'parallel') return;
  expect(result.steps[0].children.map((c) => c.resourceKind)).toEqual(['webpage', 'skill']);
});

describe('validateWorkflowGraph', () => {
  it('子节点对外连线时校验失败', () => {
    const par = makeParallel('n-par', ['n-p1']);
    const p1 = createResourceNode({
      resourceKind: 'prompt',
      resourceId: 'p1',
      nodeName: 'P1',
      nodeId: 'n-p1',
    });
    p1.parentId = 'n-par';
    const b = createResourceNode({
      resourceKind: 'prompt',
      resourceId: 'p2',
      nodeName: 'B',
      nodeId: 'n-b',
    });
    const edges: Edge[] = [{ id: 'e1', source: 'n-p1', target: 'n-b' }];
    const result = validateWorkflowGraph([par, p1, b], edges);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('不能对外连线');
  });

  it('宏观链 A → Parallel → B 校验通过', () => {
    const a = createResourceNode({
      resourceKind: 'prompt',
      resourceId: 'p0',
      nodeName: 'A',
      nodeId: 'n-a',
    });
    const p1 = createResourceNode({
      resourceKind: 'prompt',
      resourceId: 'p1',
      nodeName: 'P1',
      nodeId: 'n-p1',
    });
    p1.parentId = 'n-par';
    const par = makeParallel('n-par', ['n-p1']);
    const b = createResourceNode({
      resourceKind: 'prompt',
      resourceId: 'p2',
      nodeName: 'B',
      nodeId: 'n-b',
    });
    const edges: Edge[] = [
      { id: 'e1', source: 'n-a', target: 'n-par' },
      { id: 'e2', source: 'n-par', target: 'n-b' },
    ];
    const result = validateWorkflowGraph([a, p1, par, b], edges);
    expect(result.ok).toBe(true);
  });
});
