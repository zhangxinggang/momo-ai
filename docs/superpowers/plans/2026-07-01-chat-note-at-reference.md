# AI 对话 @ 笔记引用（会话快照）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完善 AI 对话 @ 笔记只读引用：会话级首次快照、多轮 API 展开、单篇 2 万字截断，覆盖全部 AI 对话场景。

**Architecture:** 在 `IChatSession.noteSnapshots` 存 path→正文快照；`sendMessage` 发送前补快照、构建 API 时用纯函数展开 token；UI 仍存/展示 `@[note:path]`。宿主 `INoteReferencesConfig.readContent` 提供读盘。

**Tech Stack:** TypeScript、React、`@momo/aichat`、vitest（新增至包内单测）

**Spec:** `docs/superpowers/specs/2026-07-01-chat-note-at-reference-design.md`

---

## 文件变更一览

| 操作 | 文件 | 职责 |
|------|------|------|
| Modify | `packages/momo-aichat/src/types/chat.ts` | `INoteSnapshot`、`noteSnapshots` |
| Modify | `packages/momo-aichat/src/types/note-reference.ts` | `readContent` |
| Modify | `packages/momo-aichat/src/utils/note-mention.ts` | 截断、展开、ensure 快照 |
| Create | `packages/momo-aichat/src/utils/note-snapshot.ts` | 快照读写辅助（可选，若 mention 文件过大则拆出） |
| Modify | `packages/momo-aichat/src/hooks/useChatSessions.ts` | 发送/API/CLI 展开 |
| Modify | `packages/momo-aichat/src/components/AiChatView/index.tsx` | 移除前置 resolve |
| Modify | `packages/momo-aichat/src/components/ChatInputPanel/index.tsx` | placeholder |
| Modify | `packages/momo-aichat/src/index.ts` | 导出新类型/函数 |
| Modify | `apps/skill-platform/src/renderer/services/aichat/note-reference-config.ts` | `readContent` |
| Modify | `packages/momo-aichat/package.json` | vitest 脚本 |
| Create | `packages/momo-aichat/src/utils/note-mention.test.ts` | 单测 |

---

### Task 1: 类型与常量

**Files:**
- Modify: `packages/momo-aichat/src/types/chat.ts`
- Modify: `packages/momo-aichat/src/types/note-reference.ts`
- Modify: `packages/momo-aichat/src/utils/note-mention.ts`（仅常量导出）

- [ ] **Step 1: 在 `chat.ts` 添加快照类型**

```typescript
/** 笔记引用快照（会话级） */
export interface INoteSnapshot {
  path: string;
  content: string;
  snapshotAt: number;
  isTruncated: boolean;
  originalLength: number;
}

export interface IChatSession {
  // ...existing
  noteSnapshots?: Record<string, INoteSnapshot>;
}
```

- [ ] **Step 2: 扩展 `INoteReferencesConfig`**

```typescript
export interface INoteReferencesConfig {
  listTree: () => Promise<INoteReferenceNode[]>;
  readContent: (path: string) => Promise<string>;
  resolveContent?: (content: string) => Promise<string>;
}
```

- [ ] **Step 3: 在 `note-mention.ts` 顶部添加常量**

```typescript
export const NOTE_SNAPSHOT_MAX_CHARS = 20_000;
export const NOTE_SNAPSHOT_TRUNCATED_SUFFIX =
  '（笔记过长，已截断至前 20000 字符，完整内容请打开笔记查看）';

export function normalizeNotePath(path: string): string {
  return path.replace(/\\/g, '/');
}
```

- [ ] **Step 4: 从 `index.ts` 导出 `INoteSnapshot` 与新常量**

---

### Task 2: 快照工具函数（TDD）

**Files:**
- Modify: `packages/momo-aichat/src/utils/note-mention.ts`
- Modify: `packages/momo-aichat/package.json`
- Create: `packages/momo-aichat/src/utils/note-mention.test.ts`

- [ ] **Step 1: 添加 vitest 到 `momo-aichat`**

`package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

devDependencies: `"vitest": "^3.2.4"`

Run: `pnpm add -D vitest --filter @momo/aichat`

- [ ] **Step 2: 写失败测试 — 截断**

```typescript
import { describe, expect, it } from 'vitest';
import { truncateNoteContent, NOTE_SNAPSHOT_MAX_CHARS } from './note-mention';

describe('truncateNoteContent', () => {
  it('短内容不截断', () => {
    const text = 'hello';
    const result = truncateNoteContent(text);
    expect(result.content).toBe('hello');
    expect(result.isTruncated).toBe(false);
    expect(result.originalLength).toBe(5);
  });

  it('超长内容截断并标记', () => {
    const text = 'a'.repeat(NOTE_SNAPSHOT_MAX_CHARS + 100);
    const result = truncateNoteContent(text);
    expect(result.content.length).toBeLessThan(text.length);
    expect(result.isTruncated).toBe(true);
    expect(result.originalLength).toBe(text.length);
    expect(result.content).toContain('已截断');
  });
});
```

- [ ] **Step 3: 运行测试确认 FAIL**

Run: `pnpm --filter @momo/aichat test`
Expected: FAIL — `truncateNoteContent` not defined

- [ ] **Step 4: 实现 `truncateNoteContent`**

```typescript
export function truncateNoteContent(raw: string): {
  content: string;
  isTruncated: boolean;
  originalLength: number;
} {
  const originalLength = raw.length;
  if (originalLength <= NOTE_SNAPSHOT_MAX_CHARS) {
    return { content: raw, isTruncated: false, originalLength };
  }
  const head = raw.slice(0, NOTE_SNAPSHOT_MAX_CHARS);
  return {
    content: `${head}\n${NOTE_SNAPSHOT_TRUNCATED_SUFFIX}`,
    isTruncated: true,
    originalLength,
  };
}
```

- [ ] **Step 5: 写失败测试 — 快照展开**

```typescript
import {
  buildNoteMentionToken,
  expandNoteMentionsWithSnapshots,
} from './note-mention';
import type { INoteSnapshot } from '../types/chat';

describe('expandNoteMentionsWithSnapshots', () => {
  it('用快照替换 token', () => {
    const token = buildNoteMentionToken('folder/a.md');
    const snapshots: Record<string, INoteSnapshot> = {
      'folder/a.md': {
        path: 'folder/a.md',
        content: '笔记正文',
        snapshotAt: 1,
        isTruncated: false,
        originalLength: 4,
      },
    };
    const result = expandNoteMentionsWithSnapshots(`请总结 ${token}`, snapshots);
    expect(result).toContain('笔记正文');
    expect(result).toContain('--- 笔记: folder/a.md START ---');
    expect(result).not.toContain('@[note:');
  });

  it('无快照时占位', () => {
    const token = buildNoteMentionToken('missing.md');
    const result = expandNoteMentionsWithSnapshots(token, {});
    expect(result).toContain('[笔记 missing.md 未找到快照]');
  });
});
```

- [ ] **Step 6: 实现 `expandNoteMentionsWithSnapshots`**

基于现有 `findNoteMentions` 逆序替换；有快照用 block 格式，无快照用 `[笔记 path 未找到快照]`。

- [ ] **Step 7: 写失败测试 — `ensureNoteSnapshots`**

```typescript
import { ensureNoteSnapshots } from './note-mention';

describe('ensureNoteSnapshots', () => {
  it('仅为新 path 调用 readContent', async () => {
    const reads: string[] = [];
    const readContent = async (path: string) => {
      reads.push(path);
      return `content-of-${path}`;
    };
    const existing = {};
    const result = await ensureNoteSnapshots(['a.md', 'a.md', 'b.md'], existing, readContent);
    expect(reads).toEqual(['a.md', 'b.md']);
    expect(Object.keys(result)).toEqual(['a.md', 'b.md']);
  });

  it('读失败不写快照', async () => {
    const readContent = async () => {
      throw new Error('fail');
    };
    const result = await ensureNoteSnapshots(['x.md'], {}, readContent);
    expect(result['x.md']).toBeUndefined();
  });
});
```

- [ ] **Step 8: 实现 `ensureNoteSnapshots`**

```typescript
export async function ensureNoteSnapshots(
  paths: string[],
  snapshots: Record<string, INoteSnapshot>,
  readContent: (path: string) => Promise<string>,
): Promise<Record<string, INoteSnapshot>> {
  const next = { ...snapshots };
  const unique = [...new Set(paths.map(normalizeNotePath))];
  for (const path of unique) {
    if (next[path]) continue;
    try {
      const raw = await readContent(path);
      const { content, isTruncated, originalLength } = truncateNoteContent(raw);
      next[path] = {
        path,
        content,
        snapshotAt: Date.now(),
        isTruncated,
        originalLength,
      };
    } catch {
      // 读失败：不写入快照，展开阶段走占位
    }
  }
  return next;
}
```

- [ ] **Step 9: 运行测试确认 PASS**

Run: `pnpm --filter @momo/aichat test`
Expected: PASS

---

### Task 3: 宿主 readContent

**Files:**
- Modify: `apps/skill-platform/src/renderer/services/aichat/note-reference-config.ts`

- [ ] **Step 1: 暴露 readContent，保留 resolveContent 兼容**

```typescript
export function createNoteReferencesConfig(): INoteReferencesConfig | undefined {
  return {
    listTree: listNoteTree,
    readContent: readNoteContent,
    resolveContent: async (content) => resolveNoteMentionsInContent(content, readNoteContent),
  };
}
```

---

### Task 4: useChatSessions 发送与 API 构建

**Files:**
- Modify: `packages/momo-aichat/src/hooks/useChatSessions.ts`

- [ ] **Step 1: 从 `useAiChatConfig` 解构 `noteReferences`**

在 hook 顶部 config 解构中加入 `noteReferences`。

- [ ] **Step 2: 添加 `resolveSessionForApi` 辅助函数（同文件或 note-mention 导入）**

```typescript
async function buildNoteSnapshotsForContent(
  content: string,
  session: IChatSession,
  readContent?: (path: string) => Promise<string>,
): Promise<Record<string, INoteSnapshot>> {
  if (!readContent) return session.noteSnapshots ?? {};
  const paths = findNoteMentions(content).map((m) => normalizeNotePath(m.path));
  if (paths.length === 0) return session.noteSnapshots ?? {};
  return ensureNoteSnapshots(paths, session.noteSnapshots ?? {}, readContent);
}

function toApiUserContent(
  displayContent: string,
  snapshots: Record<string, INoteSnapshot>,
): string {
  return expandNoteMentionsWithSnapshots(displayContent, snapshots);
}
```

- [ ] **Step 3: 在 `sendMessage` 中，addMessage 之前补快照**

```typescript
const displayContent = (options?.displayContent ?? content).trim();
let activeSnapshots = session?.noteSnapshots ?? {};

if (noteReferences?.readContent && displayContent) {
  activeSnapshots = await buildNoteSnapshotsForContent(
    displayContent,
    { ...session!, noteSnapshots: activeSnapshots },
    noteReferences.readContent,
  );
  updateSessionMeta(activeSessionId, { noteSnapshots: activeSnapshots });
}
```

注意：`session` 可能为 undefined（新会话 draft），draft 创建后需再取 session 或合并到 draftSession 对象。

- [ ] **Step 4: 构建 `chatMessages` 时展开 user 消息**

将现有 `.map((m) => ({ role, content: m.content }))` 改为：

```typescript
.map((m) => ({
  role: m.role,
  content:
    m.role === 'user'
      ? toApiUserContent(m.content, activeSnapshots)
      : m.content,
}))
```

当前轮 user 消息：

```typescript
chatMessages.push({
  role: 'user',
  content: toApiUserContent(content.trim(), activeSnapshots),
});
```

其中 `content` 参数已是 displayContent（AiChatView 改后传 display 而非 resolved）。

- [ ] **Step 5: 惰性补快照 — 历史消息含 token 且无快照**

在构建 chatMessages 之前，收集**所有**历史 user 消息中的 mentions，对缺失 path 调用 `ensureNoteSnapshots` 一次（需 `readContent`）。

- [ ] **Step 6: CLI Agent prompt 展开**

将 `prompt: content.trim()` 改为：

```typescript
prompt: toApiUserContent(content.trim(), activeSnapshots),
```

- [ ] **Step 7: 调整 `AiChatView.handleSendMessage`**

删除 `noteReferences?.resolveContent` 块；`sendMessage` 第一个参数传 `displayContent`（token 原文），options 仍传 `displayContent`：

```typescript
await sendMessage(displayContent, attachmentsMeta, {
  displayContent,
  referenceImages: ...,
});
```

原先 `sendMessage(finalUserContent, ...)` 改为传 display，API 展开由 hook 负责。

- [ ] **Step 8: 重试 / 编辑消息路径检查**

确认 `retryAssistantReply`、编辑用户消息后重发同样走快照逻辑；编辑若新增 @ path 应补快照。

---

### Task 5: UI placeholder

**Files:**
- Modify: `packages/momo-aichat/src/components/ChatInputPanel/index.tsx`

- [ ] **Step 1: 动态 placeholder**

```typescript
const inputPlaceholder = noteReferences
  ? '输入消息，@ 引用笔记'
  : placeholder;
```

传给 `ChatMentionTextarea` / textarea 的 `placeholder={inputPlaceholder}`。

---

### Task 6: 手动验证

- [ ] **Step 1: 侧栏对话**

1. @ 一篇短笔记，问「这篇笔记讲什么」→ 应正确总结  
2. 不再次 @，追问「第二段的核心观点」→ 仍应回答（多轮）  
3. 再次 @ 同一笔记，Network/调试确认无二次 readNoteFile（可在 readContent 打 log）

- [ ] **Step 2: 大笔记**

@ 或构造超 2 万字笔记，发送后检查 API 请求体（devtools）含截断后缀。

- [ ] **Step 3: 工作流节点对话**

在工作流节点 AI 面板重复 Step 1。

- [ ] **Step 4: 运行单测**

Run: `pnpm --filter @momo/aichat test`
Expected: PASS

---

## Spec 覆盖自检

| 规格条目 | 对应 Task |
|---------|-----------|
| 会话级 noteSnapshots | Task 1, 4 |
| 首次 @ 快照、复用 | Task 2 ensureNoteSnapshots, Task 4 |
| 多轮 API 展开 | Task 4 Step 4-5 |
| 单篇 2 万截断 | Task 2 |
| 全场景 readContent | Task 3 |
| UI placeholder | Task 5 |
| AiChatView 去掉重复 resolve | Task 4 Step 7 |
| CLI 展开 | Task 4 Step 6 |
| 存量惰性补快照 | Task 4 Step 5 |
| 验证标准 1-6 | Task 6 |

## 占位符扫描

无 TBD / TODO /「后续实现」类描述。
