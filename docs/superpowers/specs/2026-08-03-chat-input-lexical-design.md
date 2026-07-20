# AI 对话输入框改为 Lexical（统一 div + 原子 Mention）— 设计规格

> 日期：2026-08-03  
> 状态：已确认  
> 范围：`@momo/aichat` 聊天输入区；解决笔记引用与正文/光标错位，并统一有无引用时的输入实现

---

## 1. 背景与问题

### 1.1 现状

`ChatMentionTextarea` 采用「透明 `textarea` + 镜像 `div` 渲染 chip」叠层：

- 有 `@` 笔记引用时，textarea 文字透明，镜像层展示 `NoteReferenceChip`
- 无引用时退回纯 textarea，避免中文多行换行错位
- `ChatInputPanel` 在无 `noteReferences` 时另有一套普通 `textarea`

### 1.2 待解决问题

| 问题 | 说明 |
|------|------|
| 引用与正文错位 | textarea 与 div 排版引擎不同（尤其中文换行、滚动），chip 与光标/文字易错位 |
| 双实现 | 有无笔记引用走两套输入 DOM，高度自适应与键盘逻辑重复 |
| 用户诉求 | 输入区改为 div；引用为原子节点；现有功能与交互不缺失 |

### 1.3 已确认产品/技术决策

| 项 | 决策 |
|---|---|
| 实现路径 | **方案 2：引入 Lexical**（非自研 contenteditable、非继续修镜像层） |
| 输入范围 | **统一**：有无 `noteReferences` 均使用同一编辑器组件 |
| Mention 形态 | **原子 chip**（不可拆分编辑；整块删除/替换；点击打开替换菜单） |
| 对外 value | 仍为受控 **`string`**，token 格式不变：`@[note:path]` |
| 富文本 | **不做**加粗/链接等；仅纯文本 + Mention |

---

## 2. 架构与边界

### 2.1 组件

1. **`ChatMentionTextarea`**（可保留目录名；或实现期评估改名为 `ChatRichInput`，以导出兼容为准）
   - 唯一输入实现：内部 `LexicalComposer` + plain text ContentEditable + 自定义 Mention 节点
   - 删除 textarea + 镜像层及相关样式分支
2. **`ChatInputPanel`**
   - 删除普通 `textarea` 分支，始终挂载上述组件
   - 高度自适应、focus、键盘事件对接编辑器 ref
3. **`note-mention` 工具**
   - 保留现有 token 编解码与 `@` 查询逻辑
   - 新增 EditorState ↔ value 字符串的 serialize / deserialize
4. **Hooks**
   - `useNoteReferenceTrigger` / `useSlashCommandTrigger` 业务逻辑基本不变
   - `KeyboardEvent` 泛型从 `HTMLTextAreaElement` 改为通用或 `HTMLElement` / `HTMLDivElement`

### 2.2 数据流

```
用户输入 / 插入 mention
  → Lexical EditorState
  → serialize → value 字符串（含 @[note:...]）
  → onChange(value)

外部 value 变化（选笔记、斜杠命令、清空）
  → 若与当前 serialize 结果不同 → deserialize → setEditorState
  → 尽量恢复选区（避免光标跳动）
```

### 2.3 依赖

在 `@momo/aichat` 增加：

- `lexical`
- `@lexical/react`
- `@lexical/plain-text`（及实现所需的 `@lexical/utils` 等最小集合）

不引入完整 rich-text 工具栏或无关插件。仓库内目前无 Lexical/Slate 依赖。

---

## 3. 节点模型与交互

### 3.1 节点模型

- 根：单个 Paragraph；多行用换行 / LineBreak，不做多段落富文本文档模型
- 普通文本：`TextNode`
- 笔记引用：自定义 `NoteMentionNode`
  - 属性：`path`（笔记相对路径）
  - UI：现有 `NoteReferenceChip`（真实 chip，非镜像占位文本）
  - 语义：inline、原子；不可部分选中编辑；Backspace/Delete 整块删除
  - 点击：`onMentionClick(cursorPos)` → 现有替换菜单

### 3.2 序列化

| 方向 | 规则 |
|------|------|
| Mention → string | `@[note:${path}]` |
| string → Mention | 解析 `NOTE_MENTION_TOKEN_REGEX`，生成 `NoteMentionNode` |
| 粘贴 | 默认纯文本；若文本中含合法 token，解析为 Mention 节点 |
| 换行 | 与现有 value 字符串 `\n` 语义一致 |

表面占位字符方案（`SURFACE_MENTION_START/END` + 镜像）在编辑器路径上废弃；若工具函数仍被展示层使用可保留，但输入路径不再依赖。

### 3.3 须保留的交互

| 能力 | 行为 |
|------|------|
| 发送 | Enter（无 Shift）交给现有 `onKeyDown` / 发送逻辑 |
| 换行 | Shift+Enter |
| @ 引用 | `selectionStart`（value 坐标）驱动 `useNoteReferenceTrigger` |
| 斜杠命令 | 仍基于 value 字符串前缀 `/` |
| 替换引用 | 点击 chip → 笔记树 → 替换 token |
| 高度 | 内容变化后按 `scrollHeight` 自适应，上限 192px |
| focus / 选区 | ref：`focus`、`getSelectionStart`、`setSelectionStart` |
| 可编辑根节点 | `getEditableElement()`；`getTextareaElement` 可短期作别名或实现期直接替换调用方 |

### 3.4 显式不做

- 加粗、链接等富文本
- 多段落复杂文档模型
- 变更后端 / 消息存储的 token 格式
- 改笔记快照与发送展开逻辑（见既有 `2026-07-01-chat-note-at-reference-design.md`）

---

## 4. 同步策略与边界

### 4.1 受控同步

- 编辑器变更 → serialize → `onChange(value)`，并上报 `onSelectionChange`
- 外部 `value` 更新：与当前 serialize 相同则跳过写入；不同则写入并尽量恢复选区
- IME 组合输入期间不强制外部回写，避免吞字

### 4.2 边界

- `disabled`：不可编辑，样式与现输入一致
- 空内容：placeholder
- 无 `noteReferences`：不启用 @ 触发，同一编辑器仍作纯文本输入
- 导出类型：`IChatMentionTextareaRef` 保持可用；更新元素获取 API 名称并改 `ChatInputPanel`

### 4.3 错误与降级

- Lexical 更新失败时不抛到整页；保持上次合法 value
- 非法 / 半截 token 按普通文本处理，不崩溃

---

## 5. 测试与成功标准

### 5.1 测试要点

1. serialize / deserialize：`文本 + mention + 换行` 往返一致
2. Backspace 删除整个 mention
3. 外部写入 mention 后出现 chip，且 value 含 `@[note:...]`
4. 无 mention 时纯文本输入回归（含中文 IME 基本路径，能测则测）
5. 现有 `note-mention` 单测继续通过；废弃的 surface 映射若输入路径不再使用，可收敛测试范围

### 5.2 成功标准

- 多行中文 + 多个引用时，chip 与文字/光标无错位
- @、斜杠、Enter 发送、Shift+Enter 换行、附件区、高度动画均可用
- 发送内容仍为原 `@[note:path]` token 字符串格式
- `ChatInputPanel` 仅保留一套输入实现

---

## 6. 主要改动文件（预期）

| 路径 | 变更 |
|------|------|
| `packages/momo-aichat/package.json` | 增加 Lexical 依赖 |
| `packages/momo-aichat/src/components/ChatMentionTextarea/*` | Lexical 实现，删除镜像叠层 |
| `packages/momo-aichat/src/components/ChatInputPanel/index.tsx` | 统一输入；高度/ref 对接 |
| `packages/momo-aichat/src/utils/note-mention.ts`（及测试） | 增补 serialize 辅助；收敛 surface 若可废弃 |
| `packages/momo-aichat/src/hooks/useNoteReferenceTrigger.ts` | 事件类型调整 |
| `packages/momo-aichat/src/hooks/useSlashCommandTrigger.ts` | 事件类型调整 |
| 新增 Mention 节点 / 插件文件 | `NoteMentionNode`、受控同步 Plugin 等 |

---

## 7. 实现顺序建议

1. 加依赖与最小 Lexical 纯文本输入，替换 `ChatInputPanel` 双分支
2. 实现 `NoteMentionNode` + serialize/deserialize + 受控同步
3. 接通 @ / 点击替换 / Backspace 整块删除 / 选区 API
4. 高度自适应与样式对齐
5. 单测与手动回归（中文多行 + 多引用）
