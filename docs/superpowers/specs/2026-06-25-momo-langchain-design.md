# @momo/langchain 包提取设计规格

> 日期：2026-06-25  
> 状态：已确认  
> 范围：将 monorepo 内 LangChain 依赖统一收敛至 `packages/momo-langchain`

---

## 1. 背景与目标

当前 LangChain 使用分散在两处：

| 位置 | LangChain 用法 |
|------|----------------|
| `apps/skill-platform` | `@langchain/community` — `WebPDFLoader` 解析 PDF |
| `packages/momo-knowledge` | `@langchain/textsplitters` — `RecursiveCharacterTextSplitter` 文本切分 |

`skill-platform` 的 `package.json` 还声明了未直接使用的 `@langchain/core`、`@langchain/textsplitters`（经 `@momo/knowledge` 间接使用）。

**核心目标：**

- 新建 `@momo/langchain`（`packages/momo-langchain`），作为 monorepo 内唯一 LangChain 入口
- 采用 **Registry + Factory** 可扩展门面架构，预留 embedding / vector store / chain 等扩展位
- `skill-platform` 与 `momo-knowledge` 移除全部 `@langchain/*` 直接依赖
- 业务逻辑（分段设置 UI、文本预处理、块位置追踪）保留在 `@momo/knowledge`

**明确不做（第一版）：**

- embedding / vector store / chain 实现
- 迁移 `file-parser.ts` 中非 LangChain 部分（mammoth、xlsx 等）
- 发布到 npm（`private: true`）
- 改动 `momo-knowledge` 的 React UI 组件与 `ISegmentSettings` 类型

---

## 2. 已确认的产品决策

| 项 | 决策 |
|---|---|
| 包边界 | 方案 B：统一 LangChain 依赖层 |
| 架构定位 | 方案 C：完整 LangChain 门面（Registry + Factory + 便捷函数） |
| 实现路径 | Registry + Factory（非 Pipeline Builder、非单一 Facade 类） |
| 业务层 | `@momo/knowledge` 保留预处理、`attachPositions`、`ISegmentSettings` |
| 构建方式 | source export（与 `@momo/knowledge` 一致，无独立 build 步骤） |
| 清理 | 移除 `skill-platform` 未使用的 `pdf-parse` 及 vite external 配置 |

---

## 3. 包结构

```
packages/momo-langchain/
├── package.json          # name: @momo/langchain, private: true
├── tsconfig.json
└── src/
    ├── index.ts          # 聚合导出
    ├── constants.ts      # ELoaderKind, ESplitterKind
    ├── types/
    │   ├── document.ts   # ILangchainDocument
    │   ├── loader.ts     # ILoaderAdapter, IPdfLoaderInput
    │   └── splitter.ts   # ISplitterAdapter, ISplitterConfig
    ├── core/
    │   ├── registry.ts   # 通用 kind → factory 注册表
    │   └── factory.ts    # createLoader / createSplitter
    ├── loaders/
    │   ├── pdf.ts        # WebPDFLoader 封装 + loadPdfText
    │   └── index.ts      # 注册 PDF loader
    └── splitters/
        ├── recursive-character.ts  # RecursiveCharacterTextSplitter 封装
        └── index.ts                # 注册 recursive splitter
```

---

## 4. 核心类型

```typescript
// constants.ts
export enum ELoaderKind {
  EPdf = 'pdf',
}

export enum ESplitterKind {
  ERecursiveCharacter = 'recursive_character',
}

// types/document.ts
export interface ILangchainDocument {
  pageContent: string;
  metadata?: Record<string, unknown>;
}

// types/loader.ts
export interface ILoaderAdapter<TInput = unknown> {
  readonly kind: ELoaderKind;
  load(input: TInput): Promise<ILangchainDocument[]>;
}

export interface IPdfLoaderInput {
  buffer: Buffer;
}

// types/splitter.ts
export interface ISplitterConfig {
  chunkSize: number;
  chunkOverlap: number;
  separators?: string[];
}

export interface ISplitterAdapter {
  readonly kind: ESplitterKind;
  splitText(text: string, config: ISplitterConfig): Promise<string[]>;
}
```

---

## 5. 公开 API

### 5.1 Factory（扩展入口）

```typescript
createLoader(kind: ELoaderKind.EPdf): ILoaderAdapter<IPdfLoaderInput>
createSplitter(kind: ESplitterKind.ERecursiveCharacter): ISplitterAdapter
```

未知 `kind` 时抛出明确错误。

### 5.2 便捷函数（迁移入口）

```typescript
loadPdfText(buffer: Buffer): Promise<string>
splitTextRecursive(text: string, config: ISplitterConfig): Promise<string[]>
```

`loadPdfText` 内部使用 **dynamic import** 加载 `@langchain/community/document_loaders/web/pdf`，与现有 `file-parser.ts` 行为一致，避免 Electron 主进程启动时拉入整包。

---

## 6. 依赖关系变更

```
变更前:
  skill-platform ──→ @langchain/community, @langchain/core, @langchain/textsplitters
  momo-knowledge ──→ @langchain/textsplitters

变更后:
  skill-platform ──→ @momo/langchain
  momo-knowledge ──→ @momo/langchain
  momo-langchain ──→ @langchain/community, @langchain/core, @langchain/textsplitters
```

根 `package.json` 的 `pnpm.peerDependencyRules`（`@langchain/community>typeorm`）保持不变。

---

## 7. 消费者迁移

### 7.1 momo-knowledge/chunker.ts

- 移除 `import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'`
- 改为 `import { splitTextRecursive } from '@momo/langchain'`
- `resolveSeparators`、`attachPositions`、`preprocessText` 逻辑不变

### 7.2 skill-platform/file-parser.ts

- 移除 `@langchain/community` dynamic import
- `extractPdfText` 改为调用 `loadPdfText(buffer)`
- mammoth / xlsx / 纯文本逻辑不变

### 7.3 skill-platform 配置

- `package.json`：移除 `@langchain/*`、`pdf-parse`；添加 `@momo/langchain: workspace:*`
- `vite.config.ts`：`MAIN_PROCESS_EXTERNALS` 移除 `pdf-parse`
- `tsconfig.json` / `vite.config.ts`：添加 `@momo/langchain` 路径别名（若需要，与 `@momo/knowledge` 对齐）

---

## 8. Electron 与构建

- `@momo/langchain` 作为 workspace 包被 Vite 打包进主进程（与 `@momo/knowledge` 相同）
- PDF loader 保留 dynamic import，`@langchain/community` 仅在首次解析 PDF 时加载
- 无需将 `@langchain/*` 加入 `MAIN_PROCESS_EXTERNALS`

---

## 9. 验证标准

1. `pnpm install` 无依赖冲突
2. 全仓库 `apps/skill-platform` 与 `packages/momo-knowledge` 中无 `@langchain/*` 直接 import
3. `pnpm --filter @momo/langchain run typecheck` 通过
4. `pnpm --filter @momo/knowledge run typecheck` 通过
5. `skill-platform` 开发构建可启动（`pnpm --filter AIM run dev` 或等价命令）

---

## 10. 后续扩展（不在第一版实现）

| 能力 | 扩展方式 |
|------|----------|
| Docx / Web loader | 新增 `ELoaderKind` + `loaders/` 子模块 + registry 注册 |
| Token / Sentence splitter | 新增 `ESplitterKind` + `splitters/` 子模块 |
| Embedding | 新增 `embeddings/` 域 + `EEmbeddingProvider` |
| Vector store | 新增 `vector-stores/` 域 |
| Chain | 新增 `chains/` 域或 Pipeline 编排层 |
