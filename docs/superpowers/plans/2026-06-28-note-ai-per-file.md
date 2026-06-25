# 笔记 AI 写作按文件隔离 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 每个笔记文件拥有独立的 AI 写作历史、模型、RAG 与工作区配置；通过稳定 `noteId` 绑定，重命名保留、删除清理。

**Architecture:** 扩展 `.notes-meta.json` 存储 UUID `noteId`；`NoteAiWritingModal` 使用 `note-ai-{noteId}` 作为 `storageKeyPrefix` 与独立 workspace storageKey；删除时清理 localStorage。

**Tech Stack:** TypeScript、Electron IPC、Zustand、`@momo/aichat` buildStorageKeys、useChatWorkspaceConfig

**Spec:** `docs/superpowers/specs/2026-06-28-note-ai-per-file-workspace-grep-design.md`

---

## 文件变更一览

| 操作 | 文件 | 职责 |
|------|------|------|
| Modify | `apps/skill-platform/src/types/modules/note.ts` | INoteMetaEntry、树节点 noteId |
| Modify | `apps/skill-platform/src/main/services/note/workspace.ts` | 生成/迁移 noteId；rename 保留 |
| Modify | `apps/skill-platform/src/renderer/services/note/note-ai-storage.ts` | **Create** 清理与 prefix 工具 |
| Modify | `apps/skill-platform/src/renderer/components/Note/NoteAiWritingModal/index.tsx` | 动态 prefix + 独立 workspace |
| Modify | `apps/skill-platform/src/renderer/components/Note/NoteManager/index.tsx` | 传递 noteId |
| Modify | `apps/skill-platform/src/renderer/store/note/index.ts` | delete 时清理 AI storage |

---

### Task 1: 扩展 note meta 与 noteId 生成

**Files:**
- Modify: `apps/skill-platform/src/types/modules/note.ts`
- Modify: `apps/skill-platform/src/main/services/note/workspace.ts`

- [ ] **Step 1: 更新类型**

在 `note.ts` 中：

```typescript
export interface INoteMetaEntry {
  noteType: ENoteType;
  noteId: string;
}

export interface INoteTreeNode {
  id: string;
  name: string;
  kind: ENoteNodeKind;
  noteType?: ENoteType;
  noteId?: string; // 仅 file 节点
  children?: INoteTreeNode[];
}
```

- [ ] **Step 2: workspace.ts 增加 noteId 工具**

```typescript
import { randomUUID } from 'crypto';

function ensureNoteId(meta: INotesMetaFile, relativePath: string): string {
  const entry = meta.entries[relativePath];
  if (entry?.noteId) {
    return entry.noteId;
  }
  const noteId = randomUUID();
  meta.entries[relativePath] = {
    noteType: entry?.noteType ?? 'text',
    noteId,
  };
  return noteId;
}

function migrateMetaNoteIds(root: string, meta: INotesMetaFile): boolean {
  let changed = false;
  for (const key of Object.keys(meta.entries)) {
    if (!meta.entries[key].noteId) {
      meta.entries[key].noteId = randomUUID();
      changed = true;
    }
  }
  if (changed) {
    saveMeta(root, meta);
  }
  return changed;
}
```

- [ ] **Step 3: createFile 写入 noteId**

`createFile` 返回时包含 `noteId`；`setNoteType` 改为写入完整 entry 或 create 时直接 `meta.entries[rel] = { noteType, noteId: randomUUID() }`。

- [ ] **Step 4: scanDirectory 填充 noteId**

`listTree()` 开头调用 `migrateMetaNoteIds`；scan 文件节点时从 meta 读取 `noteId` 填入 `INoteTreeNode`。

- [ ] **Step 5: renameMetaEntry 保留 noteId**

确认 `renameMetaEntry` 整体搬迁 entry 对象（含 noteId），无需额外改动；copyFile 为新 path 生成新 noteId。

- [ ] **Step 6: deleteNode 返回 noteId**

`deleteNode` 删除前收集将被删文件的所有 noteId（单文件或文件夹递归），通过 IPC 返回 `{ deletedNoteIds: string[] }` 或在 renderer 删除前调用 `getNoteIdsUnderPath`。

- [ ] **Step 7: 验证**

手动：创建笔记 → listTree 含 noteId；重命名后 noteId 不变。

---

### Task 2: note AI storage 工具

**Files:**
- Create: `apps/skill-platform/src/renderer/services/note/note-ai-storage.ts`

- [ ] **Step 1: 实现 prefix 与清理**

```typescript
import { buildStorageKeys } from '@momo/aichat';

export function buildNoteAiStoragePrefix(noteId: string): string {
  return `note-ai-${noteId}`;
}

export function buildNoteAiWorkspaceStorageKey(noteId: string): string {
  return `note-ai-workspace-${noteId}`;
}

export function clearNoteAiWritingStorage(noteId: string): void {
  const keys = buildStorageKeys(buildNoteAiStoragePrefix(noteId));
  localStorage.removeItem(keys.CHAT_SESSIONS);
  localStorage.removeItem(keys.CURRENT_SESSION_ID);
  localStorage.removeItem(keys.CURRENT_MODEL);
  localStorage.removeItem(keys.ADVANCED_SETTINGS);
  localStorage.removeItem(buildNoteAiWorkspaceStorageKey(noteId));
}
```

- [ ] **Step 2: 导出 noteId 收集辅助**

```typescript
import type { IMomoTreeNode } from '@momo/tree';

export function collectNoteIdsFromTree(nodes: IMomoTreeNode[], folderOrFileId: string): string[] {
  const ids: string[] = [];
  const walk = (items: IMomoTreeNode[]) => {
    for (const node of items) {
      if (node.id === folderOrFileId || node.id.startsWith(`${folderOrFileId}/`)) {
        if (node.kind === 'file' && node.noteId) {
          ids.push(node.noteId);
        }
        if (node.children?.length) {
          walk(node.children);
        }
      } else if (node.children?.length) {
        walk(node.children);
      }
    }
  };
  walk(nodes);
  return ids;
}
```

需在 `IMomoTreeNode` 映射时带上 `noteId`（Task 3）。

---

### Task 3: NoteAiWritingModal 按 noteId 隔离

**Files:**
- Modify: `apps/skill-platform/src/renderer/components/Note/NoteAiWritingModal/index.tsx`
- Modify: `packages/momo-tree` 类型（若 IMomoTreeNode 无 noteId，在 mapToMomoNodes 扩展或仅用 renderer 侧类型断言）

- [ ] **Step 1: Props 增加 noteId**

```typescript
interface IProps {
  open: boolean;
  filePath: string;
  noteId: string;
  onClose: () => void;
}
```

- [ ] **Step 2: 独立 workspace binding**

```typescript
import { useChatWorkspaceConfig } from '@momo/aichat';
import { pickFolders } from '@renderer/services/desktop';
import { buildNoteAiWorkspaceStorageKey } from '@renderer/services/note/note-ai-storage';

const workspace = useChatWorkspaceConfig({
  storageKey: buildNoteAiWorkspaceStorageKey(noteId),
  selectFolder: async () => {
    const paths = await pickFolders();
    return paths[0] ?? null;
  },
});
```

- [ ] **Step 3: 动态 storageKeyPrefix**

```typescript
const chatServices = useMemo(
  () =>
    buildSharedAiChatServices({
      // ...
      storageKeyPrefix: buildNoteAiStoragePrefix(noteId),
      workspace,
    }),
  [aiModels, chatModelOptionGroups, modelResolverRef, noteId, showToast, workspace],
);
```

- [ ] **Step 4: key={noteId} 重挂载**

```tsx
<ChatProvider key={noteId} services={chatServices}>
```

---

### Task 4: NoteManager 与 store 集成

**Files:**
- Modify: `apps/skill-platform/src/renderer/store/note/index.ts`
- Modify: `apps/skill-platform/src/renderer/components/Note/NoteManager/index.tsx`

- [ ] **Step 1: mapToMomoNodes 传递 noteId**

```typescript
function mapToMomoNodes(nodes: INoteTreeNode[]): IMomoTreeNode[] {
  return nodes.map((node) => ({
    id: node.id,
    name: node.name,
    kind: node.kind,
    noteType: node.noteType,
    noteId: node.noteId,
    children: node.children?.length ? mapToMomoNodes(node.children) : undefined,
  }));
}
```

（若 `@momo/tree` 的 `IMomoTreeNode` 无 `noteId`，在 tree 包扩展可选字段。）

- [ ] **Step 2: store 增加 selectedNoteId**

```typescript
selectedNoteId: string | null;
// selectFile 时从 rawTree 查找 file node 的 noteId
```

- [ ] **Step 3: deleteNode 清理 storage**

```typescript
deleteNode: async (nodeId) => {
  const { rawTree } = get();
  const noteIds = collectNoteIdsFromTree(rawTree, nodeId);
  await deleteNote(nodeId);
  for (const id of noteIds) {
    clearNoteAiWritingStorage(id);
  }
  // ...existing clear selectedId logic
},
```

- [ ] **Step 4: NoteManager 传 noteId**

```tsx
<NoteAiWritingModal
  key={selectedNoteId ?? selectedId}
  open={aiWritingOpen}
  filePath={selectedId}
  noteId={selectedNoteId ?? ''}
  onClose={() => setAiWritingOpen(false)}
/>
```

无 noteId 时不渲染 modal 或 showToast 提示重新加载树。

---

### Task 5: 验收

- [ ] **Step 1: 手动测试清单（spec §7 需求 2）**

1. 两笔记独立历史
2. 模型/RAG/工作区 per-file
3. 重命名后保留
4. DevTools → Application → localStorage 删除后键消失

- [ ] **Step 2: TypeScript 检查**

Run: `pnpm --filter AIM exec tsc --noEmit`（或项目等效命令）

Expected: 无类型错误

---

## Spec 覆盖自检

| Spec 要求 | 对应 Task |
|-----------|-----------|
| noteId in meta | Task 1 |
| 独立 storage / workspace | Task 2, 3 |
| 重命名保留 | Task 1 renameMetaEntry |
| 删除清理 | Task 2, 4 |
| 复制新 noteId | Task 1 copyFile |
| 存量迁移 | Task 1 migrateMetaNoteIds |
