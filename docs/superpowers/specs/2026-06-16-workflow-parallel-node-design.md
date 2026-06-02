# 工作流并行节点设计规格

> 日期：2026-06-16  
> 状态：已确认  
> 范围：`@momo/workflow` 包 + skill-platform 工作流 Studio / 执行页

---

## 1. 背景与目标

当前工作流为**单链拓扑**：每个资源节点最多 1 入 1 出，步骤条与上下文均按线性顺序处理。产品需要在编辑态支持**并行分组**，执行态将并行组视为一个宏观步骤，下游节点同时接收全部分支产出作为上下文。

**核心目标：**

- Studio 侧栏新增「组件 → 并行节点」，拖入画布后可收纳多个未连线的资源节点
- 并行容器对外表现为一个可连线的复合节点（1 入 1 出）
- 执行页步骤条高度不变；并行组（≥2 子节点）通过 hover 展示子项与进度
- 当前节点上游为并行组时，对话区以 Tab 展示各分支结果，并**全量合并**注入 AI 上下文

**明确不做（v1）：**

- 并行节点嵌套并行节点
- 起止节点放入并行容器
- 旧工作流 graphJson 自动迁移（无并行节点的图保持兼容即可）

---

## 2. 已确认的产品决策

| 项 | 决策 |
|---|---|
| 实现方案 | React Flow 父节点（`parentId`），推荐方案 1 |
| 并行组完成条件 | **全部**子节点均满足「运行结果非空 + 存在文件产出」后，整组解锁下游 |
| 子节点收纳 | 仅允许 0 入 0 出的游离资源节点；已连线节点悬停时容器置灰不可 drop |
| 子节点数量 | 不限制；=1 时执行态退化为普通单节点（不显示并行卡片、不用 Tab） |
| 对外连线 | 仅并行容器暴露 Handle；子节点禁止对外连线 |
| 步骤条 | 并行组（≥2 子）占 1 格，高度不变；hover Popover 列子项；点击子项切换工作区 |
| 上游上下文 | Tab 切换阅读；注入 AI 时合并全部子节点结果 |
| 嵌套 | v1 不支持 |

---

## 3. 数据模型

### 3.1 新增节点类型

文件：`packages/momo-workflow/src/types.ts`

```typescript
export const WORKFLOW_NODE_TYPE_PARALLEL = 'parallelGroup';

export interface IWorkflowParallelNodeData extends Record<string, unknown> {
  /** 展示标题，默认「并行节点」 */
  label?: string;
  /** 工作流内唯一名称（可选，用于目录标识） */
  nodeName?: string;
  /** 子节点 id 列表，顺序决定 Tab / hover / 合并上下文顺序 */
  childNodeIds: string[];
}
```

### 3.2 Palette 拖放载荷扩展

```typescript
export interface IWorkflowPaletteDragPayload {
  kind: 'prompt' | 'skill' | 'start' | 'end' | 'parallel';
  resourceId?: string;
  label?: string;
}
```

### 3.3 步骤模型升级

文件：`packages/momo-workflow/src/utils/graph.ts`

```typescript
export interface IWorkflowResourceStep {
  nodeId: string;
  resourceKind: 'prompt' | 'skill';
  resourceId: string;
  nodeName: string;
  label?: string;
}

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
```

`buildWorkflowResourceSteps` 保留并标记 deprecated 或内部转调；对外导出 `buildWorkflowSteps`。

### 3.4 graphJson 存储

沿用 `{ nodes, edges }` 结构，无 schema 版本号变更：

- 并行节点：`type: 'parallelGroup'`，`data.childNodeIds`
- 子资源节点：增加 `parentId: parallelNodeId`，`extent: 'parent'`（React Flow 约定）
- 边：仅连接并行容器或普通资源节点/起止节点，不连接子节点 id

---

## 4. 图规则与校验

### 4.1 编辑约束

| 规则 | 说明 |
|------|------|
| 并行容器 | 最多 1 入边、1 出边 |
| 子节点 | 必须有 `parentId`；不得有对外 edge |
| Drop 条件 | 目标为资源节点且 `incomingCount === 0 && outgoingCount === 0` |
| 无效 Drop | 已连线节点拖到容器上 → 容器 `disabled` 视觉，松开无效 |
| 起止节点 | 不可作为子节点 |
| 嵌套 | 并行节点不可放入并行节点 |

### 4.2 保存校验（`validateWorkflowGraph`）

在现有 `validateWorkflowResourceChain` 基础上扩展：

1. 将并行容器视为**宏观节点**参与链式校验（容器级 1 入 1 出、全连通）
2. 子节点不参与宏观拓扑边计数
3. 每个 `childNodeId` 必须存在、为资源节点、且 `parentId` 指向该并行节点
4. `childNodeIds` 与 `parentId` 双向一致（无孤儿、无重复）
5. 并行容器至少 0 个子节点可保存；执行时 0 子节点视为空组（保存时可选 warning，v1 允许）

错误文案示例：

- `并行节点内的子节点不能对外连线`
- `请将并行节点与子节点正确关联`
- `每个节点只能有一个连接和被连接`（宏观链仍适用）

### 4.3 拓扑排序

宏观图节点集合 = `{ 资源节点（无 parentId） } ∪ { 并行容器 }`。

对宏观图做 Kahn 拓扑排序；遇到并行容器时展开为 `IWorkflowParallelStep`，普通资源节点展开为 `IWorkflowSingleStep`。

子节点在并行组内的顺序：`childNodeIds` 数组顺序（拖入先后 append；v1 不支持组内排序拖拽，可后续迭代）。

---

## 5. 编辑态交互（WorkflowStudio）

### 5.1 侧栏结构

```
组件
  └─ 并行节点

提示词
  ...

技能
  ...
```

「组件」区块位于「提示词」上方。拖拽 `kind: 'parallel'` 到画布创建空并行容器。

### 5.2 并行容器 UI（ParallelGroupNode）

**空态：**

```
┌─────────────────────────┐
│ 并行节点          ○───○ │  ← 左 target / 右 source Handle
│ ┌─────────────────────┐ │
│ │    请拖入节点        │ │  ← 虚线内框
│ └─────────────────────┘ │
└─────────────────────────┘
```

**交互状态：**

| 状态 | 触发 | 视觉 |
|------|------|------|
| idle | 默认 | 虚线框 + 灰色提示文案 |
| drag-over-valid | 游离资源节点在容器内 | 边框主题色高亮 + 浅背景 |
| drag-over-invalid | 已连线资源节点在容器上 | 整容器 opacity 降低 + `not-allowed` |
| filled | ≥1 子节点 | 子节点网格/横向排列，容器 auto-size |

**拖入完成逻辑：**

1. 校验节点为游离资源节点
2. 设置 `node.parentId = parallelId`，`extent: 'parent'`
3. 更新并行节点 `data.childNodeIds.push(nodeId)`
4. 重新计算容器 `width/height`（最小尺寸保留占位区）
5. 子节点相对坐标限制在容器内

**拖出（v1 可选，建议实现）：**

- 拖出容器边界 → 清除 `parentId`，从 `childNodeIds` 移除
- 容器空 → 恢复「请拖入节点」

**连线：**

- `WorkflowEditor.handleConnect`：若 source/target 任一为并行子节点（有 parentId），拒绝连线
- 并行容器 Handle 行为与普通节点一致

### 5.3 删除行为

- 删除并行容器：连同子节点一并删除（或先弹出确认）；清理 `childNodeIds`
- 删除子节点：从 `childNodeIds` 移除；容器空则回空态

---

## 6. 执行态 — 步骤条（WorkflowStepsBar）

### 6.1 宏观步骤展示

当 `IWorkflowParallelStep.children.length >= 2`：

- 步骤条占 **1 张卡片**，高度与现有卡片一致
- 标题：`并行`，badge `×N`
- 副标题：`M/N 已完成`（M = 满足 runResult+files 的子节点数）
- 背景色：独立色系（如 indigo `#6366f1`），与 prompt/skill 区分

当 `children.length === 1`：不渲染并行卡片，直接渲染该唯一子资源节点卡片（与现有一致）。

### 6.2 Hover Popover

鼠标悬停并行卡片时，向下弹出 Popover（不影响 bar 高度）：

```
┌──────────────────────┐
│ ● P1  提示词A    ✓   │
│ ○ P2  技能B      ○   │
│ ○ P3  提示词C    ○   │
└──────────────────────┘
```

- 每行：资源图标、nodeName、完成态（● 就绪 / ○ 未完成）
- **点击行**：切换到该子节点工作区（组内任意顺序执行）
- 当前激活子节点在 Popover 内高亮

### 6.3 解锁逻辑

- 宏观下一步（并行组之后的节点）：仅当并行组内**全部**子节点 `isStepOutputReady` 为 true 时可访问
- 宏观上一步完成检查：对 `IWorkflowParallelStep` 调用 `isParallelGroupReady(children)`
- 组内子节点：并行组内第一个子节点始终可访问；其余子节点在 v1 **均可自由切换**（不要求按顺序完成），但宏观下游仍须全部完成

---

## 7. 执行态 — 上下文与 Tab（WorkflowNodeChat）

### 7.1 触发条件

当前激活节点的**直接宏观上游**为 `IWorkflowParallelStep` 且 `children.length >= 2`。

### 7.2 UI

替换现有单一「上一节点运行结果」区块为 Ant Design `Tabs`：

- 每个 Tab：`{nodeName}` 或 `{label} · {nodeName}`
- Tab 内容：对应子节点 `runResults[nodeId]`（main.md 文本）
- 无内容 Tab 显示占位「暂无运行结果」

### 7.3 AI 上下文注入

Tab 仅用于阅读；发送给模型的上下文**始终合并全部子节点**：

```
--- 并行上游 · {P1.nodeName} ---
{content1}

--- 并行上游 · {P2.nodeName} ---
{content2}

--- 并行上游 · {P3.nodeName} ---
{content3}
```

合并顺序 = `childNodeIds` 顺序。空内容分支跳过或标注「（无内容）」。

### 7.4 工作区目录上下文

`buildWorkflowWorkspaceContext` 在并行上游场景：v1 仍按当前激活节点的 `prevNodeName` 逻辑；若需合并多目录，后续迭代。本 spec 优先保证 **runResult 文本合并**。

---

## 8. 模块改动清单

| 包/文件 | 职责 |
|---------|------|
| `packages/momo-workflow/src/types.ts` | 并行类型、palette kind |
| `packages/momo-workflow/src/components/ParallelGroupNode/` | 容器 UI、drop zone、Handle |
| `packages/momo-workflow/src/components/WorkflowEditor/index.tsx` | 拖入检测、连线约束、onNodeDragStop 边界 |
| `packages/momo-workflow/src/utils/graph.ts` | `buildWorkflowSteps`、`validateWorkflowGraph`、并行就绪判断 |
| `packages/momo-workflow/src/index.ts` | 导出新 API |
| `apps/.../WorkflowStudio/index.tsx` | 侧栏「组件」、创建并行节点、保存校验 |
| `apps/.../WorkflowStepsBar/index.tsx` | 并行卡片、Popover、组内导航 |
| `apps/.../WorkflowWorkPage/index.tsx` | 宏观步骤、激活子节点、解锁 |
| `apps/.../WorkflowNodeChat/index.tsx` | `previousParallelResults` + Tabs |
| `apps/.../Workflow/constants.ts` | 并行步骤条颜色常量 |

---

## 9. 兼容性与边界

| 场景 | 行为 |
|------|------|
| 旧 graphJson（无并行节点） | 原样加载；`buildWorkflowSteps` 输出全为 `kind: 'resource'` |
| 并行组 0 子节点 | 保存允许；执行时视为空步骤，下游若连到空并行组需校验失败或跳过 |
| 并行组 1 子节点 | 步骤条与上下文按普通单节点 |
| 删除 Studio 中并行组内节点 | 同步更新 `childNodeIds` |

---

## 10. 测试要点

**graph 单元测试（`momo-workflow`）：**

- 宏观链 A → Parallel(P1,P2) → B 拓扑正确
- 子节点对外连线校验失败
- 并行组全部子 ready / 部分 ready 的解锁判断
- 单链子节点退化

**手动测试：**

- 拖入/拖出、已连线节点置灰
- 保存重开 graphJson 一致
- 执行页 hover、组内切换、Tab、下游解锁
- 合并上下文在对话中可见

---

## 11. 后续迭代（非 v1）

- 并行组内子节点 drag 排序
- 并行上游多工作区目录合并
- 并行嵌套
- 并行组 nodeName 与 agent 目录结构
