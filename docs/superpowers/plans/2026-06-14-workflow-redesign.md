# 工作流改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将工作流模块改为「侧栏管理模板 + 主区管理业务实例」，新增 business 数据层与按 businessId 隔离的产出存储。

**Architecture:** 在 skill-platform 内扩展 SQLite 表、IPC、runtime-paths；侧栏对齐笔记/提示词模式；从 WorkflowWorkPage 抽离 WorkflowStepsBar；WorkflowStudio 删节点改为保存时生效。

**Tech Stack:** Electron IPC、better-sqlite3/TypeORM runQuery、React 19、Ant Design 6、Zustand、@momo/workflow

**Spec:** [2026-06-14-workflow-redesign-design.md](../specs/2026-06-14-workflow-redesign-design.md)

---

## 文件结构概览

| 区域 | 新建 | 修改 |
|------|------|------|
| 类型 | `types/modules/workflow-business.ts` | `types/modules/index.ts`, `ipc-channels.ts` |
| DB | `repository/workflow-business.ts`, `service/workflow-business.ts`, `controller/workflow-business.ts` | `schema.ts`, `init.ts`, `ipc/index.ts` |
| Main IPC | `ipc/workflow-business.ts` | `ipc/workflow-agent.ts`, `runtime-paths.ts` |
| Preload | `preload/api/workflow-business.ts` | `preload/api/workflow-agent.ts`, `preload/api/index.ts`, `preload/index.ts` |
| Renderer 服务 | `services/workflow/business.ts` | `agent-files.ts`, `chat-storage.ts` |
| Store | `store/workflow/index.ts` | `store/ui/index.ts`, `store/index.ts` |
| 组件 | `WorkflowSidebarPanel`, `WorkflowBusinessListView`, `WorkflowStepsBar`, `WorkflowCreateBusinessModal`, `InlineEditableCell` | `WorkflowManager`, `WorkflowWorkPage`, `WorkflowStudio`, `WorkflowModalsHost`, `Sidebar`, `TopBar`, `useConfirmLeaveEditors` |
| 删除 | — | `WorkflowListView`（逻辑迁移后删除） |

---

### Task 1: 类型与 IPC Channel 定义

**Files:**
- Create: `apps/skill-platform/src/types/modules/workflow-business.ts`
- Modify: `apps/skill-platform/src/types/modules/index.ts`
- Modify: `apps/skill-platform/src/types/constants/ipc-channels.ts`

- [ ] **Step 1: 新增业务类型**

```typescript
// apps/skill-platform/src/types/modules/workflow-business.ts
export interface IWorkflowBusiness {
  id: string;
  workflowId: string;
  name: string;
  remark: string;
  createdAt: number;
  updatedAt: number;
}

export interface DCreateWorkflowBusiness {
  workflowId: string;
  name: string;
  remark?: string;
}

export interface DUpdateWorkflowBusiness {
  name?: string;
  remark?: string;
}
```

- [ ] **Step 2: 导出类型**

在 `types/modules/index.ts` 增加 `export * from './workflow-business';`

- [ ] **Step 3: 新增 IPC channels**

```typescript
// ipc-channels.ts 追加
WORKFLOW_BUSINESS_CREATE: 'workflowBusiness:create',
WORKFLOW_BUSINESS_GET_ALL: 'workflowBusiness:getAll',
WORKFLOW_BUSINESS_UPDATE: 'workflowBusiness:update',
WORKFLOW_BUSINESS_DELETE: 'workflowBusiness:delete',
WORKFLOW_BUSINESS_DELETE_BY_WORKFLOW: 'workflowBusiness:deleteByWorkflow',
WORKFLOW_BUSINESS_HAS_ANY: 'workflowBusiness:hasAny',
```

---

### Task 2: 数据库层 workflow_businesses

**Files:**
- Create: `apps/skill-platform/src/main/database/repository/workflow-business.ts`
- Create: `apps/skill-platform/src/main/database/service/workflow-business.ts`
- Create: `apps/skill-platform/src/main/database/controller/workflow-business.ts`
- Modify: `apps/skill-platform/src/main/database/init.ts`
- Modify: `apps/skill-platform/src/main/database/schema.ts`（可选：SCHEMA_TABLES 同步，migration 为主）

- [ ] **Step 1: Repository**

参考 `repository/workflow.ts` 实现 `insert/findByWorkflowId/findById/updateDynamic/deleteById/deleteByWorkflowId/countByWorkflowId`。

- [ ] **Step 2: Service**

```typescript
// service/workflow-business.ts 核心方法
async create(data: DCreateWorkflowBusiness): Promise<IWorkflowBusiness> {
  const id = crypto.randomUUID();
  const now = Date.now();
  await this.repo.insert({ id, workflow_id: data.workflowId, name: data.name.trim(), remark: data.remark?.trim() ?? '', created_at: now, updated_at: now });
  return { id, workflowId: data.workflowId, name: data.name.trim(), remark: data.remark?.trim() ?? '', createdAt: now, updatedAt: now };
}

async hasAny(workflowId: string): Promise<boolean> {
  return (await this.repo.countByWorkflowId(workflowId)) > 0;
}
```

- [ ] **Step 3: Controller** — 薄封装 Service 方法

- [ ] **Step 4: Migration**

在 `init.ts` `runMigrations` 内追加：

```typescript
if (!hasMigration('workflow_businesses_v1')) {
  db!.exec(`
    CREATE TABLE IF NOT EXISTS workflow_businesses (
      id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      name TEXT NOT NULL,
      remark TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_workflow_businesses_workflow ON workflow_businesses(workflow_id);
    CREATE INDEX IF NOT EXISTS idx_workflow_businesses_updated ON workflow_businesses(updated_at DESC);
  `);
  markMigration('workflow_businesses_v1');
}
```

- [ ] **Step 5: 注册 IPC**

`ipc/index.ts` 实例化 `WorkflowBusinessController` 并 `registerWorkflowBusinessIPC`。

---

### Task 3: runtime-paths 与 workflowAgent IPC 扩展

**Files:**
- Modify: `apps/skill-platform/src/main/runtime-paths.ts`
- Modify: `apps/skill-platform/src/main/ipc/workflow-agent.ts`
- Modify: `apps/skill-platform/src/preload/api/workflow-agent.ts`

- [ ] **Step 1: 新增路径函数**

```typescript
// runtime-paths.ts
export function getWorkflowBusinessAgentDir(workflowName: string, businessId: string): string {
  const safeBiz = businessId.replace(/[^a-zA-Z0-9_-]/g, '_') || 'business';
  return path.join(getWorkflowAgentDir(workflowName), safeBiz);
}

export function getWorkflowBusinessNodeAgentDir(workflowName: string, businessId: string, nodeName: string): string {
  const safeNode = nodeName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'node';
  return path.join(getWorkflowBusinessAgentDir(workflowName, businessId), safeNode);
}
```

- [ ] **Step 2: 改造 resolveNodeDir**

`workflow-agent.ts` 中节点目录解析改为 `(workflowName, businessId, nodeName)` 三元组；所有 handler 签名同步更新。

- [ ] **Step 3: 新增批量目录操作 handler**

```typescript
// 删除单个业务目录
ipcMain.handle(IPC_CHANNELS.WORKFLOW_AGENT_DELETE_BUSINESS_DIR, async (_e, workflowName: string, businessId: string) => {
  removeDirRecursive(getWorkflowBusinessAgentDir(workflowName, businessId));
  return { success: true };
});

// 保存时：删除所有 business 下某 nodeName 目录
ipcMain.handle(IPC_CHANNELS.WORKFLOW_AGENT_DELETE_NODE_FOR_ALL_BUSINESSES, async (_e, workflowName: string, nodeName: string) => {
  const wfDir = resolveWorkflowDir(workflowName);
  if (!fs.existsSync(wfDir)) return { success: true };
  for (const entry of fs.readdirSync(wfDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const nodeDir = path.join(wfDir, entry.name, sanitizeDirName(nodeName));
    removeDirRecursive(nodeDir);
  }
  return { success: true };
});
```

- [ ] **Step 4: preload workflowAgentApi** — 所有方法增加 `businessId` 参数；暴露 `deleteBusinessDir`、`deleteNodeForAllBusinesses`、`renameNodeForAllBusinesses`

- [ ] **Step 5: 新增 preload workflowBusinessApi + main ipc/workflow-business.ts**

---

### Task 4: Renderer 服务层适配 businessId

**Files:**
- Create: `apps/skill-platform/src/renderer/services/workflow/business.ts`
- Modify: `apps/skill-platform/src/renderer/services/workflow/agent-files.ts`
- Modify: `apps/skill-platform/src/renderer/services/workflow/chat-storage.ts`

- [ ] **Step 1: business.ts 封装**

```typescript
export async function fetchBusinessList(workflowId: string): Promise<IWorkflowBusiness[]> {
  return window.api?.workflowBusiness?.getAll(workflowId) ?? [];
}

export async function createBusiness(data: DCreateWorkflowBusiness): Promise<IWorkflowBusiness | null> {
  return window.api?.workflowBusiness?.create(data) ?? null;
}
```

- [ ] **Step 2: agent-files.ts** — 所有函数签名增加 `businessId: string` 作为第二参数

```typescript
export async function readWorkflowNodeMainMd(workflowName: string, businessId: string, nodeName: string): Promise<string> {
  return readWorkflowNodeFile(workflowName, businessId, nodeName, 'main.md');
}
```

- [ ] **Step 3: chat-storage.ts** — prefix 含 businessId

```typescript
export function buildWorkflowNodeChatPrefix(workflowId: string, businessId: string, nodeId: string): string {
  return `workflow-node-chat-${workflowId}-${businessId}-${nodeId}`;
}

export function deleteWorkflowBusinessChats(workflowId: string, businessId: string, graphJson?: string): void { /* 遍历节点删 chat */ }

export function deleteWorkflowNodeChatForAllBusinesses(workflowId: string, businessIds: string[], nodeId: string): void { /* ... */ }
```

---

### Task 5: Zustand Store 与 UI Store 扩展

**Files:**
- Create: `apps/skill-platform/src/renderer/store/workflow/index.ts`
- Modify: `apps/skill-platform/src/renderer/store/ui/index.ts`
- Modify: `apps/skill-platform/src/renderer/store/index.ts`

- [ ] **Step 1: workflow store**

```typescript
interface IWorkflowState {
  workflows: IWorkflow[];
  selectedWorkflowId: string | null;
  sidebarSearchQuery: string;
  fetchWorkflows: () => Promise<void>;
  selectWorkflow: (id: string | null) => void;
  deleteWorkflow: (id: string) => Promise<void>;
}
```

- [ ] **Step 2: ui store 改造**

```typescript
type EWorkflowScreen = 'business-list' | 'studio' | 'business-work';

selectedSidebarWorkflowId: string | null;  // 可与 workflow store selectedWorkflowId 合并，二选一
activeBusinessId: string | null;

openWorkflowBusinessWork: (workflowId: string, businessId: string) => void;
// 移除 openWorkflowWork；openWorkflowList → 回到 business-list 并清空 activeBusinessId
```

- [ ] **Step 3: 更新 useConfirmLeaveEditors** — `workflowScreen === 'business-work'` 替代 `'work'`

---

### Task 6: WorkflowStepsBar 抽离 + InlineEditableCell

**Files:**
- Create: `apps/skill-platform/src/components/Workflow/WorkflowStepsBar/index.tsx`
- Create: `apps/skill-platform/src/components/Workflow/WorkflowStepsBar/index.module.less`
- Create: `apps/skill-platform/src/components/ui/InlineEditableCell/index.tsx`
- Modify: `apps/skill-platform/src/components/Workflow/WorkflowWorkPage/index.tsx`

- [ ] **Step 1: 从 WorkflowWorkPage 提取 renderStepCard / steps-bar DOM 到 WorkflowStepsBar**

Props 见 spec §5.2；`mode='readonly'` 时不绑 onClick、不显示 disabled 锁定态（全部展示为普通卡片）。

- [ ] **Step 2: WorkflowWorkPage 改用 WorkflowStepsBar mode='interactive'**

传入现有 `activeStepIndex`、`runResults`、`nodeHasFiles`、`onStepClick`。

- [ ] **Step 3: InlineEditableCell**

```typescript
interface IProps {
  value: string;
  placeholder?: string;
  onSave: (next: string) => Promise<void> | void;
}
// hover 行右侧 Pencil 按钮 → 切换 Input → blur/Enter 调 onSave
```

样式参考现有 `workflow-list` 表格行 hover 模式。

---

### Task 7: WorkflowSidebarPanel + Sidebar 集成

**Files:**
- Create: `apps/skill-platform/src/components/Workflow/WorkflowSidebarPanel/index.tsx`
- Create: `apps/skill-platform/src/components/Workflow/WorkflowSidebarPanel/index.module.less`
- Modify: `apps/skill-platform/src/renderer/components/Layout/Sidebar/index.tsx`

- [ ] **Step 1: SidebarPanel 结构**

- 使用 `MomoTreeToolbar`：`sectionLabel='工作流'`、`createItemTitle='新建工作流'`、`onCreateItem → openWorkflowStudio(null)`
- 扁平列表：`workflows.map` 渲染行，选中高亮
- 每行 hover 显示 `Dropdown`（编辑 → Studio；删除 → modal.confirm + 删 DB/Agent/chat）

- [ ] **Step 2: Sidebar index.tsx**

在 `viewMode === 'workflow'` 分支（当前缺失，走 default skill 分支）新增与 note 同级结构：

```tsx
) : viewMode === 'workflow' ? (
  <div className='mt-2 flex min-h-0 flex-1 flex-col overflow-hidden'>
    <MomoTreeToolbar ... />
    <div className='scrollbar-hide flex-1 overflow-y-auto px-3 pb-4'>
      <WorkflowSidebarPanel />
    </div>
  </div>
) : (
```

- [ ] **Step 3: 点击 Rail 工作流时** `selectWorkflow(null)` 清空选中（对齐 note 行为）

---

### Task 8: WorkflowBusinessListView + WorkflowManager

**Files:**
- Create: `apps/skill-platform/src/components/Workflow/WorkflowBusinessListView/index.tsx`
- Create: `apps/skill-platform/src/components/Workflow/WorkflowBusinessListView/index.module.less`
- Create: `apps/skill-platform/src/components/Workflow/WorkflowCreateBusinessModal/index.tsx`
- Modify: `apps/skill-platform/src/components/Workflow/WorkflowManager/index.tsx`
- Delete: `apps/skill-platform/src/components/Workflow/WorkflowListView/`（迁移样式到 BusinessListView）

- [ ] **Step 1: WorkflowManager**

```tsx
export function WorkflowManager() {
  const selectedWorkflowId = useWorkflowStore(s => s.selectedWorkflowId);
  if (!selectedWorkflowId) {
    return (
      <ModuleEmptyState
        centered
        icon={GitBranchIcon}
        title='在左侧选择或新建工作流'
        description='从侧栏选择已有工作流，或点击新建工作流开始编排'
      />
    );
  }
  return <WorkflowBusinessListView workflowId={selectedWorkflowId} />;
}
```

- [ ] **Step 2: BusinessListView 列定义**

| 列 | 实现 |
|----|------|
| 序号 | index + 1 |
| 名称 | InlineEditableCell + update API |
| 备注 | InlineEditableCell |
| 创建时间 | toLocaleString |
| 操作 | 查看 → openWorkflowBusinessWork；删除 → confirm + deleteBusiness |

- [ ] **Step 3: 顶部 WorkflowStepsBar readonly**

加载 workflow.graphJson → buildWorkflowResourceSteps → 渲染，无 runResults。

- [ ] **Step 4: WorkflowCreateBusinessModal**

Form: name(required), remark(optional) → createBusiness → openWorkflowBusinessWork

---

### Task 9: WorkflowWorkPage / ModalsHost 传入 businessId

**Files:**
- Modify: `apps/skill-platform/src/components/Workflow/WorkflowWorkPage/index.tsx`
- Modify: `apps/skill-platform/src/components/Workflow/WorkflowModalsHost/index.tsx`
- Modify: `apps/skill-platform/src/components/Layout/TopBar/index.tsx`

- [ ] **Step 1: WorkflowWorkPage props**

```typescript
interface IProps {
  workflowId: string;
  businessId: string;
  onClose: () => void;
}
```

所有 `readWorkflowNodeMainMd(workflowName, nodeName)` 改为三参数；chat session 带 businessId。

- [ ] **Step 2: ModalsHost**

```tsx
const isBusinessWorkOpen = workflowScreen === 'business-work' && activeWorkflowId && activeBusinessId;
{isBusinessWorkOpen ? (
  <WorkflowWorkPage workflowId={activeWorkflowId} businessId={activeBusinessId} onClose={...} />
) : null}
```

- [ ] **Step 3: TopBar** — 返回按钮逻辑：`business-work` 关闭回 business-list

---

### Task 10: WorkflowStudio 删节点延迟保存

**Files:**
- Modify: `apps/skill-platform/src/components/Workflow/WorkflowStudio/index.tsx`

- [ ] **Step 1: handleNodeDelete 不再立即删文件/chat**

仅从 nodes/edges 移除；若 `workflowBusiness.hasAny(workflowId)` 弹 confirm，取消则 restore。

- [ ] **Step 2: performSave 增加 removed nodes 处理**

```typescript
const oldGraph = parseWorkflowGraphJson(savedGraphJson);
const newNodeIds = new Set(nodes.filter(isResourceNode).map(n => n.id));
const removedNodes = oldGraph.nodes.filter(n => isResourceNode(n) && !newNodeIds.has(n.id));

if (removedNodes.length > 0) {
  const businesses = await wfBusinessApi.getAll(id);
  for (const removed of removedNodes) {
    const nodeName = /* extract */;
    await window.api.workflowAgent.deleteNodeForAllBusinesses(trimmedName, nodeName);
    for (const biz of businesses) {
      deleteWorkflowNodeChat(id, biz.id, removed.id);
    }
  }
}
```

- [ ] **Step 3: 节点改名** — 保存时对每个 business 调用 `renameNodeForAllBusinesses`

---

### Task 11: 端到端验证

- [ ] **Step 1: 启动桌面端**

```bash
cd apps/skill-platform && pnpm dev
```

- [ ] **Step 2: 手动测试清单**（对应 spec §8）

- [ ] **Step 3: TypeScript 检查**

```bash
cd apps/skill-platform && pnpm exec tsc --noEmit
```

Expected: 无 type error

---

## Plan 自审

| Spec 章节 | 对应 Task |
|-----------|-----------|
| §3 导航 | Task 5, 7, 8, 9 |
| §4 数据 | Task 1–4 |
| §5 UI | Task 6–9 |
| §6 Studio | Task 10 |
| §8 测试 | Task 11 |

- [x] 无 TBD 占位
- [x] businessId 路径全链路一致
- [x] 单次计划可交付

---

## 执行选项

Plan 已保存。可选执行方式：

1. **Subagent-Driven（推荐）** — 每 Task 派发独立 subagent，逐 Task 审查
2. **Inline Execution** — 本会话按 Task 顺序直接实现，检查点暂停确认

请告知选择哪种方式开始实现。
