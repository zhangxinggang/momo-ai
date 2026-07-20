# AI 对话侧栏项目树与工作区改造设计

日期：2026-08-29  
状态：已确认  
方案：项目实体 + 会话挂 `projectId`（方案 1）

## 背景

当前 AI 对话历史为扁平列表；工作区通过输入栏面板的「启用 / 设置为常用 / 添加目录」配置；「我的 Skills」另有「AI 对话」入口写入同一历史。

目标：

1. 左侧历史改为二级树：项目 → 对话；项目可配置名称与多文件夹；工作区上下文绑定项目。
2. 去掉对话工作区面板中的启用、设为常用、添加目录。
3. 去掉「我的 Skills」中的 AI 对话按钮及相关逻辑。

## 已确认决策

| 项                   | 决策                                             |
| -------------------- | ------------------------------------------------ |
| 移出项目             | 级联删除其下全部对话                             |
| 发消息工作区上下文   | 使用当前会话所属项目的 `folderPaths`；空则不注入 |
| 旧扁平会话           | 归入默认项目「自由对话」                         |
| 「自由对话」         | 与普通项目同等：可编辑、可移出                   |
| 无文件夹且同名       | 禁止保存（名称在空文件夹集合下须唯一）           |
| 旧 workspace presets | 本版不自动转成项目                               |

## 数据模型

### IChatProject（新）

```ts
interface IChatProject {
  id: string;
  name: string;
  folderPaths: string[];
  createdAt: number;
  updatedAt: number;
}
```

- 展示名允许重复；业务唯一键为「规范化名称 + 排序去重后的 folderPaths」。
- 比较前：`name.trim()`；路径 trim、去重、排序后再拼接。
- `folderPaths` 可为空。

### IChatSession 扩展

- 新增必填（迁移后）字段：`projectId: string`。
- 新建对话必须挂在某一项目下。

### 最近目录

- 独立持久化键（如 `chat-project-recent-folders`）。
- UI 最多展示 8 条；存储可多于 8；删除一条后从后续补满至 8。
- 选目录成功后写入队首并去重。

### 持久化

- 项目列表：独立 store（建议 `chat-project-storage`）。
- 会话：沿用现有 `skill-platform-ai-chat` 前缀，条目带 `projectId`。
- 旧 `chat-workspace-storage` 的 enabled / presets / paths 不再驱动主 AI 对话上下文。

## 侧栏交互

### 顶栏

- 左：「工作区」。
- 移入：右显示添加 icon → 打开「创建项目」弹框（与编辑共用 UI）。

### 一级：项目

- 展示 `name`；若无名称则回退为首个路径的 basename（创建/编辑时名称建议必填，避免歧义）。
- 移入：右侧 `...` + 添加 icon。
  - `...`：编辑项目 / 移出项目。
  - 添加：在该项目下新建对话并选中（不打开项目弹框）。
- 移出：确认后删项目 + 其下全部会话。
- 点击一级：仅展开/收起，不切换会话。
- 内部主键为 `id`；唯一约束按名称+文件夹集合。

### 二级：对话

- 标题；右侧常驻相对时间：`Nh` / `Nd` / `Nmo` / `Nye`（例：2h30m → `2h`，取最大整单位）。
- 移入：时间左侧 `...` → 重命名 / 删除。
- 点击：切换当前会话。

### 创建 / 编辑项目弹框（共用）

1. 项目名称（必填）。
2. 文件夹列表：可多选、可不选；可增删。
3. 最近选择的目录：最多 8 条，可删；删后补全。
4. 保存时唯一性校验；冲突则提示不关闭。

### 其它侧栏

- 原扁平「对话历史」+ 顶栏「新建对话」改为上述结构。
- 搜索：本版保留为跨项目按标题过滤（可选实现细节，不阻塞主流程）。

## 工作区注入与面板

- 当前会话 → 查项目 → `folderPaths` 非空则注入上下文，否则不注入。
- 编辑项目文件夹后，同项目下会话立即使用新 paths。
- `ChatWorkspaceToolbar`（主 AI 对话）：去掉启用开关、设置为常用、添加目录；只读展示当前项目路径（可保留打开目录）。
- 项目文件夹增删改仅通过创建/编辑项目弹框。

## Skills 清理

- 移除 `SkillListView` / `SkillGalleryCard` 的「AI 对话」按钮与 `onOpenSkillAiChat`。
- 移除 `SkillLibraryView` 中对 `SkillAiChatModal` 的状态与挂载。
- 删除或停止导出仅服务该入口的 `SkillAiChat` / `SkillAiChatModal` 及相关 bootstrap（不影响输入栏技能选择等其它能力）。
- 历史上由 Skills 弹窗写入的会话：按迁移规则进入「自由对话」，不再从 Skills 打开。

## 迁移

1. 无项目列表时创建「自由对话」（`folderPaths: []`）。
2. 无 `projectId` 的会话挂到「自由对话」。
3. 不自动把旧 workspace presets 转成项目。
4. recent folders 独立初始化；若有可用历史路径可作种子（非必须）。

## 范围

**纳入**

- `apps/skill-platform`：ChatPanel 树、项目 store、workspace binding、Skills AI 对话入口清理。
- `packages/momo-aichat`：session 类型、`ChatWorkspaceToolbar` / `IChatWorkspaceConfig` 收敛、相对时间工具（若放包内）。

**不纳入（本版）**

- 工作流节点独立对话强制项目树。
- 旧 presets 自动迁移为项目。
- 云同步字段协议大改（若同步存在，需带上 `projectId` 与项目列表；实现时按现有 sync API 最小兼容）。

## 组件与模块边界（建议）

| 单元 | 职责 |
| --- | --- |
| `chat/project` store | 项目 CRUD、唯一性、recent folders、移出级联所需的会话 id 列表回调由上层注入或在宿主完成 |
| `ChatProjectModal` | 创建/编辑项目弹框 |
| `ChatPanel` | 顶栏 + 树渲染与交互 |
| `formatRelativeCompact` | `1h` / `1d` / `1mo` / `1ye` |
| `useChatWorkspaceBinding` | 改为基于当前会话项目的只读 paths |
| Skills 列表/卡片 | 去掉 AI 对话入口 |

## 成功标准

1. 侧栏为二级树；可创建/编辑/移出项目；移出删除下属对话。
2. 项目下可新建对话；对话可重命名、删除；相对时间常驻。
3. 发消息工作区上下文等于当前项目 folders。
4. 工作区面板无启用/常用/添加目录。
5. 「我的 Skills」无 AI 对话按钮与弹窗。
6. 旧会话出现在「自由对话」下；空文件夹同名项目无法保存。

## 风险与注意

- `momo-aichat` 的 `IChatWorkspaceConfig` 可能仍被笔记等场景使用：收敛时保持可选字段或提供只读构建方式，避免破坏其它宿主。
- 级联删除需同时停掉进行中的生成并清理持久化。
- 名称可重复，树节点 key 必须用 `project.id` / `session.id`，禁止用 name。
