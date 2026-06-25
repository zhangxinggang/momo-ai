# @momo/langchain 包提取 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新建 `@momo/langchain` 包，统一封装 LangChain PDF 加载与文本切分能力，并迁移 `skill-platform` 与 `momo-knowledge` 的 LangChain 直接依赖。

**Architecture:** Registry + Factory 门面，`loaders/` 与 `splitters/` 分域实现；对外提供 Factory 与便捷函数；业务分段逻辑保留在 `@momo/knowledge`。

**Tech Stack:** TypeScript、pnpm workspace、`@langchain/community`、`@langchain/core`、`@langchain/textsplitters`

**Spec:** `docs/superpowers/specs/2026-06-25-momo-langchain-design.md`

---

## 文件变更一览

| 操作 | 文件 | 职责 |
|------|------|------|
| Create | `packages/momo-langchain/package.json` | 包元数据与 LangChain 依赖 |
| Create | `packages/momo-langchain/tsconfig.json` | TS 配置 |
| Create | `packages/momo-langchain/src/constants.ts` | ELoaderKind、ESplitterKind |
| Create | `packages/momo-langchain/src/types/document.ts` | ILangchainDocument |
| Create | `packages/momo-langchain/src/types/loader.ts` | ILoaderAdapter、IPdfLoaderInput |
| Create | `packages/momo-langchain/src/types/splitter.ts` | ISplitterAdapter、ISplitterConfig |
| Create | `packages/momo-langchain/src/core/registry.ts` | 通用注册表 |
| Create | `packages/momo-langchain/src/core/factory.ts` | createLoader、createSplitter |
| Create | `packages/momo-langchain/src/loaders/pdf.ts` | PDF loader + loadPdfText |
| Create | `packages/momo-langchain/src/loaders/index.ts` | 注册 loader |
| Create | `packages/momo-langchain/src/splitters/recursive-character.ts` | 递归切分 + splitTextRecursive |
| Create | `packages/momo-langchain/src/splitters/index.ts` | 注册 splitter |
| Create | `packages/momo-langchain/src/index.ts` | 聚合导出 |
| Modify | `packages/momo-knowledge/package.json` | 换依赖为 @momo/langchain |
| Modify | `packages/momo-knowledge/src/chunker.ts` | 改用 splitTextRecursive |
| Modify | `apps/skill-platform/package.json` | 移除 @langchain/*、pdf-parse，加 @momo/langchain |
| Modify | `apps/skill-platform/src/main/services/kb/file-parser.ts` | 改用 loadPdfText |
| Modify | `apps/skill-platform/vite.config.ts` | 移除 pdf-parse external、加 alias |
| Modify | `apps/skill-platform/tsconfig.json` | 加 @momo/langchain paths（若缺失） |

---

### Task 1: 脚手架 packages/momo-langchain

**Files:**
- Create: `packages/momo-langchain/package.json`
- Create: `packages/momo-langchain/tsconfig.json`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "@momo/langchain",
  "version": "0.1.0",
  "private": true,
  "description": "LangChain 统一门面：文档加载、文本切分及可扩展 RAG 原语",
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts"
    }
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@langchain/community": "^1.1.29",
    "@langchain/core": "^1.1.48",
    "@langchain/textsplitters": "^1.0.1"
  },
  "devDependencies": {
    "typescript": "^6.0.3"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "strict": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: 安装依赖**

Run: `pnpm install`

Expected: lockfile 更新，`@momo/langchain` 可被 workspace 引用

---

### Task 2: 类型与常量

**Files:**
- Create: `packages/momo-langchain/src/constants.ts`
- Create: `packages/momo-langchain/src/types/document.ts`
- Create: `packages/momo-langchain/src/types/loader.ts`
- Create: `packages/momo-langchain/src/types/splitter.ts`

- [ ] **Step 1: 写入 constants.ts**

```typescript
/** 文档加载器种类 */
export enum ELoaderKind {
  EPdf = 'pdf',
}

/** 文本切分器种类 */
export enum ESplitterKind {
  ERecursiveCharacter = 'recursive_character',
}
```

- [ ] **Step 2: 写入 types/document.ts**

```typescript
/** LangChain 文档片段 */
export interface ILangchainDocument {
  pageContent: string;
  metadata?: Record<string, unknown>;
}
```

- [ ] **Step 3: 写入 types/loader.ts**

```typescript
import type { ELoaderKind } from '../constants';
import type { ILangchainDocument } from './document';

/** 文档加载器适配器 */
export interface ILoaderAdapter<TInput = unknown> {
  readonly kind: ELoaderKind;
  load(input: TInput): Promise<ILangchainDocument[]>;
}

/** PDF 加载输入 */
export interface IPdfLoaderInput {
  buffer: Buffer;
}
```

- [ ] **Step 4: 写入 types/splitter.ts**

```typescript
import type { ESplitterKind } from '../constants';

/** 文本切分配置 */
export interface ISplitterConfig {
  chunkSize: number;
  chunkOverlap: number;
  separators?: string[];
}

/** 文本切分器适配器 */
export interface ISplitterAdapter {
  readonly kind: ESplitterKind;
  splitText(text: string, config: ISplitterConfig): Promise<string[]>;
}
```

---

### Task 3: Registry 与 Factory

**Files:**
- Create: `packages/momo-langchain/src/core/registry.ts`
- Create: `packages/momo-langchain/src/core/factory.ts`

- [ ] **Step 1: 写入 registry.ts**

```typescript
/** 按 kind 注册与解析工厂 */
export class KindRegistry<TKind extends string, TInstance> {
  private readonly factories = new Map<TKind, () => TInstance>();

  register(kind: TKind, factory: () => TInstance): void {
    this.factories.set(kind, factory);
  }

  create(kind: TKind): TInstance {
    const factory = this.factories.get(kind);
    if (!factory) {
      throw new Error(`未注册的 kind: ${kind}`);
    }
    return factory();
  }
}
```

- [ ] **Step 2: 写入 factory.ts（先留空 registry 引用，Task 4/5 注册后补全）**

```typescript
import { ELoaderKind, ESplitterKind } from '../constants';
import { KindRegistry } from './registry';
import type { ILoaderAdapter, IPdfLoaderInput } from '../types/loader';
import type { ISplitterAdapter } from '../types/splitter';

const loaderRegistry = new KindRegistry<ELoaderKind, ILoaderAdapter<unknown>>();
const splitterRegistry = new KindRegistry<ESplitterKind, ISplitterAdapter>();

/** 注册 loader 工厂（模块初始化时调用） */
export function registerLoader(
  kind: ELoaderKind,
  factory: () => ILoaderAdapter<unknown>,
): void {
  loaderRegistry.register(kind, factory);
}

/** 注册 splitter 工厂（模块初始化时调用） */
export function registerSplitter(kind: ESplitterKind, factory: () => ISplitterAdapter): void {
  splitterRegistry.register(kind, factory);
}

/** 按 kind 创建 loader */
export function createLoader(kind: ELoaderKind.EPdf): ILoaderAdapter<IPdfLoaderInput>;
export function createLoader(kind: ELoaderKind): ILoaderAdapter<unknown> {
  return loaderRegistry.create(kind);
}

/** 按 kind 创建 splitter */
export function createSplitter(
  kind: ESplitterKind,
): ISplitterAdapter {
  return splitterRegistry.create(kind);
}
```

---

### Task 4: PDF Loader

**Files:**
- Create: `packages/momo-langchain/src/loaders/pdf.ts`
- Create: `packages/momo-langchain/src/loaders/index.ts`

- [ ] **Step 1: 写入 loaders/pdf.ts**

```typescript
import { ELoaderKind } from '../constants';
import type { ILangchainDocument } from '../types/document';
import type { ILoaderAdapter, IPdfLoaderInput } from '../types/loader';

/** PDF 加载器（WebPDFLoader，按页加载） */
export class PdfLoader implements ILoaderAdapter<IPdfLoaderInput> {
  readonly kind = ELoaderKind.EPdf;

  async load(input: IPdfLoaderInput): Promise<ILangchainDocument[]> {
    const { WebPDFLoader } = await import('@langchain/community/document_loaders/web/pdf');
    const blob = new Blob([new Uint8Array(input.buffer)], { type: 'application/pdf' });
    const loader = new WebPDFLoader(blob);
    const docs = await loader.load();
    return docs.map((doc) => ({
      pageContent: doc.pageContent,
      metadata: doc.metadata as Record<string, unknown> | undefined,
    }));
  }
}

/** 从 PDF Buffer 提取纯文本 */
export async function loadPdfText(buffer: Buffer): Promise<string> {
  const loader = new PdfLoader();
  const docs = await loader.load({ buffer });
  return docs.map((doc) => doc.pageContent).join('\n\n');
}
```

- [ ] **Step 2: 写入 loaders/index.ts**

```typescript
import { ELoaderKind } from '../constants';
import { registerLoader } from '../core/factory';
import { PdfLoader } from './pdf';

registerLoader(ELoaderKind.EPdf, () => new PdfLoader());

export { PdfLoader, loadPdfText } from './pdf';
```

---

### Task 5: Recursive Character Splitter

**Files:**
- Create: `packages/momo-langchain/src/splitters/recursive-character.ts`
- Create: `packages/momo-langchain/src/splitters/index.ts`

- [ ] **Step 1: 写入 splitters/recursive-character.ts**

```typescript
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import { ESplitterKind } from '../constants';
import type { ISplitterAdapter, ISplitterConfig } from '../types/splitter';

/** 递归字符切分器 */
export class RecursiveCharacterSplitter implements ISplitterAdapter {
  readonly kind = ESplitterKind.ERecursiveCharacter;

  async splitText(text: string, config: ISplitterConfig): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: config.chunkSize,
      chunkOverlap: config.chunkOverlap,
      separators: config.separators,
    });
    const chunks = await splitter.splitText(text);
    return chunks.filter(Boolean);
  }
}

/** 递归字符切分便捷函数 */
export async function splitTextRecursive(
  text: string,
  config: ISplitterConfig,
): Promise<string[]> {
  const splitter = new RecursiveCharacterSplitter();
  return splitter.splitText(text, config);
}
```

- [ ] **Step 2: 写入 splitters/index.ts**

```typescript
import { ESplitterKind } from '../constants';
import { registerSplitter } from '../core/factory';
import { RecursiveCharacterSplitter } from './recursive-character';

registerSplitter(ESplitterKind.ERecursiveCharacter, () => new RecursiveCharacterSplitter());

export { RecursiveCharacterSplitter, splitTextRecursive } from './recursive-character';
```

---

### Task 6: 聚合导出 index.ts

**Files:**
- Create: `packages/momo-langchain/src/index.ts`

- [ ] **Step 1: 写入 index.ts**

```typescript
import './loaders/index';
import './splitters/index';

export { ELoaderKind, ESplitterKind } from './constants';
export { createLoader, createSplitter, registerLoader, registerSplitter } from './core/factory';
export { KindRegistry } from './core/registry';
export { PdfLoader, loadPdfText } from './loaders/pdf';
export { RecursiveCharacterSplitter, splitTextRecursive } from './splitters/recursive-character';
export type { ILangchainDocument } from './types/document';
export type { ILoaderAdapter, IPdfLoaderInput } from './types/loader';
export type { ISplitterAdapter, ISplitterConfig } from './types/splitter';
```

- [ ] **Step 2: 类型检查**

Run: `pnpm --filter @momo/langchain run typecheck`

Expected: PASS，无 TS 错误

---

### Task 7: 迁移 momo-knowledge

**Files:**
- Modify: `packages/momo-knowledge/package.json`
- Modify: `packages/momo-knowledge/src/chunker.ts`

- [ ] **Step 1: 更新 package.json 依赖**

移除：
```json
"@langchain/textsplitters": "^1.0.1",
```

添加：
```json
"@momo/langchain": "workspace:*",
```

- [ ] **Step 2: 更新 chunker.ts**

将：
```typescript
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
```

改为：
```typescript
import { splitTextRecursive } from '@momo/langchain';
```

将 `chunkTextWithSettings` 内：
```typescript
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: resolveSeparators(settings.separator),
  });

  const chunks = await splitter.splitText(cleaned);
  return attachPositions(cleaned, chunks.filter(Boolean));
```

改为：
```typescript
  const chunks = await splitTextRecursive(cleaned, {
    chunkSize,
    chunkOverlap,
    separators: resolveSeparators(settings.separator),
  });
  return attachPositions(cleaned, chunks);
```

- [ ] **Step 3: 类型检查**

Run: `pnpm --filter @momo/knowledge run typecheck`

Expected: PASS

---

### Task 8: 迁移 skill-platform

**Files:**
- Modify: `apps/skill-platform/package.json`
- Modify: `apps/skill-platform/src/main/services/kb/file-parser.ts`
- Modify: `apps/skill-platform/vite.config.ts`
- Modify: `apps/skill-platform/tsconfig.json`（若 paths 缺失）

- [ ] **Step 1: 更新 package.json**

移除：
```json
"@langchain/community": "^1.1.29",
"@langchain/core": "^1.1.48",
"@langchain/textsplitters": "^1.0.1",
"pdf-parse": "^2.4.5",
```

添加：
```json
"@momo/langchain": "workspace:*",
```

- [ ] **Step 2: 更新 file-parser.ts**

添加 import：
```typescript
import { loadPdfText } from '@momo/langchain';
```

将 `extractPdfText` 函数体替换为：
```typescript
async function extractPdfText(buffer: Buffer): Promise<string> {
  return loadPdfText(buffer);
}
```

- [ ] **Step 3: 更新 vite.config.ts**

从 `MAIN_PROCESS_EXTERNALS` 数组移除 `'pdf-parse'`。

在 resolve alias 区域（与 `@momo/knowledge` 并列）添加：
```typescript
'@momo/langchain': path.resolve(__dirname, '../../packages/momo-langchain/src/index.ts'),
```

- [ ] **Step 4: 更新 tsconfig.json paths（若缺失）**

```json
"@momo/langchain": ["../../packages/momo-langchain/src/index.ts"],
"@momo/langchain/*": ["../../packages/momo-langchain/src/*"]
```

- [ ] **Step 5: 安装并验证无 @langchain 直接引用**

Run: `pnpm install`

Run: `rg "@langchain/" apps/skill-platform packages/momo-knowledge --glob "*.{ts,tsx}"`

Expected: 无匹配（package.json 中也不应再有 @langchain）

---

### Task 9: 整体验证

- [ ] **Step 1: 全包 typecheck**

Run: `pnpm --filter @momo/langchain run typecheck`
Run: `pnpm --filter @momo/knowledge run typecheck`

Expected: 均 PASS

- [ ] **Step 2: skill-platform 构建冒烟（可选，耗时较长）**

Run: `pnpm --filter AIM exec vite build`

Expected: 主进程 bundle 成功，无 `@langchain` 解析错误

---

## Spec 覆盖自检

| Spec 章节 | 对应 Task |
|-----------|-----------|
| 包结构 | Task 1–6 |
| 核心类型 | Task 2 |
| Factory + 便捷函数 | Task 3–6 |
| 依赖关系变更 | Task 7–8 |
| momo-knowledge 迁移 | Task 7 |
| skill-platform 迁移 + pdf-parse 清理 | Task 8 |
| 验证标准 | Task 9 |
