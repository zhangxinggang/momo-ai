# AI 对话输入框改为 Lexical Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `@momo/aichat` 聊天输入从「textarea + 镜像 div」统一改为 Lexical contenteditable，笔记引用以原子 Mention 节点渲染，消除错位并保留现有交互。

**Architecture:** `ChatMentionTextarea` 内部使用 `LexicalComposer` + PlainText + 自定义 `NoteMentionNode`；受控 `value: string` 通过 serialize/deserialize 与 EditorState 双向同步；`ChatInputPanel` 删除普通 textarea 分支，始终挂载该组件。

**Tech Stack:** TypeScript、React 19、Lexical `0.49.x`（`lexical`、`@lexical/react`、`@lexical/plain-text`、`@lexical/utils`）、vitest、Less CSS Module

**Spec:** `docs/superpowers/specs/2026-08-03-chat-input-lexical-design.md`

## Global Constraints

- 对外 value 仍为受控 `string`，token 格式不变：`@[note:path]`
- 不做加粗/链接等富文本；仅纯文本 + Mention
- 有无 `noteReferences` 均使用同一编辑器组件
- Mention 为原子 chip：整块删除/替换，点击打开替换菜单
- 命名遵循仓库规范：Props 固定 `IProps`；API/DTO 用 `D*`，枚举 `E*`，业务接口 `I*`
- 代码注释使用中文；不主动写无关 md

---

## 文件变更一览

| 操作 | 文件 | 职责 |
|------|------|------|
| Modify | `packages/momo-aichat/package.json` | 增加 Lexical 依赖 |
| Create | `packages/momo-aichat/src/components/ChatMentionTextarea/utils/editor-value.ts` | value ↔ 节点段 / 选区索引纯函数 |
| Create | `packages/momo-aichat/src/components/ChatMentionTextarea/utils/editor-value.test.ts` | 序列化与选区单测 |
| Create | `packages/momo-aichat/src/components/ChatMentionTextarea/nodes/NoteMentionNode.tsx` | 原子 Mention DecoratorNode |
| Create | `packages/momo-aichat/src/components/ChatMentionTextarea/plugins/ControlledValuePlugin.tsx` | 受控同步 + 选区上报 |
| Create | `packages/momo-aichat/src/components/ChatMentionTextarea/plugins/EnterKeyPlugin.tsx` | Enter/Shift+Enter 与外部 onKeyDown |
| Modify | `packages/momo-aichat/src/components/ChatMentionTextarea/index.tsx` | Lexical 壳层；删 textarea/镜像 |
| Modify | `packages/momo-aichat/src/components/ChatMentionTextarea/index.module.less` | contenteditable 样式；删镜像叠层 |
| Modify | `packages/momo-aichat/src/components/ChatInputPanel/index.tsx` | 统一输入；高度用 `getEditableElement` |
| Modify | `packages/momo-aichat/src/hooks/useNoteReferenceTrigger.ts` | `KeyboardEvent` 泛型放宽 |
| Modify | `packages/momo-aichat/src/hooks/useSlashCommandTrigger.ts` | 同上 |
| Modify | `packages/momo-aichat/src/components/NoteReferenceChip/index.tsx` | 输入态默认用真实 chip（非 mirror） |
| Modify | `packages/momo-aichat/src/index.ts` | 若 ref API 变更则同步导出类型 |

---

### Task 1: 安装 Lexical 依赖

**Files:**
- Modify: `packages/momo-aichat/package.json`

**Interfaces:**
- Consumes: 无
- Produces: 可 `import` 的 `lexical` / `@lexical/react` / `@lexical/plain-text` / `@lexical/utils`（版本对齐 `0.49.0`）

- [ ] **Step 1: 在包目录安装依赖**

在仓库根执行（pnpm workspace）：

```bash
pnpm add lexical@0.49.0 @lexical/react@0.49.0 @lexical/plain-text@0.49.0 @lexical/utils@0.49.0 --filter @momo/aichat
```

Expected: `packages/momo-aichat/package.json` 的 `dependencies` 出现上述四个包，版本均为 `0.49.0`。

- [ ] **Step 2: 确认可解析**

```bash
pnpm --filter @momo/aichat exec node -e "require('lexical'); console.log('ok')"
```

若 ESM 报错，改用：

```bash
pnpm --filter @momo/aichat exec node --input-type=module -e "import('lexical').then(() => console.log('ok'))"
```

Expected: 打印 `ok`

- [ ] **Step 3: Commit**

```bash
git add packages/momo-aichat/package.json pnpm-lock.yaml
git commit -m "chore(aichat): add Lexical 0.49 deps for chat input"
```

---

### Task 2: value ↔ 编辑器段纯函数（TDD）

**Files:**
- Create: `packages/momo-aichat/src/components/ChatMentionTextarea/utils/editor-value.ts`
- Create: `packages/momo-aichat/src/components/ChatMentionTextarea/utils/editor-value.test.ts`

**Interfaces:**
- Consumes: `parseNoteReferenceContent`、`buildNoteMentionToken`（`packages/momo-aichat/src/utils/note-mention.ts`）
- Produces:
  - `type IEditorSegment = { type: 'text'; text: string } | { type: 'mention'; path: string } | { type: 'linebreak' }`
  - `function valueToEditorSegments(value: string): IEditorSegment[]`
  - `function editorSegmentsToValue(segments: IEditorSegment[]): string`
  - `function getSegmentCursorIndex(segments: IEditorSegment[], segmentIndex: number, offsetInSegment: number): number`
  - `function findSegmentAtValueIndex(segments: IEditorSegment[], valueIndex: number): { segmentIndex: number; offset: number }`

- [ ] **Step 1: 写失败单测**

```typescript
import { describe, expect, it } from 'vitest';

import { buildNoteMentionToken } from '../../../utils/note-mention';
import {
  editorSegmentsToValue,
  findSegmentAtValueIndex,
  getSegmentCursorIndex,
  valueToEditorSegments,
} from './editor-value';

describe('valueToEditorSegments / editorSegmentsToValue', () => {
  it('纯文本往返', () => {
    const value = 'hello\nworld';
    expect(editorSegmentsToValue(valueToEditorSegments(value))).toBe(value);
  });

  it('文本 + mention + 换行往返', () => {
    const token = buildNoteMentionToken('a/b.md');
    const value = `看 ${token}\n继续`;
    const segments = valueToEditorSegments(value);
    expect(segments).toEqual([
      { type: 'text', text: '看 ' },
      { type: 'mention', path: 'a/b.md' },
      { type: 'linebreak' },
      { type: 'text', text: '继续' },
    ]);
    expect(editorSegmentsToValue(segments)).toBe(value);
  });

  it('半截非法 token 当普通文本', () => {
    const value = 'x @[note:incomplete';
    expect(editorSegmentsToValue(valueToEditorSegments(value))).toBe(value);
    expect(valueToEditorSegments(value).every((s) => s.type !== 'mention')).toBe(true);
  });
});

describe('选区索引映射', () => {
  it('光标在 mention 后映射到 token 结束', () => {
    const token = buildNoteMentionToken('n.md');
    const value = `前${token}后`;
    const segments = valueToEditorSegments(value);
    // mention 段 index=1，offset 视为整块（用 1 表示块后）
    const idx = getSegmentCursorIndex(segments, 1, 1);
    expect(idx).toBe('前'.length + token.length);
    const located = findSegmentAtValueIndex(segments, idx);
    expect(located.segmentIndex).toBe(2);
    expect(located.offset).toBe(0);
  });
});
```

- [ ] **Step 2: 跑测确认失败**

```bash
pnpm --filter @momo/aichat test -- src/components/ChatMentionTextarea/utils/editor-value.test.ts
```

Expected: FAIL（模块不存在或导出缺失）

- [ ] **Step 3: 实现 `editor-value.ts`**

```typescript
import {
  buildNoteMentionToken,
  parseNoteReferenceContent,
} from '../../../utils/note-mention';

export type IEditorSegment =
  | { type: 'text'; text: string }
  | { type: 'mention'; path: string }
  | { type: 'linebreak' };

function pushTextWithLinebreaks(segments: IEditorSegment[], text: string): void {
  const parts = text.split('\n');
  parts.forEach((part, index) => {
    if (part.length > 0) {
      segments.push({ type: 'text', text: part });
    }
    if (index < parts.length - 1) {
      segments.push({ type: 'linebreak' });
    }
  });
}

export function valueToEditorSegments(value: string): IEditorSegment[] {
  const segments: IEditorSegment[] = [];
  for (const piece of parseNoteReferenceContent(value)) {
    if (piece.type === 'mention') {
      segments.push({ type: 'mention', path: piece.path });
      continue;
    }
    pushTextWithLinebreaks(segments, piece.value);
  }
  return segments;
}

export function editorSegmentsToValue(segments: IEditorSegment[]): string {
  let result = '';
  for (const segment of segments) {
    if (segment.type === 'text') {
      result += segment.text;
    } else if (segment.type === 'mention') {
      result += buildNoteMentionToken(segment.path);
    } else {
      result += '\n';
    }
  }
  return result;
}

function segmentLength(segment: IEditorSegment): number {
  if (segment.type === 'text') {
    return segment.text.length;
  }
  if (segment.type === 'mention') {
    return buildNoteMentionToken(segment.path).length;
  }
  return 1;
}

/** offset：text 为字符偏移；mention 仅 0（块前）或 1（块后）；linebreak 仅 0/1 */
export function getSegmentCursorIndex(
  segments: IEditorSegment[],
  segmentIndex: number,
  offsetInSegment: number,
): number {
  let index = 0;
  for (let i = 0; i < segmentIndex; i += 1) {
    index += segmentLength(segments[i]);
  }
  const current = segments[segmentIndex];
  if (!current) {
    return index;
  }
  if (current.type === 'text') {
    return index + Math.min(Math.max(offsetInSegment, 0), current.text.length);
  }
  if (current.type === 'mention' || current.type === 'linebreak') {
    return index + (offsetInSegment > 0 ? segmentLength(current) : 0);
  }
  return index;
}

export function findSegmentAtValueIndex(
  segments: IEditorSegment[],
  valueIndex: number,
): { segmentIndex: number; offset: number } {
  let cursor = 0;
  for (let i = 0; i < segments.length; i += 1) {
    const len = segmentLength(segments[i]);
    if (valueIndex <= cursor + len) {
      const offset = valueIndex - cursor;
      if (segments[i].type === 'text') {
        return { segmentIndex: i, offset };
      }
      return { segmentIndex: i, offset: offset > 0 ? 1 : 0 };
    }
    cursor += len;
  }
  const last = segments.length - 1;
  if (last < 0) {
    return { segmentIndex: 0, offset: 0 };
  }
  return {
    segmentIndex: last,
    offset: segments[last].type === 'text' ? segments[last].text.length : 1,
  };
}
```

- [ ] **Step 4: 跑测确认通过**

```bash
pnpm --filter @momo/aichat test -- src/components/ChatMentionTextarea/utils/editor-value.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/momo-aichat/src/components/ChatMentionTextarea/utils/editor-value.ts packages/momo-aichat/src/components/ChatMentionTextarea/utils/editor-value.test.ts
git commit -m "feat(aichat): add editor value segment serialize helpers"
```

---

### Task 3: `NoteMentionNode` 原子节点

**Files:**
- Create: `packages/momo-aichat/src/components/ChatMentionTextarea/nodes/NoteMentionNode.tsx`

**Interfaces:**
- Consumes: `NoteReferenceChip`、`getNoteMentionDisplayPath`
- Produces:
  - `class NoteMentionNode extends DecoratorNode<JSX.Element>`
  - `function $createNoteMentionNode(path: string): NoteMentionNode`
  - `function $isNoteMentionNode(node: LexicalNode | null | undefined): node is NoteMentionNode`
  - JSON：`{ type: 'note-mention'; path: string, version: 1 }`

- [ ] **Step 1: 实现节点（经典 static 方法；自定义 Decorator 可不强制 `$config`）**

```tsx
import type { JSX } from 'react';
import {
  $applyNodeReplacement,
  DecoratorNode,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';

import { NoteReferenceChip } from '../../NoteReferenceChip';

export type SerializedNoteMentionNode = Spread<
  { type: 'note-mention'; path: string; version: 1 },
  SerializedLexicalNode
>;

export class NoteMentionNode extends DecoratorNode<JSX.Element> {
  __path: string;

  static getType(): string {
    return 'note-mention';
  }

  static clone(node: NoteMentionNode): NoteMentionNode {
    return new NoteMentionNode(node.__path, node.__key);
  }

  constructor(path: string, key?: NodeKey) {
    super(key);
    this.__path = path;
  }

  getPath(): string {
    return this.__path;
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'note-mention-node';
    span.contentEditable = 'false';
    return span;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return true;
  }

  isKeyboardSelectable(): boolean {
    return true;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.setAttribute('data-note-mention', this.__path);
    element.textContent = `@[note:${this.__path}]`;
    return { element };
  }

  static importJSON(serialized: SerializedNoteMentionNode): NoteMentionNode {
    return $createNoteMentionNode(serialized.path);
  }

  exportJSON(): SerializedNoteMentionNode {
    return {
      type: 'note-mention',
      path: this.__path,
      version: 1,
    };
  }

  decorate(): JSX.Element {
    return <NoteReferenceChip path={this.__path} />;
  }
}

export function $createNoteMentionNode(path: string): NoteMentionNode {
  return $applyNodeReplacement(new NoteMentionNode(path));
}

export function $isNoteMentionNode(
  node: LexicalNode | null | undefined,
): node is NoteMentionNode {
  return node instanceof NoteMentionNode;
}
```

说明：不要传 `measureText`（那是镜像占位方案）；使用真实 `chip` 样式。

- [ ] **Step 2: Commit**

```bash
git add packages/momo-aichat/src/components/ChatMentionTextarea/nodes/NoteMentionNode.tsx
git commit -m "feat(aichat): add NoteMentionNode for Lexical chat input"
```

---

### Task 4: 受控同步 Plugin + Enter 键 Plugin

**Files:**
- Create: `packages/momo-aichat/src/components/ChatMentionTextarea/plugins/ControlledValuePlugin.tsx`
- Create: `packages/momo-aichat/src/components/ChatMentionTextarea/plugins/EnterKeyPlugin.tsx`

**Interfaces:**
- Consumes: `valueToEditorSegments`、`editorSegmentsToValue`、`$createNoteMentionNode`、`$isNoteMentionNode`
- Produces:
  - `ControlledValuePlugin(props: { value: string; onChange: (v: string) => void; onSelectionChange?: (i: number) => void })`
  - `EnterKeyPlugin(props: { onKeyDown?: (e: KeyboardEvent) => void })`
  - 内部导出供 ref 使用的选区读写可放同文件或 `selection.ts`：
    - `$getSelectionValueIndex(): number`
    - `$setSelectionByValueIndex(value: string, valueIndex: number): void`

- [ ] **Step 1: 实现选区与 DOM 树读写辅助（写在 `ControlledValuePlugin.tsx` 同目录 `selection.ts` 亦可）**

核心逻辑要求：

1. `$readEditorSegments()`：DFS Root → Paragraph 子节点：`TextNode`→text 段，`LineBreakNode`→linebreak，`NoteMentionNode`→mention
2. `$writeEditorFromValue(value)`：清空 paragraph，按 `valueToEditorSegments` 插入节点
3. `$getSelectionValueIndex()`：根据 anchor 节点落到段索引，再 `getSegmentCursorIndex`
4. 外部 value 变化：若 `editorSegmentsToValue($readEditorSegments()) === value` 则跳过；`editor.isComposing()` 为 true 时跳过外部写入
5. `registerUpdateListener`：非 composing 时 `onChange(serialized)` + `onSelectionChange`

Enter 插件：

```typescript
// 伪代码要点
editor.registerCommand(KEY_ENTER_COMMAND, (event) => {
  if (!event) return false;
  if (event.shiftKey) {
    // 允许默认换行（或显式 insert LineBreak）
    return false;
  }
  // 构造兼容的 KeyboardEvent 交给外部 onKeyDown（发送）
  onKeyDown?.(event as unknown as React.KeyboardEvent);
  event.preventDefault();
  return true;
}, COMMAND_PRIORITY_HIGH);
```

实现时用 React 的 `KeyboardEvent` 类型对齐 `ChatInputPanel.handleKeyDown`；若类型摩擦，将 hooks 的泛型改为 `KeyboardEvent<HTMLElement>`（Task 5）。

粘贴：注册 `PASTE_COMMAND`（或 `editor.registerNodeTransform` 不够），在 handler 中：

```typescript
event.preventDefault();
const text = event.clipboardData?.getData('text/plain') ?? '';
// 插入：按 valueToEditorSegments(text) 生成节点并 insertNodes
```

- [ ] **Step 2: Commit**

```bash
git add packages/momo-aichat/src/components/ChatMentionTextarea/plugins/
git commit -m "feat(aichat): add Lexical controlled value and enter plugins"
```

---

### Task 5: 重写 `ChatMentionTextarea` + 样式；统一 `ChatInputPanel`

**Files:**
- Modify: `packages/momo-aichat/src/components/ChatMentionTextarea/index.tsx`
- Modify: `packages/momo-aichat/src/components/ChatMentionTextarea/index.module.less`
- Modify: `packages/momo-aichat/src/components/ChatInputPanel/index.tsx`
- Modify: `packages/momo-aichat/src/hooks/useNoteReferenceTrigger.ts`
- Modify: `packages/momo-aichat/src/hooks/useSlashCommandTrigger.ts`

**Interfaces:**
- Consumes: Task 3–4 组件与插件
- Produces:
  - `IChatMentionTextareaRef`: `{ focus; getSelectionStart; setSelectionStart; getEditableElement: () => HTMLElement | null }`
  - 删除 `getTextareaElement`（本任务内改完所有调用方）
  - `IProps.onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void`

- [ ] **Step 1: 放宽 hooks 键盘类型**

两处 `KeyboardEvent<HTMLTextAreaElement>` 改为 `KeyboardEvent<HTMLElement>`。

- [ ] **Step 2: 重写 `ChatMentionTextarea`**

要点：

```tsx
const initialConfig = {
  namespace: 'ChatMentionTextarea',
  nodes: [NoteMentionNode],
  onError: (error: Error) => {
    console.error(error);
  },
  editable: !disabled,
};

// LexicalComposer + PlainTextPlugin + ContentEditable
// + ControlledValuePlugin + EnterKeyPlugin + HistoryPlugin（可选，建议加 @lexical/history 若需 undo；YAGNI 则可不加）
// ref：useLexicalComposerContext 无法在 Composer 外，用内部 ImperativePlugin 暴露 focus/选区/getEditableElement
```

`getEditableElement`：返回 ContentEditable 根 DOM（`contentEditable` 的 div）。

点击 mention：在 `NoteMentionNode.decorate` 外包一层 `onClick`，或在 chip 容器上 `onClick` 后根据当前 value + 节点 path 算 `cursorPos`（token 中点）调用 `onMentionClick`。

Backspace 整块删除：DecoratorNode 默认可被 Lexical 整节点删除；若不符合预期，额外注册 `KEY_BACKSPACE_COMMAND`：当光标紧贴 mention 后时 `$remove` 该节点。

- [ ] **Step 3: 替换样式**

删除 `.mention-input-mirror*`、`.mention-input-textarea-overlay/plain`。

保留类似：

```less
.mention-input {
  position: relative;
  width: 100%;
}

.mention-input-editable {
  min-height: 24px;
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
  outline: none;
  font-size: 16px;
  line-height: 24px;
  font-family: inherit;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  box-sizing: border-box;
  overflow-y: auto;
  background: transparent;
  color: inherit;
}

.mention-input-placeholder {
  // Lexical placeholder 定位，颜色对齐 gray-400 / dark gray-500
}
```

- [ ] **Step 4: `ChatInputPanel` 始终使用 `ChatMentionTextarea`**

- 删除 `textareaRef` 与无 `noteReferences` 的 `<textarea>` 分支
- `getActiveTextarea` → `getActiveEditable`：`mentionTextareaRef.current?.getEditableElement()`
- 高度逻辑对 `HTMLElement` 设置 `style.height`（与现逻辑相同，上限 192）
- `onKeyDown` 类型改为 `KeyboardEvent<HTMLElement>`
- `noteReferences` 仅影响 placeholder 与是否启用 `@` hook（hook 本身已看 config）

- [ ] **Step 5: 跑既有单测**

```bash
pnpm --filter @momo/aichat test
```

Expected: 全部 PASS（含 `note-mention.test.ts` 与 `editor-value.test.ts`）

- [ ] **Step 6: Commit**

```bash
git add packages/momo-aichat/src/components/ChatMentionTextarea packages/momo-aichat/src/components/ChatInputPanel/index.tsx packages/momo-aichat/src/hooks/useNoteReferenceTrigger.ts packages/momo-aichat/src/hooks/useSlashCommandTrigger.ts
git commit -m "feat(aichat): replace chat input with Lexical editor"
```

---

### Task 6: 清理与手动回归

**Files:**
- Modify: `packages/momo-aichat/src/components/NoteReferenceChip/*`（若 `measureText` 镜像路径仅服务旧输入，可保留 API 但输入不再使用）
- Modify: `packages/momo-aichat/src/utils/note-mention.ts`（**不要删除**仍被导出的 `valueToSurface`，除非确认无外部引用；输入路径停止调用即可）
- Modify: `packages/momo-aichat/src/index.ts`（确认 `IChatMentionTextareaRef` 导出与实现一致）

**Interfaces:**
- Consumes: Task 5 完成态
- Produces: 符合 spec 成功标准的可交付输入区

- [ ] **Step 1: Grep 确认无残留调用**

```bash
rg "getTextareaElement|mention-input-mirror|measureText" packages/momo-aichat/src
```

Expected: 输入路径无 `getTextareaElement` / mirror；`measureText` 仅可能留在 Chip 定义（可保留）

- [ ] **Step 2: 手动回归清单（宿主 skill-platform 对话）**

1. 无引用：中文 IME 输入、多行、Enter 发送、Shift+Enter 换行
2. `@` 打开笔记树、选中后出现 chip，value 含 `@[note:...]`
3. 多行中文 + 多个 chip：目视无错位
4. Backspace 整块删除 chip
5. 点击 chip 打开替换菜单并替换成功
6. `/` 斜杠命令仍可用
7. 高度随内容增长至 192px 后滚动
8. disabled / generating 时不可乱入；发送后清空输入

- [ ] **Step 3: Commit（若有清理改动）**

```bash
git add packages/momo-aichat
git commit -m "chore(aichat): clean mirror textarea leftovers after Lexical migration"
```

---

## Spec 覆盖自检

| Spec 要求 | 对应 Task |
|-----------|-----------|
| Lexical + 统一输入 | Task 1、5 |
| 原子 Mention chip | Task 3、5 |
| value 字符串 `@[note:path]` | Task 2、4 |
| 受控同步 / IME 不吞字 | Task 4 |
| Enter / Shift+Enter / @ / 斜杠 / 高度 / focus 选区 | Task 4、5 |
| 粘贴纯文本 + token 解析 | Task 4 |
| 单测 serialize 往返 | Task 2 |
| 不做富文本 / 不改 token 格式 | Global Constraints |

## 类型一致性自检

- Ref API 统一为 `getEditableElement`（无 `getTextareaElement`）
- Hooks / Panel / MentionTextarea 的 `KeyboardEvent<HTMLElement>` 一致
- `IEditorSegment` 三段式与 `NoteMentionNode.__path`、`buildNoteMentionToken` 一致
