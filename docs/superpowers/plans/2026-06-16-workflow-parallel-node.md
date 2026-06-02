# 工作流并行节点 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在工作流 Studio 支持并行容器节点（拖入收纳游离资源节点），执行页将并行组作为宏观步骤展示，下游节点通过 Tab 查看并全量合并并行上游上下文。

**Architecture:** 在 `@momo/workflow` 用 React Flow `parentId` 实现并行容器；`graph.ts` 扩展宏观拓扑校验与 `buildWorkflowSteps`；skill-platform 执行层以「宏观步骤 + 组内子节点索引」导航，步骤条 hover Popover 不增高度。

**Tech Stack:** `@xyflow/react` 12、React 19、Ant Design 6、Less CSS Module、`@momo/workflow`、vitest（仅 graph 单测）

**Spec:** [2026-06-16-workflow-parallel-node-design.md](../specs/2026-06-16-workflow-parallel-node-design.md)

---

## 文件结构概览

| 区域 | 新建 | 修改 |
|------|------|------|
| `@momo/workflow` 类型 | — | `src/types.ts` |
| `@momo/workflow` 图算法 | `src/utils/parallel-graph.ts` | `src/utils/graph.ts` |
| `@momo/workflow` 组件 | `src/components/ParallelGroupNode/index.tsx`, `index.module.less` | `src/components/WorkflowEditor/index.tsx`, `ResourceNode/index.tsx` |
| `@momo/workflow` 测试 | `src/utils/graph.test.ts`, `vitest.config.ts` | `package.json` |
| `@momo/workflow` 导出 | — | `src/index.ts` |
| Studio | — | `WorkflowStudio/index.tsx`, `index.module.less` |
| 执行页 | `services/workflow/step-model.ts`, `services/workflow/parallel-context.ts` | `WorkflowWorkPage/index.tsx`, `WorkflowStepsBar/index.tsx`, `index.module.less`, `WorkflowNodeChat/index.tsx`, `index.module.less`, `constants.ts` |
| 业务列表预览 | — | `WorkflowBusinessListView/index.tsx` |
| 服务 re-export | — | `services/workflow/topological-sort.ts`, `services/workflow/index.ts` |

---

### Task 1: 并行节点类型与 vitest 脚手架

**Files:**
- Modify: `packages/momo-workflow/package.json`
- Modify: `packages/momo-workflow/src/types.ts`
- Create: `packages/momo-workflow/vitest.config.ts`

- [ ] **Step 1: 在 `package.json` 增加 vitest 脚本**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 2: 创建 vitest 配置**

```typescript
// packages/momo-workflow/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: 扩展 types.ts**

在 `packages/momo-workflow/src/types.ts` 追加：

```typescript
export const WORKFLOW_NODE_TYPE_PARALLEL = 'parallelGroup';

export interface IWorkflowParallelNodeData extends Record<string, unknown> {
  label?: string;
  nodeName?: string;
  childNodeIds: string[];
}

// IWorkflowPaletteDragPayload.kind 增加 'parallel'
export interface IWorkflowPaletteDragPayload {
  kind: 'prompt' | 'skill' | 'start' | 'end' | 'parallel';
  resourceId?: string;
  label?: string;
}
```

- [ ] **Step 4: 安装依赖并验证 vitest 可运行**

```bash
cd packages/momo-workflow && pnpm install && pnpm test
```

Expected: 无测试文件时 vitest 退出码 0 或提示 no tests（下一步添加测试）

---

### Task 2: 图算法 — buildWorkflowSteps（TDD）

**Files:**
- Create: `packages/momo-workflow/src/utils/parallel-graph.ts`
- Modify: `packages/momo-workflow/src/utils/graph.ts`
- Create: `packages/momo-workflow/src/utils/graph.test.ts`

- [ ] **Step 1: 编写失败测试**

```typescript
// packages/momo-workflow/src/utils/graph.test.ts
import type { Edge, Node } from '@xyflow/react';
import { describe, expect, it } from 'vitest';

import {
  WORKFLOW_NODE_TYPE_PARALLEL,
  type IWorkflowParallelNodeData,
  type IWorkflowResourceNodeData,
} from '../types';
import { buildWorkflowSteps, createResourceNode } from './graph';

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
    if (!result.ok) return;
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].kind).toBe('resource');
    expect(result.steps[1].kind).toBe('resource');
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
    if (!result.ok) return;
    expect(result.steps).toHaveLength(3);
    expect(result.steps[0].kind).toBe('resource');
    expect(result.steps[1].kind).toBe('parallel');
    if (result.steps[1].kind === 'parallel') {
      expect(result.steps[1].children).toHaveLength(2);
      expect(result.steps[1].children[0].nodeName).toBe('P1');
    }
    expect(result.steps[2].kind).toBe('resource');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd packages/momo-workflow && pnpm test
```

Expected: FAIL — `buildWorkflowSteps is not exported` 或 `not a function`

- [ ] **Step 3: 实现 parallel-graph 辅助函数**

```typescript
// packages/momo-workflow/src/utils/parallel-graph.ts
import type { Edge, Node } from '@xyflow/react';

import {
  WORKFLOW_NODE_TYPE_PARALLEL,
  type IWorkflowParallelNodeData,
  type IWorkflowResourceNodeData,
} from '../types';

export function isParallelNode(
  node: Node,
): node is Node<IWorkflowParallelNodeData> {
  return node.type === WORKFLOW_NODE_TYPE_PARALLEL;
}

export function isResourceNode(node: Node): node is Node<IWorkflowResourceNodeData> {
  const d = node.data as IWorkflowResourceNodeData | undefined;
  return (
    !!d &&
    (d.resourceKind === 'prompt' || d.resourceKind === 'skill') &&
    typeof d.resourceId === 'string' &&
    d.resourceId.length > 0
  );
}

/** 宏观图节点：无 parentId 的资源节点 + 并行容器 */
export function getMacroNodes(nodes: Node[]): Node[] {
  return nodes.filter((n) => {
    if (isParallelNode(n)) return true;
    if (isResourceNode(n) && !n.parentId) return true;
    return false;
  });
}

export function isFreeResourceNode(nodes: Node[], edges: Edge[], nodeId: string): boolean {
  const hasEdge = edges.some((e) => e.source === nodeId || e.target === nodeId);
  if (hasEdge) return false;
  const node = nodes.find((n) => n.id === nodeId);
  return !!node && isResourceNode(node) && !node.parentId;
}

export function createParallelNode(params?: {
  label?: string;
  nodeName?: string;
  position?: { x: number; y: number };
  nodeId?: string;
}): Node<IWorkflowParallelNodeData> {
  const id = params?.nodeId ?? `wf-par-${crypto.randomUUID()}`;
  return {
    id,
    type: WORKFLOW_NODE_TYPE_PARALLEL,
    position: params?.position ?? { x: 200, y: 120 },
    data: {
      label: params?.label ?? '并行节点',
      nodeName: params?.nodeName,
      childNodeIds: [],
    },
    style: { width: 280, height: 160 },
  };
}
```

- [ ] **Step 4: 在 graph.ts 追加步骤类型与 buildWorkflowSteps**

```typescript
// graph.ts 追加类型
export interface IWorkflowParallelStep {
  kind: 'parallel';
  nodeId: string;
  nodeName: string;
  label?: string;
  children: IWorkflowResourceStep[];
}

export interface IWorkflowSingleStep {
  kind: 'resource';
  step: IWorkflowResourceStep;
}

export type IWorkflowStep = IWorkflowParallelStep | IWorkflowSingleStep;

export function buildWorkflowSteps(
  nodes: Node[],
  edges: Edge[],
): { ok: true; steps: IWorkflowStep[] } | { ok: false; error: 'graphCycle' } {
  const macroNodes = getMacroNodes(nodes);
  // 对 macroNodes 复用现有 Kahn 拓扑（参照 buildWorkflowResourceSteps）
  // 遇到 parallel 节点：从 data.childNodeIds 按序映射为 IWorkflowResourceStep[]
  // 遇到 resource 节点：包装为 { kind: 'resource', step }
  // parallel 仅 1 个子节点时仍输出 kind:'parallel'（执行层决定是否退化展示）
}

/** 并行组是否全部子节点产出就绪 */
export function isParallelGroupOutputReady(
  children: IWorkflowResourceStep[],
  runResults: Record<string, string>,
  nodeHasFiles: Record<string, boolean>,
): boolean {
  return children.every((child) => {
    const hasRunResult = !!runResults[child.nodeId]?.trim();
    const hasFiles = nodeHasFiles[child.nodeId] ?? false;
    return hasRunResult && hasFiles;
  });
}
```

实现细节：`buildWorkflowSteps` 内部将 `isResourceNode` / 拓扑逻辑从现有 `buildWorkflowResourceSteps` 提取，宏观边过滤为 `source/target` 均属于 macro 节点 id 集合。`buildWorkflowResourceSteps` 改为调用 `buildWorkflowSteps` 并 flatMap 为旧格式（兼容只读预览）。

- [ ] **Step 5: 运行测试**

```bash
cd packages/momo-workflow && pnpm test
```

Expected: PASS

---

### Task 3: 图校验 validateWorkflowGraph（TDD）

**Files:**
- Modify: `packages/momo-workflow/src/utils/graph.ts`
- Modify: `packages/momo-workflow/src/utils/graph.test.ts`

- [ ] **Step 1: 追加失败测试**

```typescript
import { validateWorkflowGraph } from './graph';

describe('validateWorkflowGraph', () => {
  it('子节点对外连线时校验失败', () => {
    // par 含 p1；edges 含 p1 → b
    const result = validateWorkflowGraph(nodes, edges);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('不能对外连线');
  });

  it('宏观链 A → Parallel → B 校验通过', () => {
    const result = validateWorkflowGraph(nodes, edges);
    expect(result.ok).toBe(true);
  });
});
```

- [ ] **Step 2: 运行确认 FAIL**

```bash
cd packages/momo-workflow && pnpm test
```

- [ ] **Step 3: 实现 validateWorkflowGraph**

```typescript
export interface IWorkflowGraphValidation {
  ok: boolean;
  message?: string;
}

export function validateWorkflowGraph(
  nodes: Node[],
  edges: Edge[],
): IWorkflowGraphValidation {
  // 1. 每个 parallel 的 childNodeIds 与 parentId 双向一致
  // 2. 子节点（有 parentId 的资源节点）不得出现在任何 edge 的 source/target
  // 3. 宏观节点调用 validateWorkflowResourceChain 等价逻辑（可内联或复用 macro 节点+边）
  // 4. 并行容器 childNodeIds 中的 id 必须存在且为资源节点
}

// validateWorkflowResourceChain 保留，内部转调 validateWorkflowGraph 或共享 macro 校验
```

- [ ] **Step 4: 运行测试 PASS**

```bash
cd packages/momo-workflow && pnpm test
```

---

### Task 4: ParallelGroupNode 组件

**Files:**
- Create: `packages/momo-workflow/src/components/ParallelGroupNode/index.tsx`
- Create: `packages/momo-workflow/src/components/ParallelGroupNode/index.module.less`

- [ ] **Step 1: 实现空态与 filled 态 UI**

```tsx
// index.tsx 核心结构
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { memo, useCallback, useState } from 'react';
import type { Node } from '@xyflow/react';
import type { IWorkflowParallelNodeData } from '../../types';
import styles from './index.module.less';

function ParallelGroupNodeInner({ id, data }: NodeProps<Node<IWorkflowParallelNodeData>>) {
  const { getNodes, getEdges, setNodes } = useReactFlow();
  const [dropState, setDropState] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const isEmpty = (data.childNodeIds?.length ?? 0) === 0;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 从 dataTransfer 或 react flow node drag 判断
    // 若拖拽的是已连线节点 → setDropState('invalid')
    // 若拖拽的是游离资源节点 → setDropState('valid')
  }, [getEdges, getNodes]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 调用 setNodes 更新 child parentId + childNodeIds
    setDropState('idle');
  }, [id, setNodes]);

  return (
    <div
      className={clsx(styles['parallel-group'], {
        [styles['parallel-group--drop-valid']]: dropState === 'valid',
        [styles['parallel-group--drop-invalid']]: dropState === 'invalid',
      })}
      onDragLeave={() => setDropState('idle')}
      onDragOver={handleDragOver}
      onDrop={handleDrop}>
      <Handle className={styles['parallel-group-handle']} position={Position.Top} type='target' />
      <div className={styles['parallel-group-header']}>{data.label ?? '并行节点'}</div>
      <div className={styles['parallel-group-body']}>
        {isEmpty ? (
          <div className={styles['parallel-group-placeholder']}>{'请拖入节点'}</div>
        ) : null}
      </div>
      <Handle className={styles['parallel-group-handle']} position={Position.Bottom} type='source' />
    </div>
  );
}

export const ParallelGroupNode = memo(ParallelGroupNodeInner);
```

- [ ] **Step 2: 样式（虚线框、valid/invalid 态）**

```less
// index.module.less
.parallel-group {
  width: 100%;
  height: 100%;
  border: 2px dashed hsl(var(--border));
  border-radius: 12px;
  background: hsl(var(--card) / 0.6);

  &--drop-valid {
    border-color: hsl(var(--primary));
    background: hsl(var(--primary) / 0.08);
  }

  &--drop-invalid {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.parallel-group-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72px;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}
```

- [ ] **Step 3: 子节点拖入后更新容器 style.width/height**

在 `handleDrop` 末尾根据子节点数量计算最小宽高（约每子节点 180×80 + padding），写回 parallel 节点的 `style` 与 `data.childNodeIds`。

---

### Task 5: WorkflowEditor 连线约束与节点拖入/拖出

**Files:**
- Modify: `packages/momo-workflow/src/components/WorkflowEditor/index.tsx`
- Modify: `packages/momo-workflow/src/components/ResourceNode/index.tsx`
- Modify: `packages/momo-workflow/src/context.ts`

- [ ] **Step 1: 注册 ParallelGroupNode 到 builtInNodeTypes**

```typescript
import { ParallelGroupNode } from '../ParallelGroupNode';

const builtInNodeTypes = {
  ...existing,
  [WORKFLOW_NODE_TYPE_PARALLEL]: memo(ParallelGroupNode),
};
```

- [ ] **Step 2: handleConnect 拒绝子节点连线**

```typescript
const handleConnect = useCallback((params: Connection) => {
  if (readOnly) return;
  const sourceNode = nodes.find((n) => n.id === params.source);
  const targetNode = nodes.find((n) => n.id === params.target);
  if (sourceNode?.parentId || targetNode?.parentId) return;
  // 原有 1入1出 逻辑不变
}, [edges, nodes, readOnly, setEdges]);
```

- [ ] **Step 3: onNodeDragStop — 子节点拖出容器**

```typescript
// WorkflowEditor 增加 onNodeDragStop
onNodeDragStop={(_, node) => {
  if (!node.parentId || readOnly) return;
  const parent = nodes.find((n) => n.id === node.parentId);
  if (!parent) return;
  // 若 node.position 超出 parent 边界 → 清除 parentId，从 childNodeIds 移除
}}
```

- [ ] **Step 4: 子节点隐藏对外 Handle**

在 `ResourceNode/index.tsx`：当 `node.parentId` 存在时，不渲染 Top/Bottom Handle。

- [ ] **Step 5: context 扩展（可选）onParallelChildDrop**

若 ParallelGroupNode 内 drop 逻辑过重，可在 context 注入 `attachNodeToParallel(parallelId, childId)` 由 Editor 统一更新 nodes/edges。

---

### Task 6: 导出新 API

**Files:**
- Modify: `packages/momo-workflow/src/index.ts`

- [ ] **Step 1: 导出类型与函数**

```typescript
export { ParallelGroupNode } from './components/ParallelGroupNode';
export {
  WORKFLOW_NODE_TYPE_PARALLEL,
  type IWorkflowParallelNodeData,
} from './types';
export {
  buildWorkflowSteps,
  createParallelNode,
  isParallelGroupOutputReady,
  validateWorkflowGraph,
  type IWorkflowParallelStep,
  type IWorkflowSingleStep,
  type IWorkflowStep,
  type IWorkflowGraphValidation,
} from './utils/graph';
export {
  isFreeResourceNode,
  isParallelNode,
  isResourceNode,
} from './utils/parallel-graph';
```

- [ ] **Step 2: 确认 skill-platform 可解析新导出**

```bash
pnpm --filter skill-platform exec tsc --noEmit
```

若 skill-platform 包名不同，改用 `pnpm --filter @momo/skill-platform` 或 apps 内实际 package name。

---

### Task 7: WorkflowStudio — 侧栏与画布集成

**Files:**
- Modify: `apps/skill-platform/src/renderer/components/Workflow/WorkflowStudio/index.tsx`
- Modify: `apps/skill-platform/src/renderer/components/Workflow/WorkflowStudio/index.module.less`

- [ ] **Step 1: 侧栏「组件」区块（位于提示词上方）**

```tsx
<Typography.Text className={styles['workflow-studio-palette-title']}>
  {'组件'}
</Typography.Text>
<ul className={styles['workflow-studio-palette-list']}>
  <li>
    <div
      className={`${styles['workflow-studio-palette-item']} ${styles['workflow-studio-palette-item--draggable']}`}
      draggable
      onDragStart={(e) =>
        setPaletteDragData(e, { kind: 'parallel', label: '并行节点' })
      }>
      {'并行节点'}
    </div>
  </li>
</ul>
```

- [ ] **Step 2: handleCanvasDrop 处理 parallel**

```typescript
if (dragData.kind === 'parallel') {
  setNodes((nds) => [
    ...nds,
    createParallelNode({ position: flowPosition, label: '并行节点' }),
  ]);
  return;
}
```

- [ ] **Step 3: performSave 改用 validateWorkflowGraph**

```typescript
const chainValidation = validateWorkflowGraph(nodes, edges);
```

- [ ] **Step 4: 删除并行容器时清理子节点**

在 `handleNodeDelete` / `removeNodeById` 逻辑：若删除 parallel 节点，同时从 nodes 移除其 `childNodeIds` 对应节点。

- [ ] **Step 5: panelHint 文案更新**

`'点击节点编辑属性；并行节点可拖入未连线节点'`

---

### Task 8: 执行层步骤 ViewModel

**Files:**
- Create: `apps/skill-platform/src/renderer/services/workflow/step-model.ts`
- Create: `apps/skill-platform/src/renderer/services/workflow/parallel-context.ts`
- Modify: `apps/skill-platform/src/renderer/services/workflow/topological-sort.ts`
- Modify: `apps/skill-platform/src/renderer/services/workflow/index.ts`

- [ ] **Step 1: step-model.ts — 宏观步骤 ViewModel**

```typescript
import type { IWorkflowStep, IWorkflowResourceStep } from '@momo/workflow';
import type { Node } from '@xyflow/react';
import type { IWorkflowResourceNodeData } from '@momo/workflow';

export interface IResourceStepViewModel extends IWorkflowResourceStep {
  kind: 'resource';
  node: Node<IWorkflowResourceNodeData>;
}

export interface IParallelStepViewModel {
  kind: 'parallel';
  nodeId: string;
  nodeName: string;
  label?: string;
  children: Array<IWorkflowResourceStep & { node: Node<IWorkflowResourceNodeData> }>;
}

export type IMacroStepViewModel = IResourceStepViewModel | IParallelStepViewModel;

export function buildMacroStepViewModels(
  steps: IWorkflowStep[],
  nodeMap: Map<string, Node<IWorkflowResourceNodeData>>,
): IMacroStepViewModel[] {
  return steps.flatMap((step) => {
    if (step.kind === 'resource') {
      const node = nodeMap.get(step.step.nodeId);
      if (!node) return [];
      return [{ kind: 'resource' as const, ...step.step, node }];
    }
    const children = step.children
      .map((child) => {
        const node = nodeMap.get(child.nodeId);
        if (!node) return null;
        return { ...child, node };
      })
      .filter(Boolean);
    if (children.length === 0) return [];
    if (children.length === 1) {
      const only = children[0]!;
      return [{ kind: 'resource' as const, ...only, node: only.node }];
    }
    return [
      {
        kind: 'parallel' as const,
        nodeId: step.nodeId,
        nodeName: step.nodeName,
        label: step.label,
        children,
      },
    ];
  });
}

/** 当前宏观步骤内激活的资源子节点 */
export function resolveActiveResourceStep(
  macroSteps: IMacroStepViewModel[],
  macroIndex: number,
  parallelChildIndex: number,
): IResourceStepViewModel | null {
  const macro = macroSteps[macroIndex];
  if (!macro) return null;
  if (macro.kind === 'resource') {
    return macro;
  }
  const child = macro.children[parallelChildIndex];
  if (!child) return null;
  return { kind: 'resource', ...child, node: child.node };
}
```

- [ ] **Step 2: parallel-context.ts — 合并上游上下文**

```typescript
export interface IParallelPreviousResultItem {
  nodeId: string;
  nodeName: string;
  content: string;
}

export function buildMergedParallelContext(items: IParallelPreviousResultItem[]): string {
  return items
    .filter((item) => item.content.trim())
    .map((item) => `--- 并行上游 · ${item.nodeName} ---\n${item.content.trim()}`)
    .join('\n\n');
}

export function getPreviousContextForActiveStep(params: {
  macroSteps: IMacroStepViewModel[];
  macroIndex: number;
  runResults: Record<string, string>;
}): {
  previousNodeRunResult: { nodeName: string; content: string } | null;
  previousParallelResults: IParallelPreviousResultItem[] | null;
} {
  const { macroSteps, macroIndex, runResults } = params;
  if (macroIndex <= 0) {
    return { previousNodeRunResult: null, previousParallelResults: null };
  }
  const prev = macroSteps[macroIndex - 1];
  if (prev.kind === 'parallel') {
    const items = prev.children.map((child) => ({
      nodeId: child.nodeId,
      nodeName: child.nodeName,
      content: runResults[child.nodeId]?.trim() ?? '',
    }));
    return { previousNodeRunResult: null, previousParallelResults: items };
  }
  const content = runResults[prev.nodeId]?.trim();
  if (!content) {
    return { previousNodeRunResult: null, previousParallelResults: null };
  }
  return {
    previousNodeRunResult: { nodeName: prev.nodeName, content },
    previousParallelResults: null,
  };
}
```

- [ ] **Step 3: topological-sort.ts re-export buildWorkflowSteps**

```typescript
export { buildWorkflowSteps, buildWorkflowResourceSteps } from '@momo/workflow';
```

---

### Task 9: WorkflowStepsBar — 并行卡片与 Popover

**Files:**
- Modify: `apps/skill-platform/src/renderer/components/Workflow/WorkflowStepsBar/index.tsx`
- Modify: `apps/skill-platform/src/renderer/components/Workflow/WorkflowStepsBar/index.module.less`
- Modify: `apps/skill-platform/src/renderer/components/Workflow/constants.ts`

- [ ] **Step 1: constants 增加并行色**

```typescript
export const WORKFLOW_PARALLEL_TAG_COLOR = '#6366f1';
```

- [ ] **Step 2: IProps 改用 IMacroStepViewModel**

```typescript
interface IProps {
  steps: IMacroStepViewModel[];
  activeMacroIndex: number;
  activeParallelChildIndex?: number;
  onStepClick?: (macroIndex: number) => void;
  onParallelChildClick?: (macroIndex: number, childIndex: number) => void;
  // runResults, nodeHasFiles, mode 保持不变
}
```

- [ ] **Step 3: 并行卡片 renderParallelStepCard**

```tsx
function renderParallelStepCard(macro: IParallelStepViewModel, macroIndex: number) {
  const readyCount = macro.children.filter((c) =>
    isStepOutputReady({ nodeId: c.nodeId, nodeName: c.nodeName, ... }, runResults, nodeHasFiles),
  ).length;
  const popoverContent = (
    <ul className={styles['workflow-step-parallel-popover']}>
      {macro.children.map((child, childIndex) => (
        <li key={child.nodeId}>
          <button
            type='button'
            onClick={() => onParallelChildClick?.(macroIndex, childIndex)}>
            {/* 图标 + nodeName + 完成圆点 */}
          </button>
        </li>
      ))}
    </ul>
  );
  return (
    <Popover content={popoverContent} placement='bottom' trigger='hover'>
      {/* 卡片：标题「并行」、badge ×N、副标题 readyCount/N */}
    </Popover>
  );
}
```

- [ ] **Step 4: isStepAccessible 适配宏观步骤**

```typescript
function isMacroStepAccessible(
  macroIndex: number,
  macroSteps: IMacroStepViewModel[],
  runResults: Record<string, string>,
  nodeHasFiles: Record<string, boolean>,
): boolean {
  if (macroIndex === 0) return true;
  const prev = macroSteps[macroIndex - 1];
  if (prev.kind === 'parallel') {
    return isParallelGroupOutputReady(prev.children, runResults, nodeHasFiles);
  }
  return isStepOutputReady(prev, runResults, nodeHasFiles);
}
```

- [ ] **Step 5: Popover 样式（不影响 bar 高度）**

```less
.workflow-step-parallel-popover {
  margin: 0;
  padding: 4px 0;
  list-style: none;
  min-width: 200px;
}

.workflow-step--parallel {
  background: #6366f1;
  color: #fff;
}
```

---

### Task 10: WorkflowWorkPage — 宏观导航与数据加载

**Files:**
- Modify: `apps/skill-platform/src/renderer/components/Workflow/WorkflowWorkPage/index.tsx`

- [ ] **Step 1: 状态改为宏观索引 + 组内子索引**

```typescript
const [macroSteps, setMacroSteps] = useState<IMacroStepViewModel[]>([]);
const [activeMacroIndex, setActiveMacroIndex] = useState(0);
const [activeParallelChildIndex, setActiveParallelChildIndex] = useState(0);
```

- [ ] **Step 2: loadWorkflow 使用 buildWorkflowSteps + buildMacroStepViewModels**

```typescript
const built = buildWorkflowSteps(nodes, edges);
const viewModels = buildMacroStepViewModels(built.steps, nodeMap);
setMacroSteps(viewModels);

// runResults / nodeHasFiles 仍按资源 nodeId 加载
const allResourceSteps = viewModels.flatMap((m) =>
  m.kind === 'parallel' ? m.children : [m],
);
for (const step of allResourceSteps) {
  // 现有 listDir + readMainMd 逻辑
}
```

- [ ] **Step 3: activeStep 解析**

```typescript
const activeResourceStep = resolveActiveResourceStep(
  macroSteps,
  activeMacroIndex,
  activeParallelChildIndex,
);
```

所有 `activeStep` 引用改为 `activeResourceStep`。

- [ ] **Step 4: previous 上下文**

```typescript
const { previousNodeRunResult, previousParallelResults } = getPreviousContextForActiveStep({
  macroSteps,
  macroIndex: activeMacroIndex,
  runResults,
});
```

- [ ] **Step 5: handleStepClick / handleParallelChildClick**

```typescript
const handleMacroStepClick = (macroIndex: number) => {
  if (!isMacroStepAccessible(macroIndex, macroSteps, runResults, nodeHasFiles)) {
    message.warning('请先完成上一节点的运行结果与文件产出');
    return;
  }
  setActiveMacroIndex(macroIndex);
  const macro = macroSteps[macroIndex];
  if (macro.kind === 'parallel') {
    const firstIncomplete = macro.children.findIndex(
      (c) => !isStepOutputReady(c, runResults, nodeHasFiles),
    );
    setActiveParallelChildIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
  } else {
    setActiveParallelChildIndex(0);
  }
};
```

- [ ] **Step 6: WorkflowStepsBar props 对齐**

传入 `steps={macroSteps}`、`activeMacroIndex`、`activeParallelChildIndex`、`onParallelChildClick`。

- [ ] **Step 7: workspaceNodeNames 逻辑**

并行组内子节点：上一宏观节点若为单资源，用该 `nodeName`；若为并行（当前节点在并行之后），不在组内场景出现。组内子节点共享「并行组上游」的单节点 workspace（与现有 `prevNodeNames` 一致，指向宏观上游资源节点名）。

---

### Task 11: WorkflowNodeChat — Tab 与全量上下文注入

**Files:**
- Modify: `apps/skill-platform/src/renderer/components/Workflow/WorkflowNodeChat/index.tsx`
- Modify: `apps/skill-platform/src/renderer/components/Workflow/WorkflowNodeChat/index.module.less`

- [ ] **Step 1: IProps 扩展**

```typescript
previousParallelResults?: Array<{ nodeId: string; nodeName: string; content: string }> | null;
```

- [ ] **Step 2: WorkflowChatBridge — Tab UI**

```tsx
import { Tabs } from 'antd';

{previousParallelResults && previousParallelResults.length > 1 ? (
  <div className={styles['workflow-node-chat-prev-result']}>
    <div className={styles['workflow-node-chat-prev-result-header']}>{'上一节点运行结果'}</div>
    <Tabs
      items={previousParallelResults.map((item) => ({
        key: item.nodeId,
        label: item.nodeName,
        children: (
          <div className={styles['workflow-node-chat-prev-result-body']}>
            {item.content.trim() || '暂无运行结果'}
          </div>
        ),
      }))}
    />
  </div>
) : previousNodeRunResult ? (
  // 现有单块 UI
) : null}
```

- [ ] **Step 3: 合并上下文注入到 buildPromptStream / skillStream**

在 `getBaseMessages`（prompt）与 `user_system_prompt`（skill）中，当 `previousParallelResults` 存在时：

```typescript
const parallelBlock = buildMergedParallelContext(previousParallelResults);
if (parallelBlock.trim()) {
  msgs.push({ role: 'system', content: parallelBlock });
}
```

单节点 `previousNodeRunResult` 分支保持不变；两者互斥。

- [ ] **Step 4: WorkflowWorkPage 传入 previousParallelResults**

```tsx
<WorkflowNodeChat
  previousParallelResults={previousParallelResults}
  previousNodeRunResult={previousNodeRunResult}
  ...
/>
```

---

### Task 12: WorkflowBusinessListView 只读步骤预览

**Files:**
- Modify: `apps/skill-platform/src/renderer/components/Workflow/WorkflowBusinessListView/index.tsx`

- [ ] **Step 1: buildStepsFromWorkflow 改用 buildWorkflowSteps**

```typescript
import { buildWorkflowSteps } from '@momo/workflow';
import { buildMacroStepViewModels } from '@renderer/services/workflow/step-model';

const built = buildWorkflowSteps(nodes, edges);
const viewModels = buildMacroStepViewModels(built.steps, nodeMap);
setSteps(viewModels);
```

- [ ] **Step 2: WorkflowStepsBar mode='readonly' 支持 IMacroStepViewModel**

只读模式下并行卡片同样 hover 展示子项，不可点击。

---

### Task 13: 手动验证清单

- [ ] **Studio：拖入并行节点 → 空态文案**
- [ ] **Studio：游离 prompt/skill 拖入 → 高亮 → 松手收纳**
- [ ] **Studio：已连线节点拖到并行上 → 置灰 → 无法收纳**
- [ ] **Studio：保存 → 重开 → graphJson 中 parentId / childNodeIds 正确**
- [ ] **Studio：A → Parallel(P1,P2) → B 保存校验通过**
- [ ] **Studio：子节点对外连线尝试 → 被拒绝**
- [ ] **执行：步骤条并行卡片 hover 显示 3 子项，高度不变**
- [ ] **执行：组内点击切换 P1/P2/P3 工作区**
- [ ] **执行：P1/P2/P3 全部完成后 B 可点击**
- [ ] **执行：B 节点对话区 Tab 显示 P1/P2/P3 结果**
- [ ] **执行：B 节点发消息时 AI 收到合并后的并行上下文**
- [ ] **执行：并行仅 1 子节点时步骤条显示为普通资源卡片**
- [ ] **单元测试：`cd packages/momo-workflow && pnpm test` 全部 PASS**

---

## Spec 覆盖自检

| Spec 章节 | 对应 Task |
|-----------|-----------|
| 3 数据模型 | Task 1, 2, 8 |
| 4 图规则与校验 | Task 3, 5, 7 |
| 5 编辑态交互 | Task 4, 5, 7 |
| 6 步骤条 hover | Task 9, 10, 12 |
| 7 Tab + 全量上下文 | Task 8, 11 |
| 8 改动清单 | 文件结构概览 |
| 9 兼容性 | Task 8 buildMacroStepViewModels 单 child 退化 |
| 10 测试 | Task 1–3, 13 |

---

## 执行顺序建议

1. Task 1 → 2 → 3（`@momo/workflow` 算法与测试，可独立合并）
2. Task 4 → 5 → 6（画布组件，Studio 可联调）
3. Task 7（Studio 集成）
4. Task 8 → 9 → 10 → 11 → 12（执行页闭环）
5. Task 13（手动验证）
