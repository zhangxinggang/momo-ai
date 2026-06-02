# 工作流改版设计规格

> 日期：2026-06-14  
> 状态：已确认  
> 范围：skill-platform 工作流模块（不含旧数据迁移）

---

## 1. 背景与目标

将工作流模块从「单页工作流列表 + 工作/编辑」改为「侧栏管理工作流模板 + 主区管理业务实例」的双层结构，参考笔记/提示词的二级侧栏模式。

**核心目标：**

- 侧栏扁平列表管理工作流模板（新建、选中、编辑、删除）
- 主区展示选中工作流下的业务列表，每条业务对应一次独立执行实例
- 业务产出与对话按 `businessId` 隔离存储
- 节点步骤条抽成共用组件，业务列表只读展示、执行页可交互
- Studio 删节点改为保存时生效，存在业务时二次确认

**明确不做：**

- 旧数据兼容与迁移（需求 #5）
- Web 端工作流持久化（沿用现有桌面端限制）

---

## 2. 已确认的产品决策

| 项 | 决策 |
|---|---|
| 侧栏工作流项操作 | hover 显示 ··· → 编辑（Studio）/ 删除 |
| 未选中工作流 | `ModuleEmptyState`，文案参考 `PromptManager` |
| 业务数据隔离 | `agent/{workflowName}/{businessId}/{nodeName}/` |
| 对话 storage key | `workflow-node-chat-{workflowId}-{businessId}-{nodeId}` |
| 业务列表操作栏 | 查看 + 删除（二次确认，清理目录与 chat） |
| 节点概览条（业务列表） | 只读，不可点击 |
| 名称/备注编辑 | hover 显示编辑按钮，点击后单元格 inline 编辑，失焦/回车保存 |
| 实现方案 | 方案 A：在 skill-platform 内扩展，对齐笔记/提示词模式 |

---

## 3. 信息架构与导航

### 3.1 结构

```
一级 Rail「工作流」
  └─ 二级侧栏：工作流扁平列表 + 搜索 + 新建工作流
       └─ 主区：
            ├─ 未选中 → ModuleEmptyState
            └─ 已选中 → 节点概览条(只读) + 业务列表
                 ├─ 新建业务 → 弹框 → 执行页
                 ├─ 查看 → 执行页（同现「工作」页）
                 └─ 删除 → 清理业务数据
```

### 3.2 导航规则

| 操作 | 行为 |
|------|------|
| 点击 Rail「工作流」 | 进入模块；侧栏无选中时主区为空状态 |
| 侧栏单击工作流 | 选中，主区展示该工作流业务列表 |
| 侧栏 ··· → 编辑 | 打开 `WorkflowStudio` |
| 侧栏 ··· → 删除 | 二次确认；删除工作流、全部业务、Agent 整树、相关 chat |
| 侧栏「新建工作流」 | 打开 `WorkflowStudio(null)` |
| 主区「新建业务」 | 弹框（名称必填、备注可选）→ 创建记录 → 打开执行页 |
| 主区「查看」 | 打开执行页，传入 `workflowId` + `businessId` |
| 主区「删除」 | 二次确认；删除业务记录、`agent/{wf}/{businessId}/`、该业务 chat |

### 3.3 移除的旧入口

- 主区 `WorkflowListView` 作为默认页（工作流列表移至侧栏）
- 业务列表中的「工作」按钮（由「新建业务」替代创建入口）

---

## 4. 数据模型与存储

### 4.1 数据库表 `workflow_businesses`

```sql
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
```

通过 migration `workflow_businesses_v1` 在 `init.ts` 中注册。

### 4.2 TypeScript 类型

```typescript
interface IWorkflowBusiness {
  id: string;
  workflowId: string;
  name: string;
  remark: string;
  createdAt: number;
  updatedAt: number;
}

interface DCreateWorkflowBusiness {
  workflowId: string;
  name: string;
  remark?: string;
}

interface DUpdateWorkflowBusiness {
  name?: string;
  remark?: string;
}
```

### 4.3 文件目录

| 层级 | 路径 |
|------|------|
| 工作流根 | `<userData>/agent/{workflowName}/` |
| 业务 | `<userData>/agent/{workflowName}/{businessId}/` |
| 节点产出 | `<userData>/agent/{workflowName}/{businessId}/{nodeName}/` |

`runtime-paths.ts` 新增 `getWorkflowBusinessAgentDir`、`getWorkflowBusinessNodeAgentDir`。

### 4.4 IPC

**workflowBusiness：**

- `create` / `getAll(workflowId)` / `update(id, data)` / `delete(id)`
- `deleteByWorkflow(workflowId)` — 删工作流时调用
- `hasAny(workflowId)` — Studio 删节点确认用

**workflowAgent（扩展）：** 节点级 API 增加 `businessId` 参数；新增：

- `deleteBusinessDir(workflowName, businessId)`
- `deleteNodeDirForAllBusinesses(workflowName, nodeName)` — 保存时清理已删节点
- `renameNodeDirForAllBusinesses(workflowName, oldNodeName, newNodeName)` — 保存时节点改名

### 4.5 级联删除

| 操作 | 清理 |
|------|------|
| 删除业务 | DB + `agent/{wf}/{businessId}/` + 该业务全部 chat |
| 删除工作流 | DB(CASCADE) + `agent/{wf}/` + 全部 chat |
| Studio 保存移除节点 | 各 business 下 `{businessId}/{nodeName}/` + 对应 chat |

---

## 5. UI 组件

### 5.1 新增

| 组件 | 路径 | 职责 |
|------|------|------|
| `WorkflowSidebarPanel` | `components/Workflow/WorkflowSidebarPanel/` | 侧栏列表、搜索、选中、··· 菜单 |
| `WorkflowBusinessListView` | `components/Workflow/WorkflowBusinessListView/` | 业务列表 + 节点概览 + 新建/查看/删除 |
| `WorkflowStepsBar` | `components/Workflow/WorkflowStepsBar/` | 共用节点步骤条 |
| `WorkflowCreateBusinessModal` | `components/Workflow/WorkflowCreateBusinessModal/` | 新建业务弹框 |
| `InlineEditableCell` | `components/ui/InlineEditableCell/` | 表格 inline 编辑 |

### 5.2 `WorkflowStepsBar` 接口

```typescript
interface IProps {
  steps: IStepViewModel[];
  mode: 'readonly' | 'interactive';
  activeStepIndex?: number;
  runResults?: Record<string, string>;
  nodeHasFiles?: Record<string, boolean>;
  onStepClick?: (index: number) => void;
}
```

### 5.3 `WorkflowBusinessListView` 列

| 列 | 说明 |
|----|------|
| 序号 | 从 1 递增 |
| 名称 | hover 编辑按钮 → inline 编辑 |
| 备注 | hover 编辑按钮 → inline 编辑 |
| 创建时间 | 格式化显示 |
| 操作 | 查看、删除 |

### 5.4 修改现有组件

| 组件 | 变更 |
|------|------|
| `WorkflowManager` | 无选中 → 空状态；有选中 → `WorkflowBusinessListView` |
| `WorkflowWorkPage` | 增加 `businessId`；路径与 chat 带 businessId |
| `WorkflowStudio` | 删节点延迟到保存；有业务时确认 |
| `WorkflowModalsHost` | `business-work` screen + businessId |
| `Sidebar` | `viewMode === 'workflow'` 渲染侧栏面板 |
| `WorkflowListView` | 删除或内联至侧栏 |

### 5.5 UI Store

```typescript
type EWorkflowScreen = 'business-list' | 'studio' | 'business-work';

selectedSidebarWorkflowId: string | null;
activeBusinessId: string | null;
sidebarWorkflowListQuery: string;

selectSidebarWorkflow(id: string | null): void;
openWorkflowBusinessWork(workflowId: string, businessId: string): void;
```

---

## 6. Studio 删节点逻辑

### 6.1 流程

1. 用户在画布删除节点
2. 若该工作流 `hasAny(workflowId)` 为 true → 弹框确认
3. 取消 → 节点保留
4. 确认 → 仅从画布移除（pending），**不立即删文件**
5. 保存时对比 oldGraph vs newGraph，对已移除节点执行跨 business 清理

### 6.2 确认文案

> 删除当前节点后，保存时会删除当前节点所有的历史业务记录，是否继续？

### 6.3 保存时

- 移除节点：对各 business 删 `{businessId}/{nodeName}/` + chat
- 节点改名：对各 business 执行 `renameNodeDir`
- 工作流改名：`renameWorkflowAgentDir`（子目录一并迁移）

---

## 7. 空状态文案

- **标题：** 在左侧选择或新建工作流
- **描述：** 从侧栏选择已有工作流，或点击新建工作流开始编排

---

## 8. 测试要点

- [ ] 侧栏 CRUD 工作流；hover ··· 编辑/删除
- [ ] 未选中空状态；选中后业务列表与只读节点条
- [ ] 新建业务弹框校验；创建后进入执行页
- [ ] 业务查看/删除；删除清理目录与 chat
- [ ] 名称/备注 inline 编辑保存
- [ ] 执行页各节点产出隔离（不同 businessId 互不影响）
- [ ] Studio 有业务时删节点确认；取消保留；确认后保存才清理
- [ ] 删工作流级联清理

---

## 9. 自审清单

- [x] 无 TBD / TODO 占位
- [x] 与已确认决策一致
- [x] 架构与需求 #1–#6 对齐
- [x] 范围限定为单次实现计划可交付
