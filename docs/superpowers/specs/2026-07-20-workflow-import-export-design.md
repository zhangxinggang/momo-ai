# 工作流模板导入 / 导出（Zip）— 设计规格

> 日期：2026-07-20  
> 状态：已确认  
> 范围：`apps/skill-platform` 工作流侧栏导入；工作流行 `···` 导出；主进程打包 / 解包模板 zip（含提示词、Skill、网页节点配置）

---

## 1. 背景与问题

### 1.1 已有能力

- 工作流模板存 SQLite（`workflows.graph_json`），侧栏由 `WorkflowTreePanel` + `MomoTree` 管理。
- 图节点对提示词 / Skill 为 **软引用**（`resourceId`）；网页 URL 内嵌在节点 data。
- 提示词已有 JSON 备份（`main/services/prompt/backup.ts` + `usePromptBackup`），侧栏工具栏有导入/导出。
- 工作流行菜单已有：编辑、复制、移动、删除；**无**导入 / 导出。
- Skill 本体在 DB，仓库文件可在 `local_repo_path`（`readLocalRepoFilesByPath` 等已可复用）。

### 1.2 待解决问题

| 问题 | 说明 |
|------|------|
| 无法分享完整可运行模板 | 只复制工作流不会带走提示词 / Skill |
| 无法从外部恢复模板 | 无 zip 导入入口 |
| 本机路径不可移植 | `kbCollectionId`、`workspacePaths`、`local_repo_path` 换机无效 |

---

## 2. 已确认的产品决策

| 项 | 决策 |
|---|---|
| 包内容 | **仅模板包**：工作流图 + 引用到的提示词全文 + Skill（元数据 + 本地仓库文件）+ 网页节点配置 |
| 不含 | 业务实例、`agent/` 产出、节点聊天、目录归属（`folderId`） |
| 冲突策略 | **弹窗**：对每个冲突资源可选「跳过 / 覆盖 / 新建副本」 |
| 本机路径 | **导出剥离**；导入完成后提示「已清除 N 处本机路径，请重新配置」 |
| 导入落点 | **一律进工作流树根级**（`folderId = null`） |
| 实现路线 | 对齐提示词备份：**Main 打包 + IPC + 对话框**；UI 挂侧栏 / `MomoTree` |

---

## 3. 架构

### 3.1 推荐方案：主进程 WorkflowBackup + 两阶段导入

```text
Renderer
  Sidebar(workflow) 工具栏 → 导入按钮
  WorkflowTreePanel ··· → 导出
  冲突弹窗（跳过 / 覆盖 / 新建副本）
       │ IPC
Main: workflow/backup
  - exportWorkflowTemplate(workflowId) → 另存为 zip
  - previewWorkflowImport() → 选 zip + 清单 + 冲突列表（返回 sessionId）
  - commitWorkflowImport(sessionId, decisions) → 写库 / 写 Skill 文件 / 重写 resourceId
```

### 3.2 明确不采用

- **纯 Renderer JSZip**：Skill 仓库读盘与冲突提交不便；大包逻辑难复用。
- **整机镜像式快照**（含 business / agent）：超出本期「模板包」范围。

### 3.3 与现有系统边界

| 系统 | 关系 |
|------|------|
| 提示词 JSON 备份 | **并存**；工作流 zip 自包含所需提示词，不调用提示词批量导出 UI |
| `duplicateWorkflow` | **不变**；仅 DB 内复制图，不替代导出 |
| 知识库 / 工作区路径 | 导出清空；导入不恢复；靠完成后的提示引导用户重绑 |

---

## 4. Zip 包格式

### 4.1 目录结构

```text
{workflowName}-workflow.zip
├── manifest.json
├── workflow.json
├── prompts/
│   └── {promptId}.json
└── skills/
    └── {skillId}/
        ├── skill.json
        └── files/          # 可选；有 local_repo 且目录存在时写入
            └── ...相对路径文件
```

### 4.2 `manifest.json`

```typescript
interface IWorkflowTemplateManifest {
  version: 1;
  kind: 'workflow-template';
  exportedAt: string; // ISO
  workflowName: string;
  promptIds: string[];
  skillIds: string[];
  missingResourceIds: string[]; // 图中引用但本机已删的资源
  strippedLocalPathCount: number;
}
```

### 4.3 `workflow.json`

- 字段：`id`、`name`、`graphJson`（或等价 `nodes`/`edges`）、导出时的时间戳可选。
- **不写** `folderId`（导入固定根级）。
- 图净化规则（导出时执行）：
  - 清空节点 `kbCollectionId`、`workspacePaths`
  - 网页 `url` / 节点名 / 覆盖提示词 / 模型等可移植字段保留
- zip 内 `resourceId` 与 `prompts/`、`skills/` 目录名一致。

### 4.4 资源文件

- `prompts/{id}.json`：提示词业务字段（对齐 `IPrompt` 可导入子集）；不含无意义的本机-only 字段时可原样带 ID。
- `skills/{id}/skill.json`：Skill 元数据 + `content`/`instructions`；**清空** `local_repo_path`。
- `skills/{id}/files/`：由 `readLocalRepoFilesByPath`（或 buffer 版）打包；导入时还原到应用约定的 Skill 仓库目录并回写新的 `local_repo_path`。

### 4.5 默认文件名

- `{sanitize(workflowName)}-workflow.zip`

---

## 5. 导出流程

1. 工作流行 `···` →「导出」→ `adapter.onExport(workflowId)`。
2. Main：读工作流 → 解析图 → 收集去重后的 prompt/skill `resourceId`。
3. 拉取资源；缺失的记入 `missingResourceIds`，不中断导出。
4. Skill 有有效 `local_repo_path` 则打入 `files/`。
5. 净化 graph，统计 `strippedLocalPathCount`，写 zip，弹出另存为。
6. 返回：`canceled` | 成功（路径、prompt/skill 数量、missing 数量、stripped 数量）。
7. Renderer toast：成功 / 取消 / 「有 N 个资源缺失未写入」。

**范围外**：business、`agent/`、chat storage、工作流目录树。

---

## 6. 导入流程

### 6.1 入口

- 工作流侧栏 `MomoTreeToolbar.extraActions`：仅 **导入** 按钮（对齐提示词备份的 Upload 交互；不在工具栏放「导出全部」）。

### 6.2 两阶段

**阶段 A — Preview**

1. 打开文件对话框，筛选 `.zip`。
2. Main 解压到临时目录，校验 `manifest.version === 1` 且 `kind === 'workflow-template'`。
3. 扫描包内 prompt/skill，与本机按 **同 ID 或同名** 检测冲突。
4. 返回 preview：`workflowName`、资源摘要、`conflicts[]`、`strippedLocalPathCount`。

**阶段 B — Commit**

1. Renderer 若无冲突：直接用默认决策（全部新建，见下）提交。
2. 若有冲突：弹窗列出冲突项，每项三选一；支持「全部应用同一策略」。
3. Main 按决策写 prompt/skill（及 Skill `files/`），建立 `oldId → newId` 映射，重写 graph 中 `resourceId`。
4. 创建工作流：新 `id`，`folderId = null`；若根级已有同名工作流，名称加后缀 `（导入）` 或 `（导入 N）`。
5. 清理临时目录；返回导入统计。
6. Renderer：刷新工作流 / 提示词 / Skill store；toast 成功；若 `strippedLocalPathCount > 0`，追加提示重新配置本机路径。

### 6.3 冲突决策语义

对 **提示词 / Skill** 每一冲突项：

| 决策 | 行为 |
|------|------|
| 跳过 | 不写入包内该资源；图引用映射到 **本机已有** 对应项（优先同 ID，否则同名匹配到的那条） |
| 覆盖 | 用包内内容更新本机已有记录（及 Skill 仓库文件）；图引用映射到该已有 ID |
| 新建副本 | 新 ID（及副本名后缀）；写入包内内容；图引用映射到新 ID |

无冲突的资源（本机无同 ID 且无同名）：一律 **新建**（新 ID）。

导入的提示词 / Skill 落点：各自模块的**根级**（`folderId = null`；Skill 不挂到导出时的来源目录）。不随包重建提示词目录树。

工作流本身：始终新建一条记录（不覆盖已有工作流模板）。

### 6.4 冲突弹窗 UI（要点）

- 标题：导入工作流冲突
- 列表：类型（提示词/Skill）、名称、冲突原因（同 ID / 同名）
- 行内 Radio 或 Select：跳过 | 覆盖 | 新建副本
- 顶部快捷：全部跳过 / 全部覆盖 / 全部新建副本
- 确认后才执行 commit；取消则整次导入中止（不写库）

---

## 7. UI 改动点

| 位置 | 改动 |
|------|------|
| `Sidebar` 工作流 `MomoTreeToolbar` | `extraActions`：导入按钮 |
| `WorkflowTreePanel` | `adapter.onExport` + labels.export |
| `packages/momo-tree` | `IMomoTreeAdapter` 增加可选 `onExport`；文件菜单在 `onCopy` 附近插入「导出」 |
| 新组件（建议） | `WorkflowImportConflictModal`（或等价）展示冲突决策 |

菜单文案：`导出`；工具栏：`导入工作流`（或 Upload 图标 + tooltip）。

---

## 8. 模块与 IPC

### 8.1 建议文件

| 路径 | 职责 |
|------|------|
| `types/modules/workflow-backup.ts` | Manifest、Preview、Conflict、Decision、Result 类型 |
| `main/services/workflow/backup.ts` | 组包、解包、净化、冲突检测、commit |
| `main/ipc/workflow-backup.ts`（或并入现有 workflow/io） | IPC 注册 |
| `renderer/services/workflow/backup-api.ts` | 调用封装 |
| `renderer/hooks/useWorkflowBackup.ts` | 导出 / 导入编排 + toast |
| `renderer/components/Workflow/.../WorkflowImportConflictModal` | 冲突 UI |

### 8.2 IPC（示意）

- `workflow:exportTemplate` — `(workflowId) => IWorkflowExportResult`
- `workflow:previewImport` — `() => IWorkflowImportPreviewResult`（内含选文件；canceled）
- `workflow:commitImport` — `(sessionId, decisions) => IWorkflowImportResult`

Preview 与 Commit 用临时 `sessionId`（或 tempDir token）关联，避免二次选文件；Commit 失败或取消须清理 temp。

---

## 9. 错误处理

| 场景 | 行为 |
|------|------|
| 用户取消对话框 | `canceled: true`，无 toast 错误 |
| zip 损坏 / 缺 manifest / version 不符 | 明确错误文案，不写库 |
| 导出时资源缺失 | 仍导出；toast 警告 missing 数量 |
| Skill files 读写失败 | 导出：该 skill 仅写 JSON，结果中记警告；导入时若写 files 失败则 **中止**，并删除本会话已创建的新 ID 记录与新 Skill 目录 |
| Commit 中途失败 | 按资源顺序写入；失败则补偿删除本会话新建的 prompt/skill/workflow 及新 Skill 目录，避免半导入 |

---

## 10. 测试要点

- 组包：图含 prompt + skill + webpage；净化后无 KB/工作区路径；manifest 计数正确。
- 缺失资源：图引用不存在 ID → `missingResourceIds` 有值且 zip 仍可生成。
- 导入无冲突：新工作流在根级；resourceId 已重映射；提示词/Skill 可在各自列表中看到。
- 冲突三分支：跳过 / 覆盖 / 新建副本 后图引用与本机数据一致。
- 同名工作流：导入名称带 `（导入）` 后缀。
- 非法 zip / 取消对话框 / stripped 提示文案。

---

## 11. 非目标（本期不做）

- 批量导出多个工作流、导出整棵目录树
- 导入时选择目标目录
- 导出 / 导入业务实例与 `agent/` 产物
- 与提示词 JSON 备份格式互相转换
- 知识库内容随包迁移

---

## 12. 成功标准

1. 侧栏可导入 zip，根级出现可打开编辑的工作流。
2. 行菜单可导出 zip，换机或清库后导入仍能解析图，且提示词 / Skill / 网页配置可用（本机路径需用户重配）。
3. 冲突时用户能对每个资源选择跳过 / 覆盖 / 新建副本，结果符合第 6.3 节语义。
4. 不破坏现有提示词备份与 `duplicateWorkflow` 行为。
