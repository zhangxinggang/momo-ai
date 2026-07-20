# 工作流模板导入 / 导出 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为工作流侧栏提供 zip 模板导入，为工作流行 `···` 提供 zip 导出（含提示词、Skill、网页配置），并支持冲突弹窗决策。

**Architecture:** Main 进程用 `fflate` 组包/解包；纯函数处理图净化、资源收集、冲突检测、ID 重映射；IPC 两阶段 `previewImport` → `commitImport`（sessionId 关联临时目录）；Renderer 挂侧栏导入按钮、树菜单导出与冲突 Modal。

**Tech Stack:** Electron IPC、fflate、Vitest、React、Ant Design、Zustand、`@momo/tree`、`@momo/workflow`

**Spec:** [2026-07-20-workflow-import-export-design.md](../specs/2026-07-20-workflow-import-export-design.md)

## Global Constraints

- 仅模板包：不含 business / `agent/` / chat / `folderId`
- 冲突：跳过 | 覆盖 | 新建副本
- 本机路径导出剥离；导入后 toast 提示重配
- 导入工作流 / 提示词 / Skill 一律根级（`folderId = null`）
- 类型命名：`D*` / `E*` / `I*`；注释中文
- Zip 库：已有依赖 `fflate`（`zipSync` / `unzipSync`），勿新增 JSZip

---

## 文件结构概览

| 区域 | 新建 | 修改 |
|------|------|------|
| 类型 | `types/modules/workflow-backup.ts` | `types/modules/index.ts`、`ipc-channels.ts` |
| Main 纯逻辑 | `main/services/workflow/backup/graph.ts`、`names.ts`、`zip-codec.ts`、`conflicts.ts` | — |
| Main 编排 | `main/services/workflow/backup/export-template.ts`、`import-template.ts`、`session.ts`、`index.ts` | — |
| Main 测试 | `main/services/workflow/backup/*.test.ts` | — |
| IPC / Preload | `main/ipc/workflow-backup.ts`、`preload/api/workflow-backup.ts` | `main/ipc/index.ts`、`preload/api/index.ts`、`preload/index.ts` |
| momo-tree | — | `packages/momo-tree/src/types.ts`、`MomoTree/index.tsx` |
| Renderer | `services/workflow/backup-api.ts`、`hooks/useWorkflowBackup.ts`、`components/Workflow/WorkflowImportConflictModal/` | `Sidebar/index.tsx`、`WorkflowTreePanel/index.tsx` |

---

### Task 1: 类型与 IPC Channel

**Files:**
- Create: `apps/skill-platform/src/types/modules/workflow-backup.ts`
- Modify: `apps/skill-platform/src/types/modules/index.ts`
- Modify: `apps/skill-platform/src/types/constants/ipc-channels.ts`

**Interfaces:**
- Produces: 下文全部 `I*` / `E*` 类型与 channel 常量，供后续 Task 使用

- [ ] **Step 1: 新增 `workflow-backup.ts`**

```typescript
import type { IPrompt } from './prompt';
import type { ISkill } from './skill';

export type EWorkflowBackupConflictReason = 'sameId' | 'sameName';

export type EWorkflowBackupConflictAction = 'skip' | 'overwrite' | 'createCopy';

export type EWorkflowBackupResourceKind = 'prompt' | 'skill';

export interface IWorkflowTemplateManifest {
  version: 1;
  kind: 'workflow-template';
  exportedAt: string;
  workflowName: string;
  promptIds: string[];
  skillIds: string[];
  missingResourceIds: string[];
  strippedLocalPathCount: number;
}

export interface IWorkflowTemplateWorkflowFile {
  id: string;
  name: string;
  graphJson: string;
}

/** Skill 写入 zip 的元数据（无 local_repo_path） */
export interface IWorkflowTemplateSkillFile {
  skill: Omit<ISkill, 'local_repo_path'> & { local_repo_path?: null };
  /** files/ 下相对路径列表（仅清单；内容在 zip 内） */
  filePaths: string[];
}

export interface IWorkflowBackupConflictItem {
  kind: EWorkflowBackupResourceKind;
  packageId: string;
  packageName: string;
  existingId: string;
  existingName: string;
  reason: EWorkflowBackupConflictReason;
}

export interface IWorkflowBackupResourceDecision {
  kind: EWorkflowBackupResourceKind;
  packageId: string;
  action: EWorkflowBackupConflictAction;
}

export interface IWorkflowExportResult {
  canceled: boolean;
  path?: string;
  promptCount?: number;
  skillCount?: number;
  missingCount?: number;
  strippedLocalPathCount?: number;
  skillFileWarnings?: string[];
}

export interface IWorkflowImportPreviewResult {
  canceled: boolean;
  sessionId?: string;
  workflowName?: string;
  promptCount?: number;
  skillCount?: number;
  strippedLocalPathCount?: number;
  conflicts?: IWorkflowBackupConflictItem[];
  error?: string;
}

export interface IWorkflowImportCommitResult {
  canceled: boolean;
  workflowId?: string;
  workflowName?: string;
  promptCount?: number;
  skillCount?: number;
  strippedLocalPathCount?: number;
  error?: string;
}

/** 组包时内部用（测试可构造） */
export interface IWorkflowTemplatePackagePayload {
  manifest: IWorkflowTemplateManifest;
  workflow: IWorkflowTemplateWorkflowFile;
  prompts: IPrompt[];
  skills: Array<{
    skill: IWorkflowTemplateSkillFile['skill'];
    /** 相对路径 → 文件内容 */
    files: Record<string, Uint8Array>;
  }>;
}
```

- [ ] **Step 2: 在 `types/modules/index.ts` 增加**

```typescript
export * from './workflow-backup';
```

- [ ] **Step 3: 在 `ipc-channels.ts` 工作流区附近追加**

```typescript
WORKFLOW_EXPORT_TEMPLATE: 'workflow:exportTemplate',
WORKFLOW_PREVIEW_IMPORT: 'workflow:previewImport',
WORKFLOW_COMMIT_IMPORT: 'workflow:commitImport',
WORKFLOW_CANCEL_IMPORT: 'workflow:cancelImport',
```

- [ ] **Step 4: Commit**

```bash
git add apps/skill-platform/src/types/modules/workflow-backup.ts apps/skill-platform/src/types/modules/index.ts apps/skill-platform/src/types/constants/ipc-channels.ts
git commit -m "feat(workflow): add import/export backup types and IPC channels"
```

---

### Task 2: 图净化 / 收集 / 重映射纯函数

**Files:**
- Create: `apps/skill-platform/src/main/services/workflow/backup/graph.ts`
- Test: `apps/skill-platform/src/main/services/workflow/backup/graph.test.ts`

**Interfaces:**
- Consumes: 无
- Produces:
  - `sanitizeWorkflowGraphJson(graphJson: string): { graphJson: string; strippedLocalPathCount: number }`
  - `collectWorkflowResourceIds(graphJson: string): { promptIds: string[]; skillIds: string[] }`
  - `remapWorkflowResourceIds(graphJson: string, idMap: Map<string, string>): string`

- [ ] **Step 1: 写失败测试**

```typescript
import { describe, expect, it } from 'vitest';
import {
  collectWorkflowResourceIds,
  remapWorkflowResourceIds,
  sanitizeWorkflowGraphJson,
} from './graph';

describe('sanitizeWorkflowGraphJson', () => {
  it('清空 kbCollectionId 与 workspacePaths 并计数', () => {
    const input = JSON.stringify({
      nodes: [
        {
          id: '1',
          type: 'promptResource',
          data: {
            resourceKind: 'prompt',
            resourceId: 'p1',
            kbCollectionId: 3,
            workspacePaths: ['C:/a'],
          },
        },
        {
          id: '2',
          type: 'webpageResource',
          data: { url: 'https://example.com' },
        },
      ],
      edges: [],
    });
    const result = sanitizeWorkflowGraphJson(input);
    expect(result.strippedLocalPathCount).toBe(2);
    const parsed = JSON.parse(result.graphJson);
    expect(parsed.nodes[0].data.kbCollectionId).toBeUndefined();
    expect(parsed.nodes[0].data.workspacePaths).toBeUndefined();
    expect(parsed.nodes[1].data.url).toBe('https://example.com');
  });
});

describe('collectWorkflowResourceIds', () => {
  it('去重收集 prompt 与 skill', () => {
    const graphJson = JSON.stringify({
      nodes: [
        { id: 'a', data: { resourceKind: 'prompt', resourceId: 'p1' } },
        { id: 'b', data: { resourceKind: 'skill', resourceId: 's1' } },
        { id: 'c', data: { resourceKind: 'prompt', resourceId: 'p1' } },
        { id: 'd', data: { url: 'https://x' } },
      ],
      edges: [],
    });
    expect(collectWorkflowResourceIds(graphJson)).toEqual({
      promptIds: ['p1'],
      skillIds: ['s1'],
    });
  });
});

describe('remapWorkflowResourceIds', () => {
  it('按 map 替换 resourceId', () => {
    const graphJson = JSON.stringify({
      nodes: [{ id: 'a', data: { resourceKind: 'prompt', resourceId: 'old' } }],
      edges: [],
    });
    const next = remapWorkflowResourceIds(graphJson, new Map([['old', 'new']]));
    expect(JSON.parse(next).nodes[0].data.resourceId).toBe('new');
  });
});
```

- [ ] **Step 2: 运行确认失败**

Run: `cd apps/skill-platform && pnpm exec vitest run src/main/services/workflow/backup/graph.test.ts`

Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 `graph.ts`**

要点：
- `JSON.parse` 失败时抛中文错误「工作流图 JSON 无效」
- 遍历 `nodes`；对 `data` 对象删除 `kbCollectionId`（有值计 1）、非空 `workspacePaths` 数组计 1 后删除
- collect：仅当 `resourceKind` 为 `prompt`/`skill` 且 `resourceId` 为非空字符串
- remap：仅替换 map 中存在的 `resourceId`

- [ ] **Step 4: 跑测试通过**

Run: 同上  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/skill-platform/src/main/services/workflow/backup/graph.ts apps/skill-platform/src/main/services/workflow/backup/graph.test.ts
git commit -m "feat(workflow): add graph sanitize collect and remap helpers"
```

---

### Task 3: 名称去重与 Zip 编解码

**Files:**
- Create: `apps/skill-platform/src/main/services/workflow/backup/names.ts`
- Create: `apps/skill-platform/src/main/services/workflow/backup/zip-codec.ts`
- Test: `apps/skill-platform/src/main/services/workflow/backup/names.test.ts`
- Test: `apps/skill-platform/src/main/services/workflow/backup/zip-codec.test.ts`

**Interfaces:**
- Produces:
  - `sanitizeExportFileBaseName(name: string): string`
  - `allocateUniqueName(baseName: string, existingNames: Set<string>, suffix: string): string`  
    （`suffix` 如 `（导入）` / `（副本）`；若 `base` 已占用则试 `base+suffix`、`base+suffix 2`…）
  - `encodeWorkflowTemplateZip(payload: IWorkflowTemplatePackagePayload): Uint8Array`
  - `decodeWorkflowTemplateZip(bytes: Uint8Array): IWorkflowTemplatePackagePayload`

- [ ] **Step 1: names 测试 + 实现**

```typescript
// names.test.ts 核心用例
it('根名可用时原样返回', () => {
  expect(allocateUniqueName('A', new Set(), '（导入）')).toBe('A');
});
it('冲突时加后缀', () => {
  expect(allocateUniqueName('A', new Set(['A']), '（导入）')).toBe('A（导入）');
});
it('后缀仍冲突时加数字', () => {
  expect(allocateUniqueName('A', new Set(['A', 'A（导入）']), '（导入）')).toBe('A（导入）2');
});
```

`sanitizeExportFileBaseName`：替换 Windows 非法字符 `<>:"/\|?*` 与控制字符为 `_`，trim，空则 `workflow`。

- [ ] **Step 2: zip-codec 测试 + 实现**

使用 `zipSync` / `unzipSync`（`fflate`）。

编码路径约定：
- `manifest.json`、`workflow.json` 为 UTF-8 JSON
- `prompts/{id}.json`
- `skills/{id}/skill.json`
- `skills/{id}/files/{relativePath}`（relativePath 用 `/`）

解码：
- 校验 `manifest.version === 1 && manifest.kind === 'workflow-template'`，否则抛「不支持的工作流模板包版本或格式」
- 缺 `workflow.json` 抛「工作流模板包缺少 workflow.json」
- prompts/skills 按目录扫描；`files` 读入 `Record<string, Uint8Array>`

往返测试：构造最小 payload → encode → decode → 字段一致（含一个 skill 二进制文件）。

- [ ] **Step 3: 跑测试**

Run: `cd apps/skill-platform && pnpm exec vitest run src/main/services/workflow/backup/names.test.ts src/main/services/workflow/backup/zip-codec.test.ts`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/skill-platform/src/main/services/workflow/backup/names.ts apps/skill-platform/src/main/services/workflow/backup/names.test.ts apps/skill-platform/src/main/services/workflow/backup/zip-codec.ts apps/skill-platform/src/main/services/workflow/backup/zip-codec.test.ts
git commit -m "feat(workflow): add backup name helpers and zip codec"
```

---

### Task 4: 冲突检测纯函数

**Files:**
- Create: `apps/skill-platform/src/main/services/workflow/backup/conflicts.ts`
- Test: `apps/skill-platform/src/main/services/workflow/backup/conflicts.test.ts`

**Interfaces:**
- Produces:
  - `detectResourceConflicts(options: { kind; packageId; packageName; existingById; existingByName }): IWorkflowBackupConflictItem | null`
  - `detectAllConflicts(prompts, skills, localPrompts, localSkills): IWorkflowBackupConflictItem[]`  
    （`existingByName` 用 `title` 对 prompt、`name` 对 skill；同 ID 优先 reason=`sameId`，否则同名 `sameName`）

- [ ] **Step 1: 测试**

覆盖：无冲突；同 ID；仅同名；同 ID 与同名同时存在时 reason 为 `sameId`；prompt/skill 混合列表。

- [ ] **Step 2: 实现并跑通**

- [ ] **Step 3: Commit**

```bash
git add apps/skill-platform/src/main/services/workflow/backup/conflicts.ts apps/skill-platform/src/main/services/workflow/backup/conflicts.test.ts
git commit -m "feat(workflow): add backup conflict detection"
```

---

### Task 5: 导出编排（读库 → 组包 → 写文件由 IPC 注入）

**Files:**
- Create: `apps/skill-platform/src/main/services/workflow/backup/export-template.ts`
- Create: `apps/skill-platform/src/main/services/workflow/backup/index.ts`
- Test: `apps/skill-platform/src/main/services/workflow/backup/export-template.test.ts`

**Interfaces:**
- Consumes: `graph.ts`、`zip-codec.ts`、`names.ts`
- Produces:
  - `buildWorkflowTemplatePayload(deps): Promise<IWorkflowTemplatePackagePayload>`
  - deps 形状：

```typescript
export type IBuildWorkflowTemplateDeps = {
  workflowId: string;
  getWorkflow: (id: string) => Promise<{ id: string; name: string; graphJson: string } | null>;
  getPrompt: (id: string) => Promise<IPrompt | null>;
  getSkill: (id: string) => Promise<ISkill | null>;
  /** 返回相对路径 → bytes；路径不存在或失败返回 null（调用方记 warning） */
  readSkillFiles: (skill: ISkill) => Promise<Record<string, Uint8Array> | null>;
};
```

- [ ] **Step 1: 测试用内存 deps**

用例：
1. 工作流不存在 → throw「工作流不存在」
2. 图含 prompt+skill+webpage；prompt/skill 存在 → payload 含两者；graph 已净化；manifest.strippedLocalPathCount > 0
3. 图引用缺失 prompt → `missingResourceIds` 含该 id，prompts 数组无该项
4. `readSkillFiles` 返回 null → skills 项 `files` 为空对象，且测试通过断言（warnings 由上层收集时可在 build 返回 `{ payload, skillFileWarnings }`）

建议签名：

```typescript
export async function buildWorkflowTemplatePayload(
  deps: IBuildWorkflowTemplateDeps,
): Promise<{ payload: IWorkflowTemplatePackagePayload; skillFileWarnings: string[] }>
```

Skill 写入 payload 前删除 `local_repo_path`（置 `null`/省略）。Prompt 导出时 `folderId` 可保留原值，但 **导入 commit 时强制写 null**（见 Task 6）。

- [ ] **Step 2: 实现 + 测试通过**

- [ ] **Step 3: `index.ts` 再导出 graph/names/zip/conflicts/export/import（import 下 Task 补）**

- [ ] **Step 4: Commit**

```bash
git add apps/skill-platform/src/main/services/workflow/backup/export-template.ts apps/skill-platform/src/main/services/workflow/backup/export-template.test.ts apps/skill-platform/src/main/services/workflow/backup/index.ts
git commit -m "feat(workflow): build workflow template export payload"
```

---

### Task 6: 导入 Preview / Commit / Session

**Files:**
- Create: `apps/skill-platform/src/main/services/workflow/backup/session.ts`
- Create: `apps/skill-platform/src/main/services/workflow/backup/import-template.ts`
- Test: `apps/skill-platform/src/main/services/workflow/backup/import-template.test.ts`

**Interfaces:**
- Produces:
  - `createImportSession(payload): string` / `getImportSession(id)` / `deleteImportSession(id)`（内存 Map + 可选附带 temp 路径；进程内即可）
  - `buildImportPreviewFromPayload(payload, localPrompts, localSkills): Omit<IWorkflowImportPreviewResult, 'canceled'|'sessionId'>`
  - `commitWorkflowTemplateImport(options): Promise<IWorkflowImportCommitResult>`

`commit` deps：

```typescript
export type ICommitWorkflowTemplateDeps = {
  payload: IWorkflowTemplatePackagePayload;
  decisions: IWorkflowBackupResourceDecision[]; // 仅冲突项；无冲突资源默认 createCopy 语义（新建）
  listWorkflowNames: () => Promise<string[]>; // 全部名称用于根级同名
  createPrompt: (prompt: IPrompt) => Promise<void>; // 已带新 id、folderId=null
  updatePrompt: (id: string, prompt: IPrompt) => Promise<void>;
  createSkill: (skill: ISkill, files: Record<string, Uint8Array>) => Promise<string>; // 返回最终 id，并写盘
  updateSkill: (id: string, skill: ISkill, files: Record<string, Uint8Array>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  createWorkflow: (data: { name: string; graphJson: string; folderId: null }) => Promise<{ id: string; name: string }>;
  deleteWorkflow: (id: string) => Promise<void>;
};
```

**决策 → idMap 规则（必须测）：**

| 情况 | idMap |
|------|--------|
| 无冲突 | packageId → 新 uuid |
| skip | packageId → existingId |
| overwrite | packageId → existingId（并 update） |
| createCopy | packageId → 新 uuid（名称 `allocateUniqueName(..., '（副本）')`） |

工作流名：`allocateUniqueName(payload.workflow.name, new Set(await listWorkflowNames()), '（导入）')`。

失败补偿：记录本会话 `createdPromptIds` / `createdSkillIds` / `createdWorkflowId`，catch 中逆序删除。

- [ ] **Step 1: 写测试（内存 fake deps）**

1. 无冲突：新建 prompt+skill+workflow；graph resourceId 已换新
2. skip：不调用 createPrompt；resourceId 映射到 existing
3. overwrite：调用 updatePrompt；映射 existing
4. createCopy：新 id 且名带副本后缀
5. 中途 createWorkflow 抛错 → 已 create 的 prompt 被 delete

- [ ] **Step 2: 实现 session + import-template，测试通过**

- [ ] **Step 3: 更新 `index.ts` 导出**

- [ ] **Step 4: Commit**

```bash
git add apps/skill-platform/src/main/services/workflow/backup/session.ts apps/skill-platform/src/main/services/workflow/backup/import-template.ts apps/skill-platform/src/main/services/workflow/backup/import-template.test.ts apps/skill-platform/src/main/services/workflow/backup/index.ts
git commit -m "feat(workflow): add template import preview commit and sessions"
```

---

### Task 7: IPC + Preload 接线

**Files:**
- Create: `apps/skill-platform/src/main/ipc/workflow-backup.ts`
- Create: `apps/skill-platform/src/preload/api/workflow-backup.ts`
- Modify: `apps/skill-platform/src/main/ipc/index.ts`
- Modify: `apps/skill-platform/src/preload/api/index.ts`
- Modify: `apps/skill-platform/src/preload/index.ts`（暴露 `workflowBackup`）

**Interfaces:**
- Consumes: Task 5–6 导出函数；`PromptDB` / `SkillDB` / `WorkflowController`；`SkillInstaller.readLocalRepoFileBuffersByPath`；`ensureLocalRepoPath` 或写入 skills 目录的既有工具
- Produces: preload `workflowBackupApi.exportTemplate | previewImport | commitImport | cancelImport`

- [ ] **Step 1: 实现 `registerWorkflowBackupIPC`**

```typescript
// 伪代码结构
export function registerWorkflowBackupIPC(
  workflowDb: WorkflowController,
  promptDb: PromptDB,
  skillDb: SkillDB, // 与 ipc/index 中 skill 所用同一实例
): void {
  ipcMain.handle(IPC_CHANNELS.WORKFLOW_EXPORT_TEMPLATE, async (_, workflowId: string) => {
    // build payload → dialog.showSaveDialog → fs.writeFileSync(Buffer.from(encode...))
    // 取消返回 { canceled: true }
  });

  ipcMain.handle(IPC_CHANNELS.WORKFLOW_PREVIEW_IMPORT, async () => {
    // showOpenDialog zip → decode → detect conflicts → createImportSession(payload) → return preview
  });

  ipcMain.handle(IPC_CHANNELS.WORKFLOW_COMMIT_IMPORT, async (_, sessionId, decisions) => {
    // get session → commit with real db adapters → delete session → return result
  });

  ipcMain.handle(IPC_CHANNELS.WORKFLOW_CANCEL_IMPORT, async (_, sessionId: string) => {
    deleteImportSession(sessionId);
    return { canceled: true };
  });
}
```

Skill files 写入：复用 `SkillInstaller` / repo 层「按 skillName 写目录 + 更新 local_repo_path」的现有路径（参考 `ensureLocalRepoPath`、default-skills 导入）。覆盖时先写文件再 `skillDb.update`。

Prompt：新建用 `insertPromptDirect`（新 uuid、`folderId: null`、时间戳刷新）；覆盖用现有 update API。

- [ ] **Step 2: 在 `ipc/index.ts` 注册**（需传入 `skillDB`，与 `registerSkillIPC` 同源）

- [ ] **Step 3: preload**

```typescript
// preload/api/workflow-backup.ts
export const workflowBackupApi = {
  exportTemplate: (workflowId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_EXPORT_TEMPLATE, workflowId),
  previewImport: () => ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_PREVIEW_IMPORT),
  commitImport: (sessionId: string, decisions: IWorkflowBackupResourceDecision[]) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_COMMIT_IMPORT, sessionId, decisions),
  cancelImport: (sessionId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_CANCEL_IMPORT, sessionId),
};
```

在 `preload/index.ts` 的 contextBridge 对象上增加 `workflowBackup: workflowBackupApi`。

- [ ] **Step 4: Commit**

```bash
git add apps/skill-platform/src/main/ipc/workflow-backup.ts apps/skill-platform/src/main/ipc/index.ts apps/skill-platform/src/preload/api/workflow-backup.ts apps/skill-platform/src/preload/api/index.ts apps/skill-platform/src/preload/index.ts
git commit -m "feat(workflow): wire workflow backup IPC and preload"
```

---

### Task 8: 扩展 MomoTree 导出菜单

**Files:**
- Modify: `packages/momo-tree/src/types.ts`
- Modify: `packages/momo-tree/src/components/MomoTree/index.tsx`

**Interfaces:**
- Produces: `IMomoTreeAdapter.onExport?: (nodeId: string) => Promise<void>`；`IMomoTreeLabels.export?: string`

- [ ] **Step 1: types 增加可选字段**

```typescript
// IMomoTreeLabels
export?: string;

// IMomoTreeAdapter
onExport?: (nodeId: string) => Promise<void>;
```

- [ ] **Step 2: `buildFileMenuItems` 在 `onCopy` 之后插入**

```typescript
if (adapter.onExport && labels.export) {
  items.push({
    key: 'export',
    label: labels.export,
    onClick: () => void adapter.onExport?.(node.id),
  });
}
```

- [ ] **Step 3: 若 monorepo 需 build momo-tree，按仓库惯例执行（如 `pnpm --filter @momo/tree build`）；否则 skill-platform 直接源码引用则跳过**

- [ ] **Step 4: Commit**

```bash
git add packages/momo-tree/src/types.ts packages/momo-tree/src/components/MomoTree/index.tsx
git commit -m "feat(momo-tree): support optional file export menu action"
```

---

### Task 9: Renderer API、Hook、冲突弹窗、侧栏接线

**Files:**
- Create: `apps/skill-platform/src/renderer/services/workflow/backup-api.ts`
- Create: `apps/skill-platform/src/renderer/hooks/useWorkflowBackup.ts`
- Create: `apps/skill-platform/src/renderer/components/Workflow/WorkflowImportConflictModal/index.tsx`
- Create: `apps/skill-platform/src/renderer/components/Workflow/WorkflowImportConflictModal/types.ts`
- Modify: `apps/skill-platform/src/renderer/components/Workflow/WorkflowTreePanel/index.tsx`
- Modify: `apps/skill-platform/src/renderer/components/Layout/Sidebar/index.tsx`

**Interfaces:**
- Consumes: `window.electron.workflowBackup`（以项目实际 preload 挂载名为准，对齐 `window.electron.io` 写法）
- Produces: `useWorkflowBackup()` → `{ exportWorkflow, importWorkflow, isExporting, isImporting, conflictModal }`

- [ ] **Step 1: `backup-api.ts`**

对齐 `services/io/api.ts`：检查 API 可用性；封装四个 invoke。

- [ ] **Step 2: `WorkflowImportConflictModal`**

Props（`types.ts` 内 `IProps`）：
- `open: boolean`
- `workflowName: string`
- `conflicts: IWorkflowBackupConflictItem[]`
- `onCancel: () => void`
- `onConfirm: (decisions: IWorkflowBackupResourceDecision[]) => void`

UI：Modal 标题「导入工作流冲突」；顶部三个按钮设全体 action；表格/列表每行 Select（跳过/覆盖/新建副本）；确定/取消。

- [ ] **Step 3: `useWorkflowBackup`**

```typescript
// 导出
const result = await exportWorkflowTemplate(workflowId);
// toast：取消静默；成功提示路径与数量；missingCount>0 警告

// 导入
const preview = await previewWorkflowImport();
if (preview.canceled) return;
if (preview.error) { toast error; return; }
if (!preview.conflicts?.length) {
  await commit(preview.sessionId!, []);
} else {
  // 打开 Modal，确认后 commit，取消则 cancelImport(sessionId)
}
// commit 成功：fetchWorkflows + fetchPrompts + fetchSkills（及树刷新）；
// strippedLocalPathCount>0 时 message.info「已清除 N 处本机路径，请重新配置」
```

- [ ] **Step 4: `WorkflowTreePanel`**

```typescript
onExport: async (nodeId) => { await exportWorkflow(nodeId); },
// labels
export: '导出',
```

- [ ] **Step 5: `Sidebar` 工作流工具栏**

仿 `promptBackupActions`，仅 Upload 按钮 `title='导入工作流'`，`extraActions={workflowImportActions}`；渲染 `conflictModal`（来自 hook 的 element 或状态提升到 Sidebar）。

推荐：hook 返回 `{ conflictModalProps, ...}`，Sidebar 挂载 `<WorkflowImportConflictModal {...conflictModalProps} />`。

- [ ] **Step 6: 手动验证清单（实现者在应用内点验）**

1. 导出含 prompt/skill/webpage 的工作流 → 得到 zip  
2. 导入无冲突 → 根级新工作流，资源出现在提示词/Skill  
3. 再导入一次同包 → 冲突弹窗；分别试跳过/覆盖/新建副本  
4. 取消冲突弹窗 → 无新数据  
5. 导出时缺资源 → toast 警告仍成功

- [ ] **Step 7: Commit**

```bash
git add apps/skill-platform/src/renderer/services/workflow/backup-api.ts apps/skill-platform/src/renderer/hooks/useWorkflowBackup.ts apps/skill-platform/src/renderer/components/Workflow/WorkflowImportConflictModal apps/skill-platform/src/renderer/components/Workflow/WorkflowTreePanel/index.tsx apps/skill-platform/src/renderer/components/Layout/Sidebar/index.tsx
git commit -m "feat(workflow): add import export UI and conflict modal"
```

---

### Task 10: 回归与规格核对

**Files:** 无新文件（按需修 bug）

- [ ] **Step 1: 跑相关单测**

Run: `cd apps/skill-platform && pnpm exec vitest run src/main/services/workflow/backup`

Expected: 全部 PASS

- [ ] **Step 2: 对照 spec 成功标准 §12 勾选**

- [ ] **Step 3: 若有修复，单独 commit**

```bash
git commit -m "fix(workflow): address import export review gaps"
```

---

## Spec 覆盖自检

| Spec 项 | Task |
|---------|------|
| Zip 格式 manifest/workflow/prompts/skills | Task 3 zip-codec、Task 5 |
| 导出菜单 ··· | Task 8–9 |
| 侧栏导入 | Task 9 |
| 剥离本机路径 + 导入提示 | Task 2、9 |
| 冲突弹窗三选一 | Task 4、6、9 |
| 导入根级 | Task 6、7 |
| 缺失资源仍导出 | Task 5 |
| 失败回滚 | Task 6 |
| 不含 business/agent | 全局约束 + 非目标，无 Task 引入 |
| cancel 会话清理 | Task 6 session + Task 7 CANCEL |

无 TBD 占位；类型名与 Task 1 定义一致。
