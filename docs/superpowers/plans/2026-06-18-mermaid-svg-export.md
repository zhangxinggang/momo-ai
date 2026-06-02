# Mermaid SVG 转 PNG 统一导出 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Mermaid SVG→PNG 转图逻辑下沉到 `utils/chart/svg-to-image.ts`，供图表下载与 DOCX 导出共用，并移除 html2canvas 依赖。

**Architecture:** 从 `export-dom-image.ts` 提取 SVG 转 PNG 核心到 chart 层新文件；export 层保留 img/canvas 导出与尺寸缩放，通过 re-export 保持向后兼容；DOCX 与下载均直接调用 chart 模块，失败时跳过而非回退截图。

**Tech Stack:** TypeScript、Canvas API、docx、现有 Mermaid 预览 DOM

**Spec:** `docs/superpowers/specs/2026-06-18-mermaid-svg-export-design.md`

---

## 文件变更一览

| 操作 | 文件 | 职责 |
|------|------|------|
| Create | `packages/momo-markdown/src/components/MdEditor/utils/chart/svg-to-image.ts` | SVG→PNG 核心 |
| Modify | `packages/momo-markdown/src/components/MdEditor/utils/chart/index.ts` | 导出 svg-to-image |
| Modify | `packages/momo-markdown/src/components/MdEditor/utils/chart/diagram-viewer.ts` | 改 import 路径 |
| Modify | `packages/momo-markdown/src/editor-extensions/export-dom-image.ts` | 移除 SVG 实现 + html2canvas |
| Modify | `packages/momo-markdown/src/editor-extensions/export-docx.ts` | 简化 Mermaid/ECharts 转换 |
| Modify | `packages/momo-markdown/package.json` | 删除 html2canvas |

---

### Task 1: 创建 svg-to-image.ts

**Files:**
- Create: `packages/momo-markdown/src/components/MdEditor/utils/chart/svg-to-image.ts`

- [ ] **Step 1: 从 export-dom-image.ts 迁移 SVG 转图逻辑**

将以下函数整体迁移到新文件，并改用 `prefix` from `~/config` 替代硬编码 `EDITOR_PREFIX`：

- `getSvgImageHref` / `setSvgImageHref`（私有）
- `inlineSvgExternalImages`（私有）
- `blobToDataUrl`（私有）
- `canvasToPngBlob`（私有）
- `blobToUint8Array`（私有，或从 export-dom-image import — 优先内联私有副本避免循环依赖）
- `getMermaidSvg`
- `svgElementToPngData`
- `svgElementToPngBlob`

导出 `IExportImageData` 接口。

`getMermaidSvg` 实现：

```typescript
import { prefix } from '~/config';

export function getMermaidSvg(container: HTMLElement): SVGSVGElement | null {
  for (const svg of container.querySelectorAll<SVGSVGElement>('svg')) {
    if (!svg.closest(`.${prefix}-mermaid-action`)) {
      return svg;
    }
  }
  return null;
}
```

- [ ] **Step 2: 更新 chart/index.ts 导出**

```typescript
export * from './svg-to-image';
```

- [ ] **Step 3: 验证 TypeScript 编译**

Run: `pnpm --filter @momo/markdown exec tsc --noEmit`（若项目无此脚本则用 build 代替）

Expected: 可能有未使用的旧导出警告，Task 2 修复

---

### Task 2: 更新 diagram-viewer.ts import

**Files:**
- Modify: `packages/momo-markdown/src/components/MdEditor/utils/chart/diagram-viewer.ts`

- [ ] **Step 1: 替换 import**

将：

```typescript
import {
  canvasElementToPngData,
  fetchUrlAsBlob,
  imgElementToPngData,
  svgElementToPngBlob,
} from '../../../../editor-extensions/export-dom-image';
```

改为：

```typescript
import {
  canvasElementToPngData,
  fetchUrlAsBlob,
  imgElementToPngData,
} from '../../../../editor-extensions/export-dom-image';
import { svgElementToPngBlob } from './svg-to-image';
```

`canvasElementToPngData` / `imgElementToPngData` / `fetchUrlAsBlob` 仍从 export-dom-image 引入（非 Mermaid SVG 路径）。

---

### Task 3: 瘦身 export-dom-image.ts

**Files:**
- Modify: `packages/momo-markdown/src/editor-extensions/export-dom-image.ts`

- [ ] **Step 1: 删除 html2canvas 及 elementToPngData**

移除：
- `import html2canvas from 'html2canvas'`
- 整个 `elementToPngData` 函数（约 265–289 行）
- `getSvgImageHref` 到 `svgElementToPngBlob` 的实现体
- `getMermaidSvg` 的实现体

- [ ] **Step 2: 添加 re-export**

在文件顶部或底部添加：

```typescript
export {
  getMermaidSvg,
  svgElementToPngData,
  svgElementToPngBlob,
  type IExportImageData,
} from '../components/MdEditor/utils/chart/svg-to-image';
```

注意：`IExportImageData` 若已在 export-dom-image 中定义，改为仅从 chart re-export，删除本地重复定义。

- [ ] **Step 3: 简化 canvasElementToPngData 错误处理**

将 catch 块中的 `elementToPngData(parent)` 回退改为直接抛错：

```typescript
export async function canvasElementToPngData(canvas: HTMLCanvasElement): Promise<IExportImageData> {
  const cssWidth = Math.max(Math.round(canvas.clientWidth || 0), 1);
  const cssHeight = Math.max(Math.round(canvas.clientHeight || 0), 1);

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = cssWidth;
  exportCanvas.height = cssHeight;
  const context = exportCanvas.getContext('2d');
  if (!context) {
    throw new Error('无法创建画布');
  }
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, cssWidth, cssHeight);
  context.drawImage(canvas, 0, 0, cssWidth, cssHeight);

  const blob = await canvasToPngBlob(exportCanvas);
  const data = await blobToUint8Array(blob);
  return { data, width: cssWidth, height: cssHeight };
}
```

保留 `canvasToPngBlob` 作为 export-dom-image 内部私有函数（img/canvas 路径仍需要）。

---

### Task 4: 简化 export-docx.ts

**Files:**
- Modify: `packages/momo-markdown/src/editor-extensions/export-docx.ts`

- [ ] **Step 1: 更新 import**

```typescript
import {
  getMermaidSvg,
  svgElementToPngData,
} from '../components/MdEditor/utils/chart/svg-to-image';
import {
  blobToUint8Array,
  canvasElementToPngData,
  fetchUrlAsBlob,
  imgElementToPngData,
  scaleImageSize,
} from './export-dom-image';
```

移除 `elementToPngData` import。

- [ ] **Step 2: 重写 convertMermaidBlock**

```typescript
async function convertMermaidBlock(element: HTMLElement): Promise<Paragraph | null> {
  const svg = getMermaidSvg(element);
  if (!svg) {
    return null;
  }
  return buildImageParagraph(svgElementToPngData(svg));
}
```

- [ ] **Step 3: 重写 convertEchartsBlock**

```typescript
async function convertEchartsBlock(element: HTMLElement): Promise<Paragraph | null> {
  const canvas = element.querySelector('canvas');
  if (!canvas) {
    return null;
  }
  return buildImageParagraph(canvasElementToPngData(canvas));
}
```

移除 `ACTION_BAR_CLASS` 在 Mermaid/ECharts 转换中的使用（若仅此处使用且 convert 函数内已无引用，可保留常量供其他用途或删除无用引用）。

---

### Task 5: 移除 html2canvas 依赖

**Files:**
- Modify: `packages/momo-markdown/package.json`

- [ ] **Step 1: 删除依赖行**

移除 `"html2canvas": "^1.4.1",`

- [ ] **Step 2: 安装并验证无残留引用**

Run: `pnpm install`

Run: `rg html2canvas packages/momo-markdown`

Expected: 无匹配

---

### Task 6: 构建验证

- [ ] **Step 1: 构建包**

Run: `pnpm --filter @momo/markdown build`

Expected: 构建成功，无 TypeScript 错误

- [ ] **Step 2: lint**

Run: `pnpm --filter @momo/markdown lint`

Expected: 通过或仅 pre-existing 问题

---

## Spec 覆盖自检

| Spec 要求 | 对应 Task |
|-----------|-----------|
| svg-to-image.ts 新建 | Task 1 |
| chart/index.ts 导出 | Task 1 |
| diagram-viewer 改 import | Task 2 |
| export-dom-image re-export + 移除 html2canvas | Task 3 |
| export-docx 简化无回退 | Task 4 |
| package.json 删 html2canvas | Task 5 |
| 构建验证 | Task 6 |
