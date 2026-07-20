# AI 对话侧栏项目树 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 AI 对话历史改为「项目 → 对话」二级树，工作区上下文绑定项目文件夹，并移除 Skills「AI 对话」入口与工作区面板的启用/常用/添加目录。

**Architecture:** 新增 `IChatProject` + zustand `useChatProjectStore`；`IChatSession.projectId` 归属项目；侧栏 `ChatPanel` 渲染树与 `ChatProjectModal`；`activeFolderPaths` 随当前会话同步，供 `getEnabledWorkspaceContext` 与只读工作区面板使用。

**Tech Stack:** TypeScript、React、Ant Design、zustand persist、`@momo/aichat`、vitest

**Spec:** `docs/superpowers/specs/2026-08-29-ai-chat-project-tree-design.md`

## Global Constraints

- 类型前缀：`I*` / `D*` / `E*`；组件 Props 固定 `IProps`；注释中文
- 移出项目：级联删除其下全部会话
- 唯一键：`normalize(name) + 排序去重后的 folderPaths`；无文件夹时同名禁止
- 旧会话迁入「未分类」；旧 workspace presets 不自动转项目
- 不写无关 md；临时测试文件验证后删除

---

## 文件变更一览

| 操作 | 文件 | 职责 |
| --- | --- | --- |
| Create | `packages/momo-aichat/src/types/project.ts` | `IChatProject` |
| Create | `packages/momo-aichat/src/utils/chat-project.ts` | 唯一键、展示名、路径规范化 |
| Create | `packages/momo-aichat/src/utils/relative-compact-time.ts` | `1h`/`1d`/`1mo`/`1ye` |
| Create | `packages/momo-aichat/src/utils/chat-project.test.ts` | 唯一键单测 |
| Create | `packages/momo-aichat/src/utils/relative-compact-time.test.ts` | 相对时间单测 |
| Modify | `packages/momo-aichat/src/types/chat.ts` | `projectId`；`createSessionInProject` |
| Modify | `packages/momo-aichat/src/types/workspace.ts` | 只读可选回调 |
| Modify | `packages/momo-aichat/src/hooks/useChatSessions.ts` | 创建/迁移/按项目删除 |
| Modify | `packages/momo-aichat/src/hooks/useChatWorkspaceConfig.ts` | `buildReadonlyChatWorkspaceConfig` |
| Modify | `packages/momo-aichat/src/components/ChatWorkspaceToolbar/index.tsx` | 去掉启用/常用/添加 |
| Modify | `packages/momo-aichat/src/index.ts` | 导出 |
| Create | `apps/skill-platform/src/renderer/store/chat/project.ts` | 项目 + recent + activeFolderPaths |
| Modify | `apps/skill-platform/src/renderer/store/chat/index.ts` | 导出 project store；旧 workspace 可保留但主路径不用 |
| Modify | `apps/skill-platform/src/renderer/store/index.ts` | 导出 |
| Create | `apps/skill-platform/src/renderer/components/Chat/ChatProjectModal/` | 创建/编辑弹框 |
| Modify | `apps/skill-platform/src/renderer/components/Chat/ChatPanel/` | 二级树 UI |
| Create | `apps/skill-platform/src/renderer/components/Chat/ChatActiveProjectBridge/` | 同步 activeFolderPaths |
| Modify | `apps/skill-platform/src/renderer/hooks/useChatWorkspaceBinding.ts` | 只读绑定 activeFolderPaths |
| Modify | `apps/skill-platform/src/renderer/hooks/useLocalPathBinding.ts` | 改读 activeFolderPaths |
| Modify | `apps/skill-platform/src/renderer/services/workspace/context.ts` | 改读 activeFolderPaths |
| Modify | `apps/skill-platform/src/renderer/components/Chat/ChatModuleProvider/index.tsx` | 挂载 Bridge；ensure 自由对话 |
| Modify | Skills 列表/卡片/Library；删除 SkillAiChat\* | 去掉 AI 对话入口 |

---

### Task 1: 项目工具函数与相对时间（TDD）

**Files:**

- Create: `packages/momo-aichat/src/utils/chat-project.ts`
- Create: `packages/momo-aichat/src/utils/chat-project.test.ts`
- Create: `packages/momo-aichat/src/utils/relative-compact-time.ts`
- Create: `packages/momo-aichat/src/utils/relative-compact-time.test.ts`
- Create: `packages/momo-aichat/src/types/project.ts`
- Modify: `packages/momo-aichat/src/index.ts`

**Interfaces:**

- Produces: `IChatProject`；`normalizeFolderPaths`；`buildChatProjectUniqueKey`；`getChatProjectDisplayName`；`formatRelativeCompact(ts, now?)`

- [ ] **Step 1: 写失败单测 `chat-project.test.ts`**

```typescript
import { describe, expect, it } from 'vitest';
import {
  buildChatProjectUniqueKey,
  getChatProjectDisplayName,
  normalizeFolderPaths,
} from './chat-project';

describe('normalizeFolderPaths', () => {
  it('trim 去重排序', () => {
    expect(normalizeFolderPaths(['/b', ' /a ', '/b', ''])).toEqual(['/a', '/b']);
  });
});

describe('buildChatProjectUniqueKey', () => {
  it('同名空文件夹键相同', () => {
    expect(buildChatProjectUniqueKey('自由对话', [])).toBe(
      buildChatProjectUniqueKey(' 自由对话 ', []),
    );
  });
  it('路径顺序不影响键', () => {
    expect(buildChatProjectUniqueKey('p', ['/b', '/a'])).toBe(
      buildChatProjectUniqueKey('p', ['/a', '/b']),
    );
  });
});

describe('getChatProjectDisplayName', () => {
  it('有名称用名称', () => {
    expect(getChatProjectDisplayName({ name: '我的项目', folderPaths: ['/x/y'] })).toBe('我的项目');
  });
  it('无名称用首路径 basename', () => {
    expect(getChatProjectDisplayName({ name: '  ', folderPaths: ['/x/y'] })).toBe('y');
  });
});
```

- [ ] **Step 2: 写失败单测 `relative-compact-time.test.ts`**

```typescript
import { describe, expect, it } from 'vitest';
import { formatRelativeCompact } from './relative-compact-time';

const now = Date.parse('2026-08-29T12:00:00.000Z');

describe('formatRelativeCompact', () => {
  it('不足 1h 显示 1h 起算或按实现：2h30m → 2h', () => {
    expect(formatRelativeCompact(now - (2 * 3600 + 30 * 60) * 1000, now)).toBe('2h');
  });
  it('天', () => {
    expect(formatRelativeCompact(now - 3 * 24 * 3600 * 1000, now)).toBe('3d');
  });
  it('月（按 30 天）', () => {
    expect(formatRelativeCompact(now - 60 * 24 * 3600 * 1000, now)).toBe('2mo');
  });
  it('年（按 365 天）', () => {
    expect(formatRelativeCompact(now - 400 * 24 * 3600 * 1000, now)).toBe('1ye');
  });
});
```

- [ ] **Step 3: 运行确认失败**

Run: `pnpm --filter @momo/aichat test -- src/utils/chat-project.test.ts src/utils/relative-compact-time.test.ts`  
Expected: FAIL（模块不存在）

- [ ] **Step 4: 实现类型与工具**

`types/project.ts`:

```typescript
export interface IChatProject {
  id: string;
  name: string;
  folderPaths: string[];
  createdAt: number;
  updatedAt: number;
}
```

`chat-project.ts`：实现 `normalizeFolderPaths`、`buildChatProjectUniqueKey(name, paths)`（`trim(name) + '\\0' + paths.join('\\0')`）、`getChatProjectDisplayName({ name, folderPaths })`（basename 用 `/` 与 `\\` 分割取最后一段）。

`relative-compact-time.ts`：差值取最大整单位，阈值：`ye`≥365d，`mo`≥30d，`d`≥1d，否则 `Math.max(1, hours)` 显示 `Nh`（不足 1h 显示 `1h`）。

- [ ] **Step 5: 从 `index.ts` 导出上述符号**

- [ ] **Step 6: 跑测通过**

Run: `pnpm --filter @momo/aichat test -- src/utils/chat-project.test.ts src/utils/relative-compact-time.test.ts`  
Expected: PASS

- [ ] **Step 7: Commit**（仅当用户要求提交时执行；否则跳过所有 Commit 步骤）

```bash
git add packages/momo-aichat/src/types/project.ts packages/momo-aichat/src/utils/chat-project.ts packages/momo-aichat/src/utils/chat-project.test.ts packages/momo-aichat/src/utils/relative-compact-time.ts packages/momo-aichat/src/utils/relative-compact-time.test.ts packages/momo-aichat/src/index.ts
git commit -m "$(cat <<'EOF'
feat(aichat): 项目唯一键与紧凑相对时间工具

EOF
)"
```

---

### Task 2: Session 增加 projectId 与按项目创建/删除

**Files:**

- Modify: `packages/momo-aichat/src/types/chat.ts`
- Modify: `packages/momo-aichat/src/hooks/useChatSessions.ts`
- Modify: `packages/momo-aichat/src/contexts/ChatContext.tsx`（若需透传）

**Interfaces:**

- Consumes: 无
- Produces:
  - `IChatSession.projectId?: string`
  - `createSessionInProject(projectId: string): IChatSession`
  - `deleteSessionsByProjectId(projectId: string): void`
  - `assignMissingProjectIds(defaultProjectId: string): void`

- [ ] **Step 1: 扩展 `IChatSession` 与 `IChatContext`**

```typescript
export interface IChatSession {
  // ...existing
  /** 所属对话项目 id */
  projectId?: string;
}

// IChatContext 增加：
createSessionInProject: (projectId: string) => IChatSession;
deleteSessionsByProjectId: (projectId: string) => void;
assignMissingProjectIds: (defaultProjectId: string) => void;
```

- [ ] **Step 2: 在 `useChatSessions` 实现**

`createSessionInProject`：同 `createNewSession`，但设置 `projectId`，标题 `'新对话'`，立即落库并选中。

`deleteSessionsByProjectId`：对匹配会话若在生成则 `stopGeneration`，过滤掉后 `debouncedSave`；若当前会话被删则切到剩余第一条或 `null`。

`assignMissingProjectIds`：将 `!session.projectId` 的会话设为 `defaultProjectId` 并保存。

加载解析处保持兼容缺字段。

- [ ] **Step 3: 导出到 context 返回值**

- [ ] **Step 4: 手工验证类型编译**

Run: `pnpm --filter @momo/aichat exec tsc --noEmit`（若包无独立 tsc，则用仓库既有 typecheck 脚本）  
Expected: 无因新字段导致的错误（宿主未用新 API 前可先可选）

- [ ] **Step 5: Commit**（用户要求时）

```bash
git commit -m "$(cat <<'EOF'
feat(aichat): 会话支持 projectId 与按项目创建删除

EOF
)"
```

---

### Task 3: 项目 Store（含 recent 与 activeFolderPaths）

**Files:**

- Create: `apps/skill-platform/src/renderer/store/chat/project.ts`
- Modify: `apps/skill-platform/src/renderer/store/chat/index.ts`
- Modify: `apps/skill-platform/src/renderer/store/index.ts`

**Interfaces:**

- Consumes: `IChatProject`、`buildChatProjectUniqueKey`、`normalizeFolderPaths`
- Produces: `useChatProjectStore` 及下列 actions

```typescript
interface IChatProjectState {
  projects: IChatProject[];
  recentFolderPaths: string[];
  /** 当前会话所属项目的文件夹，供上下文注入 */
  activeFolderPaths: string[];
  ensureUncategorizedProject: () => string; // 返回未分类 id
  createProject: (
    name: string,
    folderPaths: string[],
  ) => { ok: true; project: IChatProject } | { ok: false; reason: 'duplicate' | 'empty-name' };
  updateProject: (
    id: string,
    name: string,
    folderPaths: string[],
  ) => { ok: true } | { ok: false; reason: 'duplicate' | 'empty-name' | 'not-found' };
  removeProject: (id: string) => void;
  setActiveFolderPaths: (paths: string[]) => void;
  pushRecentFolders: (paths: string[]) => void;
  removeRecentFolder: (path: string) => void;
  getVisibleRecentFolders: () => string[]; // 最多 8 条
}
```

- [ ] **Step 1: 实现 `project.ts`**

- persist `name: 'chat-project-storage'`，`partialize`: `projects` + `recentFolderPaths`（不持久化 `activeFolderPaths`）
- `UNCATEGORIZED_NAME = '自由对话'`
- `ensureUncategorizedProject`：若不存在名为「未分类」且 `folderPaths` 为空的项目则创建并返回 id；若已存在返回其 id（用唯一键匹配，不要只按 name）
- `createProject` / `updateProject`：名称 trim 空 → `empty-name`；唯一键与**其它**项目冲突 → `duplicate`
- `pushRecentFolders`：逐个路径 trim，队首插入去重；数组可超过 8
- `getVisibleRecentFolders`：`recentFolderPaths.slice(0, 8)`
- `removeRecentFolder`：过滤该 path

- [ ] **Step 2: 从 `store/chat/index.ts` 与 `store/index.ts` 导出 `useChatProjectStore`**

保留现有 `useChatWorkspaceStore` 文件暂不删（笔记等可能仍引用）；主 AI 对话不再读写其 enabled/presets。

- [ ] **Step 3: 快速手工验证（可选 node/浏览器）**：ensure 两次 id 相同；同名空文件夹 create 第二次失败

- [ ] **Step 4: Commit**（用户要求时）

---

### Task 4: 工作区只读绑定与上下文注入

**Files:**

- Modify: `packages/momo-aichat/src/types/workspace.ts`
- Modify: `packages/momo-aichat/src/hooks/useChatWorkspaceConfig.ts`
- Modify: `packages/momo-aichat/src/components/ChatWorkspaceToolbar/index.tsx`
- Modify: `packages/momo-aichat/src/components/ChatWorkspaceToolbar/index.module.less`（按需）
- Modify: `apps/skill-platform/src/renderer/hooks/useChatWorkspaceBinding.ts`
- Modify: `apps/skill-platform/src/renderer/hooks/useLocalPathBinding.ts`
- Modify: `apps/skill-platform/src/renderer/services/workspace/context.ts`
- Create: `apps/skill-platform/src/renderer/components/Chat/ChatActiveProjectBridge/index.tsx`
- Modify: `apps/skill-platform/src/renderer/components/Chat/ChatModuleProvider/index.tsx`

**Interfaces:**

- Consumes: `useChatProjectStore.activeFolderPaths`；`useChatContext` sessions
- Produces: 只读 `IChatWorkspaceConfig`；Bridge 同步 paths

- [ ] **Step 1: 扩展 workspace 类型，新增只读构建**

保留旧字段为 optional，避免笔记/工作流编译挂掉：

```typescript
export interface IChatWorkspaceConfig {
  enabled: boolean;
  paths: string[];
  path: string | null;
  /** 只读模式可不传 */
  onEnabledChange?: (enabled: boolean) => void;
  onAddFolder?: () => void;
  onRemoveFolder?: (folderPath: string) => void;
  // presets 相关全部 optional（已有）
  onOpenFolderPath?: (folderPath: string) => void;
  checkPathExists?: (folderPath: string) => Promise<boolean>;
}

export function buildReadonlyChatWorkspaceConfig(input: {
  paths: string[];
  onOpenFolderPath?: (folderPath: string) => void;
  checkPathExists?: (folderPath: string) => Promise<boolean>;
}): IChatWorkspaceConfig {
  const paths = input.paths;
  return {
    enabled: paths.length > 0,
    paths,
    path: paths[0] ?? null,
    onOpenFolderPath: input.onOpenFolderPath,
    checkPathExists: input.checkPathExists,
  };
}
```

- [ ] **Step 2: Toolbar 只读 UI**

若无 `onEnabledChange` / `onAddFolder` / `onPresetSave`：不渲染 Switch、星标、添加目录；仅列表展示 `workspace.paths`（可点开路径）。无路径时显示「当前项目未配置文件夹」类文案。

- [ ] **Step 3: `useChatWorkspaceBinding` 改为**

```typescript
const activeFolderPaths = useChatProjectStore((s) => s.activeFolderPaths);
return useMemo(
  () =>
    buildReadonlyChatWorkspaceConfig({
      paths: activeFolderPaths,
      onOpenFolderPath: (p) => {
        void openFolderPath(p);
      },
      checkPathExists,
    }),
  [activeFolderPaths],
);
```

- [ ] **Step 4: `getEnabledWorkspaceContext`**

```typescript
const { activeFolderPaths } = useChatProjectStore.getState();
if (activeFolderPaths.length === 0) return '';
return buildWorkspaceContextForPaths(activeFolderPaths, userMessage);
```

- [ ] **Step 5: `useLocalPathBinding` 的 `effectiveWorkspacePaths` 改为 `activeFolderPaths`**

- [ ] **Step 6: `ChatActiveProjectBridge`**

在 ChatProvider 子树内：

```typescript
const { currentSession, sessions, currentSessionId } = useChatContext();
const projects = useChatProjectStore((s) => s.projects);
const setActiveFolderPaths = useChatProjectStore((s) => s.setActiveFolderPaths);

useEffect(() => {
  const session = currentSession ?? sessions.find((s) => s.id === currentSessionId);
  const project = session?.projectId ? projects.find((p) => p.id === session.projectId) : undefined;
  setActiveFolderPaths(project?.folderPaths ?? []);
}, [currentSession, currentSessionId, sessions, projects, setActiveFolderPaths]);
```

挂到 `ChatModuleProvider` 的 `ChatProvider` children 内（与 `ChatSessionIdBridge` 并列）。

Provider 挂载时调用 `ensureUncategorizedProject` + `assignMissingProjectIds`（在能拿到 context 的子组件 `ChatProjectMigrationBridge` 中执行一次）。

- [ ] **Step 7: 验证**：选有文件夹项目的会话 → 工作区面板只读列出路径；发消息上下文非空；空项目不注入

- [ ] **Step 8: Commit**（用户要求时）

---

### Task 5: ChatProjectModal（创建/编辑）

**Files:**

- Create: `apps/skill-platform/src/renderer/components/Chat/ChatProjectModal/index.tsx`
- Create: `apps/skill-platform/src/renderer/components/Chat/ChatProjectModal/index.module.less`
- Create: `apps/skill-platform/src/renderer/components/Chat/ChatProjectModal/types.ts`

**Interfaces:**

- Consumes: `useChatProjectStore`；`pickFolders` from desktop
- Produces: `<ChatProjectModal open mode projectId? onClose onSuccess />`

```typescript
// types.ts
export interface IProps {
  open: boolean;
  mode: 'create' | 'edit';
  projectId?: string;
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
}
```

- [ ] **Step 1: 实现弹框 UI**

- Modal 标题：创建项目 / 编辑项目
- 表单项：项目名称 Input（必填）
- 已选文件夹列表：每行路径 + 删除；按钮「添加文件夹」→ `pickFolders()` → 合并进本地 state + `pushRecentFolders`
- 「最近选择的目录」：`getVisibleRecentFolders()`，点击加入已选（已存在则忽略）；每行可删 recent（`removeRecentFolder`）
- 确定：create → `createProject`；edit → `updateProject`；失败用 message.error（`名称不能为空` / `已存在相同名称与文件夹的项目`）
- 成功：`onSuccess(id)` + `onClose`

- [ ] **Step 2: 编辑模式打开时用 `projects.find` 填充 name / folderPaths**

- [ ] **Step 3: 手工验证唯一性与 recent 8 条补全**

- [ ] **Step 4: Commit**（用户要求时）

---

### Task 6: ChatPanel 二级树

**Files:**

- Modify: `apps/skill-platform/src/renderer/components/Chat/ChatPanel/index.tsx`
- Modify: `apps/skill-platform/src/renderer/components/Chat/ChatPanel/index.module.less`

**Interfaces:**

- Consumes: `useChatContext` 新 API；`useChatProjectStore`；`ChatProjectModal`；`formatRelativeCompact`；`getChatProjectDisplayName`

- [ ] **Step 1: 顶栏**

- 文案「工作区」（替换「对话历史」）
- 行 hover 显示添加 icon → 打开 `ChatProjectModal` `mode='create'`
- 去掉原「新建对话」按钮（新建改到项目行）

- [ ] **Step 2: 树数据**

```typescript
const tree = projects.map((project) => ({
  project,
  sessions: sessions
    .filter((s) => s.projectId === project.id)
    .sort((a, b) => b.updatedAt - a.updatedAt),
}));
```

搜索：过滤会话标题；无匹配会话的项目在有 keyword 时隐藏（或仍显示空项目——实现选：有 keyword 时只显示含匹配会话的项目）。

- [ ] **Step 3: 一级行**

- key=`project.id`；展示 `getChatProjectDisplayName(project)`
- 点击切换 `expandedIds`
- hover：`Dropdown`（编辑项目 / 移出项目）+ 添加 icon → `createSessionInProject(project.id)`
- 移出：`Popconfirm` → 先 `deleteSessionsByProjectId` 再 `removeProject`；若删的是当前项目会话已在 deleteSessions 处理

- [ ] **Step 4: 二级行**

- 标题 + `formatRelativeCompact(session.updatedAt)`
- hover：时间左侧 `...` → 重命名 / 删除（沿用现有 Input 重命名与 Popconfirm 删除）
- 点击 `switchToSession`

- [ ] **Step 5: 样式**

- 一级缩进 0，二级缩进；hover 显示操作；时间常驻靠右；操作按钮默认隐藏

- [ ] **Step 6: 空态**：无项目时引导顶栏添加；有项目无会话显示项目空

- [ ] **Step 7: 验证成功标准 1/2/6**

- [ ] **Step 8: Commit**（用户要求时）

---

### Task 7: 移除 Skills「AI 对话」

**Files:**

- Modify: `apps/skill-platform/src/renderer/components/Skill/SkillListView/index.tsx`
- Modify: `apps/skill-platform/src/renderer/components/Skill/SkillGalleryCard/index.tsx`
- Modify: `apps/skill-platform/src/renderer/components/Skill/SkillLibraryView/index.tsx`
- Delete: `apps/skill-platform/src/renderer/components/Skill/SkillAiChatModal/`（整目录）
- Delete: `apps/skill-platform/src/renderer/components/Skill/SkillAiChat/`（整目录）
- Grep 清理其它引用（`instructions-for-chat` 若仅被 SkillAiChat 使用则保留给输入栏技能流，勿误删）

- [ ] **Step 1: 去掉 props `onOpenSkillAiChat` 与按钮**

- [ ] **Step 2: Library 去掉 state 与 `<SkillAiChatModal />`**

- [ ] **Step 3: 删除 Modal/AiChat 目录；全库 grep `SkillAiChat` 应为 0**

- [ ] \*\*Step 4: 确认输入栏 `SkillChatSelector` / 技能流仍可用

- [ ] **Step 5: Commit**（用户要求时）

---

### Task 8: 端到端验收与收尾

**Files:** 按失败点修补；不新增范围

- [ ] **Step 1: 验收清单**

1. 顶栏创建项目 → 树出现一级
2. 项目下新建对话 → 二级出现；相对时间可见
3. 编辑项目改文件夹 → 工作区只读列表更新；发消息带上下文
4. 移出项目 → 对话消失
5. 重启应用 → 「未分类」容纳旧会话；项目仍在
6. 同名空文件夹项目无法保存
7. Skills 无 AI 对话按钮
8. 工作区面板无启用/常用/添加目录

- [ ] **Step 2: 跑相关测试**

Run: `pnpm --filter @momo/aichat test`  
Expected: PASS

- [ ] **Step 3: 若有临时调试文件则删除**

- [ ] **Step 4: 更新 spec 状态已在确认；无需另写 md**

---

## Spec 覆盖自检

| Spec 要求                      | Task           |
| ------------------------------ | -------------- |
| IChatProject + 唯一键          | 1, 3           |
| session.projectId / 未分类迁移 | 2, 3, 4 Bridge |
| 最近目录 8 条                  | 3, 5           |
| 侧栏树与交互                   | 6              |
| 创建/编辑弹框                  | 5              |
| 工作区只读 + 注入              | 4              |
| 去掉启用/常用/添加             | 4              |
| Skills 去 AI 对话              | 7              |
| 移出级联删会话                 | 2, 6           |
| 相对时间                       | 1, 6           |

## Placeholder 扫描

无 TBD；Commit 步骤标注为「用户要求时」以符合仓库提交约定。
