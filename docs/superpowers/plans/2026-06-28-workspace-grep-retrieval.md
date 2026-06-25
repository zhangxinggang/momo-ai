# AI 对话工作区 Grep 按需检索 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 侧栏 AI 对话启用工作区时，始终注入目录树摘要；相关问题通过 gitignore 感知的 Grep + Read 片段注入上下文，禁止读取 ignore 文件，不再全量扫描仓库。

**Architecture:** 主进程 `workspace/` 服务模块 + 新 IPC；渲染层 `relevance-heuristic` + 改造 `getEnabledWorkspaceContext`；依赖 `ignore` 包解析 `.gitignore`。

**Tech Stack:** TypeScript、Electron IPC、`ignore` npm 包、现有 `general-chat-stream.ts`

**Spec:** `docs/superpowers/specs/2026-06-28-note-ai-per-file-workspace-grep-design.md`

---

## 文件变更一览

| 操作 | 文件 | 职责 |
|------|------|------|
| Modify | `apps/skill-platform/package.json` | 添加 `ignore` 依赖 |
| Modify | `apps/skill-platform/src/types/constants/ipc-channels.ts` | 新 IPC 常量 |
| Create | `apps/skill-platform/src/main/services/workspace/gitignore-filter.ts` | ignore 规则 |
| Create | `apps/skill-platform/src/main/services/workspace/list-tree.ts` | 目录树 |
| Create | `apps/skill-platform/src/main/services/workspace/grep.ts` | 文本搜索 |
| Create | `apps/skill-platform/src/main/services/workspace/read-snippet.ts` | 片段读取 |
| Modify | `apps/skill-platform/src/main/ipc/workspace.ts` | 注册 handler |
| Modify | `apps/skill-platform/src/preload/api/workspace.ts` | 暴露 API |
| Create | `apps/skill-platform/src/renderer/services/workspace/relevance-heuristic.ts` | 相关性判定 |
| Create | `apps/skill-platform/src/renderer/services/workspace/keyword-extract.ts` | 关键词提取 |
| Modify | `apps/skill-platform/src/renderer/services/workspace/context.ts` | 混合上下文 |
| Modify | `apps/skill-platform/src/renderer/services/aichat/streams/general-chat-stream.ts` | 传入 user message（若需） |

---

### Task 1: 添加依赖与 IPC 常量

**Files:**
- Modify: `apps/skill-platform/package.json`
- Modify: `apps/skill-platform/src/types/constants/ipc-channels.ts`

- [ ] **Step 1: 安装 ignore**

Run: `pnpm add ignore --filter AIM`

- [ ] **Step 2: 新增 IPC 通道**

```typescript
WORKSPACE_LIST_TREE: 'workspace:listTree',
WORKSPACE_GREP: 'workspace:grep',
WORKSPACE_READ_SNIPPET: 'workspace:readSnippet',
```

---

### Task 2: gitignore-filter 模块

**Files:**
- Create: `apps/skill-platform/src/main/services/workspace/gitignore-filter.ts`

- [ ] **Step 1: 实现 WorkspaceIgnoreFilter 类**

```typescript
import ignore, { type Ignore } from 'ignore';
import fs from 'fs';
import path from 'path';

export class WorkspaceIgnoreFilter {
  private ig: Ignore;

  constructor(workspaceRoot: string) {
    this.ig = ignore();
    this.ig.add(['.git/', 'node_modules/']);
    this.loadGitignoreChain(workspaceRoot);
  }

  private loadGitignoreChain(absRoot: string): void {
    let current = absRoot;
    const root = path.parse(current).root;
    const files: string[] = [];
    while (true) {
      const gi = path.join(current, '.gitignore');
      if (fs.existsSync(gi)) {
        files.unshift(fs.readFileSync(gi, 'utf-8'));
      }
      if (current === root) break;
      current = path.dirname(current);
    }
    for (const content of files) {
      this.ig.add(content);
    }
  }

  isIgnored(relativePath: string): boolean {
    const normalized = relativePath.replace(/\\/g, '/');
    return this.ig.ignores(normalized);
  }
}
```

- [ ] **Step 2: 导出 factory**

```typescript
export function createIgnoreFilter(workspaceRoot: string): WorkspaceIgnoreFilter {
  return new WorkspaceIgnoreFilter(workspaceRoot);
}
```

---

### Task 3: list-tree 模块

**Files:**
- Create: `apps/skill-platform/src/main/services/workspace/list-tree.ts`

- [ ] **Step 1: 实现 listWorkspaceTree**

```typescript
const MAX_TREE_DEPTH = 4;
const MAX_TREE_NODES = 500;

export interface ITreeEntry {
  path: string; // relative to root
  type: 'file' | 'directory';
}

export function listWorkspaceTree(
  workspaceRoot: string,
  filter: WorkspaceIgnoreFilter,
): { entries: ITreeEntry[]; truncated: boolean } {
  const entries: ITreeEntry[] = [];
  let truncated = false;

  function walk(dirAbs: string, relPrefix: string, depth: number): void {
    if (depth > MAX_TREE_DEPTH || entries.length >= MAX_TREE_NODES) {
      truncated = true;
      return;
    }
    const items = fs.readdirSync(dirAbs, { withFileTypes: true });
    for (const item of items) {
      if (entries.length >= MAX_TREE_NODES) {
        truncated = true;
        return;
      }
      const rel = relPrefix ? `${relPrefix}/${item.name}` : item.name;
      if (filter.isIgnored(rel + (item.isDirectory() ? '/' : ''))) {
        continue;
      }
      entries.push({ path: rel, type: item.isDirectory() ? 'directory' : 'file' });
      if (item.isDirectory()) {
        walk(path.join(dirAbs, item.name), rel, depth + 1);
      }
    }
  }

  walk(workspaceRoot, '', 0);
  return { entries, truncated };
}
```

- [ ] **Step 2: formatTreeSummary 文本格式化**

将 entries 格式化为缩进目录树字符串（仅 path，无内容）。

---

### Task 4: grep 模块

**Files:**
- Create: `apps/skill-platform/src/main/services/workspace/grep.ts`

- [ ] **Step 1: 实现 grepWorkspace**

```typescript
const MAX_GREP_HITS = 20;
const TEXT_EXT = /\.(ts|tsx|js|jsx|json|md|mdc|less|css|yaml|yml|toml|env\.example)$/i;

export interface IGrepHit {
  filePath: string;
  line: number;
  column: number;
  snippet: string;
}

export function grepWorkspace(
  workspaceRoot: string,
  keywords: string[],
  filter: WorkspaceIgnoreFilter,
): IGrepHit[] {
  const hits: IGrepHit[] = [];
  const lowered = keywords.map((k) => k.toLowerCase()).filter(Boolean);
  if (lowered.length === 0) return hits;

  function walk(dirAbs: string, relPrefix: string): void {
    if (hits.length >= MAX_GREP_HITS) return;
    for (const item of fs.readdirSync(dirAbs, { withFileTypes: true })) {
      if (hits.length >= MAX_GREP_HITS) return;
      const rel = relPrefix ? `${relPrefix}/${item.name}` : item.name;
      if (filter.isIgnored(rel + (item.isDirectory() ? '/' : ''))) continue;
      const abs = path.join(dirAbs, item.name);
      if (item.isDirectory()) {
        walk(abs, rel);
        continue;
      }
      if (!TEXT_EXT.test(item.name)) continue;
      let content: string;
      try {
        const stat = fs.statSync(abs);
        if (stat.size > 512 * 1024) continue;
        content = fs.readFileSync(abs, 'utf-8');
      } catch {
        continue;
      }
      const lines = content.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        if (hits.length >= MAX_GREP_HITS) return;
        const lineLower = lines[i].toLowerCase();
        if (lowered.some((kw) => lineLower.includes(kw))) {
          hits.push({
            filePath: rel,
            line: i + 1,
            column: 0,
            snippet: lines[i].trim().slice(0, 200),
          });
        }
      }
    }
  }

  walk(workspaceRoot, '');
  return hits;
}
```

---

### Task 5: read-snippet 模块

**Files:**
- Create: `apps/skill-platform/src/main/services/workspace/read-snippet.ts`

- [ ] **Step 1: 实现 readFileSnippet**

```typescript
const SNIPPET_CONTEXT_LINES = 8;
const MAX_SNIPPET_CHARS = 4000;

export function readFileSnippet(
  workspaceRoot: string,
  relativePath: string,
  centerLine: number,
  filter: WorkspaceIgnoreFilter,
): string | null {
  if (filter.isIgnored(relativePath)) return null;
  const abs = path.join(workspaceRoot, relativePath);
  if (!fs.existsSync(abs)) return null;
  const lines = fs.readFileSync(abs, 'utf-8').split(/\r?\n/);
  const start = Math.max(0, centerLine - 1 - SNIPPET_CONTEXT_LINES);
  const end = Math.min(lines.length, centerLine + SNIPPET_CONTEXT_LINES);
  const chunk = lines
    .slice(start, end)
    .map((text, idx) => `${start + idx + 1}| ${text}`)
    .join('\n');
  return chunk.length > MAX_SNIPPET_CHARS
    ? chunk.slice(0, MAX_SNIPPET_CHARS) + '\n...(已截断)'
    : chunk;
}
```

---

### Task 6: IPC 注册与 preload

**Files:**
- Modify: `apps/skill-platform/src/main/ipc/workspace.ts`
- Modify: `apps/skill-platform/src/preload/api/workspace.ts`

- [ ] **Step 1: 注册三个 handler**

```typescript
ipcMain.handle(IPC_CHANNELS.WORKSPACE_LIST_TREE, async (_e, dirPath: string) => {
  const filter = createIgnoreFilter(dirPath);
  const { entries, truncated } = listWorkspaceTree(dirPath, filter);
  return { success: true, entries, truncated, treeText: formatTreeSummary(entries) };
});

ipcMain.handle(
  IPC_CHANNELS.WORKSPACE_GREP,
  async (_e, payload: { dirPath: string; keywords: string[] }) => {
    const filter = createIgnoreFilter(payload.dirPath);
    const hits = grepWorkspace(payload.dirPath, payload.keywords, filter);
    return { success: true, hits };
  },
);

ipcMain.handle(
  IPC_CHANNELS.WORKSPACE_READ_SNIPPET,
  async (_e, payload: { dirPath: string; relativePath: string; line: number }) => {
    const filter = createIgnoreFilter(payload.dirPath);
    const content = readFileSnippet(
      payload.dirPath,
      payload.relativePath,
      payload.line,
      filter,
    );
    return { success: Boolean(content), content: content ?? '' };
  },
);
```

- [ ] **Step 2: preload 暴露**

```typescript
listTree: (dirPath: string) => ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_LIST_TREE, dirPath),
grep: (dirPath: string, keywords: string[]) =>
  ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_GREP, { dirPath, keywords }),
readSnippet: (dirPath: string, relativePath: string, line: number) =>
  ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_READ_SNIPPET, { dirPath, relativePath, line }),
```

---

### Task 7: 渲染层启发式与关键词

**Files:**
- Create: `apps/skill-platform/src/renderer/services/workspace/relevance-heuristic.ts`
- Create: `apps/skill-platform/src/renderer/services/workspace/keyword-extract.ts`

- [ ] **Step 1: isWorkspaceRelatedQuestion**

```typescript
const DEV_KEYWORDS = /报错|错误|接口|类|函数|配置|实现|模块|组件|源码|代码|文件|目录/;
const PATH_PATTERN = /[\w.-]+\/[\w./-]+|[\w.-]+\.(ts|tsx|js|jsx|json|md)\b/i;
const IDENTIFIER = /\b[A-Z][a-zA-Z0-9]{2,}\b|\b[a-z][a-zA-Z0-9]{2,}\b/;

export function isWorkspaceRelatedQuestion(message: string): boolean {
  const text = message.trim();
  if (!text) return false;
  return (
    DEV_KEYWORDS.test(text) ||
    PATH_PATTERN.test(text) ||
    IDENTIFIER.test(text)
  );
}
```

- [ ] **Step 2: extractGrepKeywords**

```typescript
const MAX_KEYWORDS = 5;

export function extractGrepKeywords(message: string): string[] {
  const keywords = new Set<string>();
  const pathMatches = message.match(/[\w.-]+\/[\w./-]+|[\w.-]+\.(ts|tsx|js|jsx)/gi) ?? [];
  pathMatches.slice(0, 2).forEach((m) => keywords.add(m.split('/').pop()!.replace(/\.\w+$/, '')));

  const pascal = message.match(/\b[A-Z][a-zA-Z0-9]{2,}\b/g) ?? [];
  pascal.slice(0, 3).forEach((m) => keywords.add(m));

  const camel = message.match(/\b[a-z][a-zA-Z0-9]{2,}\b/g) ?? [];
  camel.slice(0, 2).forEach((m) => keywords.add(m));

  return [...keywords].slice(0, MAX_KEYWORDS);
}
```

---

### Task 8: 改造 context.ts

**Files:**
- Modify: `apps/skill-platform/src/renderer/services/workspace/context.ts`
- Modify: `apps/skill-platform/src/renderer/services/aichat/streams/general-chat-stream.ts`

- [ ] **Step 1: 新签名 getEnabledWorkspaceContext**

```typescript
export async function getEnabledWorkspaceContext(
  userMessage?: string,
): Promise<string> {
  const { workspacePaths, workspaceEnabled } = useChatWorkspaceStore.getState();
  if (!workspaceEnabled || workspacePaths.length === 0) return '';

  const blocks: string[] = [];
  for (const root of workspacePaths) {
    const treeResult = await getWorkspaceApi()?.listTree?.(root);
    if (treeResult?.success && treeResult.treeText) {
      blocks.push(`当前工作区：${root}\n目录结构（不含文件内容）：\n${treeResult.treeText}`);
    }
  }

  const lastMessage = userMessage?.trim() ?? '';
  if (lastMessage && isWorkspaceRelatedQuestion(lastMessage)) {
    const keywords = extractGrepKeywords(lastMessage);
    if (keywords.length > 0) {
      const snippetBlocks: string[] = [];
      let totalChars = 0;
      const MAX_TOTAL = 24000;

      for (const root of workspacePaths) {
        const grepResult = await getWorkspaceApi()?.grep?.(root, keywords);
        if (!grepResult?.success || !grepResult.hits?.length) continue;

        const seenFiles = new Set<string>();
        for (const hit of grepResult.hits) {
          if (seenFiles.has(hit.filePath)) continue;
          seenFiles.add(hit.filePath);
          const snip = await getWorkspaceApi()?.readSnippet?.(root, hit.filePath, hit.line);
          if (!snip?.success || !snip.content) continue;
          const block = `--- ${hit.filePath} (L${hit.line}) ---\n${snip.content}`;
          if (totalChars + block.length > MAX_TOTAL) break;
          snippetBlocks.push(block);
          totalChars += block.length;
        }
      }

      if (snippetBlocks.length > 0) {
        blocks.push(
          '以下为用户问题相关的代码片段（由 Grep 检索，可能已截断）：',
          ...snippetBlocks,
        );
      }
    }
  }

  return blocks.join('\n\n');
}
```

- [ ] **Step 2: general-chat-stream 传入最后用户消息**

```typescript
const lastUser = [...messages].reverse().find((m) => m.role === 'user');
const workspaceContext = await getEnabledWorkspaceContext(lastUser?.content);
```

- [ ] **Step 3: 删除旧 buildWorkspaceContext 全量读文件逻辑**

保留函数名或 deprecate，避免其他调用方断裂；grep 确认仅 general-chat-stream 使用。

---

### Task 9: 验收

- [ ] **Step 1: gitignore 测试**

工作区根目录 `.gitignore` 含 `dist/`；确认 listTree 与 grep 均不含 `dist/` 下文件。

- [ ] **Step 2: 闲聊 vs 代码问题**

- 「你好」→ 仅有目录树
- 「NoteAiWritingModal 在哪定义的」→ 含 grep 片段

- [ ] **Step 3: TypeScript**

Run: `pnpm --filter AIM exec tsc --noEmit`

---

## Spec 覆盖自检

| Spec 要求 | 对应 Task |
|-----------|-----------|
| gitignore 全链路 | Task 2–6 |
| 目录树摘要 | Task 3, 8 |
| 启发式 Grep | Task 7, 8 |
| 限制常量 | Task 3–5, 8 |
| 仅侧栏 AI 对话 | Task 8 general-chat-stream |
| 移除全量读文件 | Task 8 Step 3 |
