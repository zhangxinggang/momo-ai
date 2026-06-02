# Mermaid SVG 转 PNG 统一导出设计规格

> 日期：2026-06-18  
> 状态：已确认  
> 范围：`@momo/markdown` 包 — chart 工具层 + editor-extensions 导出层

---

## 1. 背景与目标

当前 Mermaid 图表的 SVG→PNG 转换逻辑位于 `editor-extensions/export-dom-image.ts`，而图表下载入口在 `utils/chart/diagram-viewer.ts`，形成**反向依赖**（chart 依赖 editor-extensions）。DOCX 导出与图表下载各自调用同一套函数但 import 路径分散。

**核心目标：**

- 将 SVG→PNG 转图能力下沉到 `utils/chart/svg-to-image.ts`
- Mermaid 图表下载与 DOCX 导出共用同一转图方法
- 转图流程：SVG 序列化 → base64 data URL → Image → Canvas → PNG
- 下载格式保持 **PNG**（`.png`）

**明确不做：**

- 不提供 SVG 文件下载
- 不使用 `html2canvas` 作为任何回退方案
- 不改动 PlantUML / ECharts / 普通图片的现有导出路径

---

## 2. 已确认的产品决策

| 项 | 决策 |
|---|---|
| 下载格式 | PNG（方案 A） |
| 转图位置 | `packages/momo-markdown/src/components/MdEditor/utils/chart/svg-to-image.ts` |
| 失败处理 | 无 html2canvas 回退；DOCX 转图失败则跳过该图片块 |
| 依赖清理 | 从 `package.json` 移除 `html2canvas` |
| DOCX 尺寸缩放 | `scaleImageSize` 仍留在 `export-dom-image.ts`（排版层） |

---

## 3. 模块结构

```
utils/chart/
├── svg-to-image.ts      # 新增：SVG → PNG 核心
├── diagram-viewer.ts    # 修改：从本地 svg-to-image 导入
└── index.ts             # 修改：导出 svg-to-image 公共 API

editor-extensions/
├── export-dom-image.ts  # 修改：移除 SVG 转图 + html2canvas；re-export chart 模块
└── export-docx.ts       # 修改：Mermaid 仅走 svg-to-image；移除 elementToPngData 回退
```

---

## 4. 核心 API

文件：`packages/momo-markdown/src/components/MdEditor/utils/chart/svg-to-image.ts`

```typescript
export interface IExportImageData {
  data: Uint8Array;
  width: number;
  height: number;
}

/** 从 Mermaid 容器提取图表 SVG（排除工具栏 lucide 图标） */
export function getMermaidSvg(container: HTMLElement): SVGSVGElement | null;

/** SVG → PNG 二进制（内部经 base64 data URL 栅格化） */
export async function svgElementToPngData(svg: SVGSVGElement): Promise<IExportImageData>;

/** SVG → PNG Blob（供浏览器下载） */
export async function svgElementToPngBlob(svg: SVGSVGElement): Promise<Blob>;
```

### 4.1 转图流程

1. 克隆 SVG 节点
2. 读取尺寸（getBBox → viewBox → attribute → clientSize 逐级回退）
3. 移除 `foreignObject`（避免 canvas 污染）
4. 内联 SVG 内 `<image>` 的外部 URL 为 data URL（CORS 失败则移除该节点）
5. `XMLSerializer` 序列化为 SVG 字符串
6. 构造 `data:image/svg+xml;charset=utf-8,...` data URL
7. 加载到 `Image`，绘制到白底 Canvas
8. `canvas.toBlob('image/png')` → `Uint8Array`

### 4.2 getMermaidSvg 选择器

使用 `prefix`（来自 `~/config`，值为 `md-editor`）：

- 遍历容器内所有 `svg`
- 排除位于 `.${prefix}-mermaid-action` 内的 svg（工具栏图标）

---

## 5. 调用方改动

### 5.1 图表下载 — `diagram-viewer.ts`

- import 从 `../../../../editor-extensions/export-dom-image` 改为 `./svg-to-image`
- Mermaid 分支：`svgElementToPngBlob(visualNode)` → 下载 `diagram.png`
- PlantUML / ECharts 逻辑不变

### 5.2 DOCX 导出 — `export-docx.ts`

**convertMermaidBlock：**

```typescript
async function convertMermaidBlock(element: HTMLElement): Promise<Paragraph | null> {
  const svg = getMermaidSvg(element);
  if (!svg) {
    return null;
  }
  return buildImageParagraph(svgElementToPngData(svg));
}
```

- 移除 actionBar 隐藏 + `elementToPngData` html2canvas 回退

**convertEchartsBlock：**

```typescript
async function convertEchartsBlock(element: HTMLElement): Promise<Paragraph | null> {
  const canvas = element.querySelector('canvas');
  if (!canvas) {
    return null;
  }
  return buildImageParagraph(canvasElementToPngData(canvas));
}
```

- 移除 actionBar 隐藏 + `elementToPngData` 回退

### 5.3 export-dom-image.ts 瘦身

**移除：**

- `html2canvas` import 及 `elementToPngData` 函数
- `svgElementToPngData`、`svgElementToPngBlob`、`getMermaidSvg` 的实现体
- `canvasElementToPngData` 中对 `elementToPngData(parent)` 的回退

**保留：**

- `IExportImageData`（re-export 自 chart 模块，或 type alias）
- `scaleImageSize`、`blobToUint8Array`、`fetchUrlAsBlob`
- `canvasElementToPngData`、`imgElementToPngData`

**Re-export（向后兼容）：**

```typescript
export {
  getMermaidSvg,
  svgElementToPngData,
  svgElementToPngBlob,
  type IExportImageData,
} from '../components/MdEditor/utils/chart/svg-to-image';
```

### 5.4 package.json

- 删除 `"html2canvas": "^1.4.1"` 依赖

---

## 6. 错误处理

| 场景 | 行为 |
|------|------|
| Mermaid 容器无 SVG | DOCX 跳过；下载无操作 |
| SVG 转 PNG 失败 | DOCX `buildImageParagraph` catch 返回 null；下载 catch 静默 |
| SVG 内嵌外部图片 CORS 失败 | 移除该 `<image>` 后继续转图 |
| ECharts 无 canvas | DOCX 跳过 |
| Canvas 导出失败 | 抛错，上层 catch 跳过 |

---

## 7. 验证清单

- [ ] Mermaid 图表点击下载 → 保存为 PNG，内容正确
- [ ] 含 Mermaid 的文档导出 DOCX → 图表以 PNG 嵌入
- [ ] PlantUML / ECharts 下载与 DOCX 导出行为与改动前一致
- [ ] `pnpm --filter @momo/markdown build` 通过
- [ ] 项目中无 `html2canvas` 引用

---

## 8. 风险与说明

- 移除 html2canvas 后，Mermaid 尚未渲染完成时导出 DOCX 将缺少该图（依赖 `preview-export.tsx` 的 `waitForPreviewReady` 等待 SVG 就绪，现有机制不变）
- `export-dom-image.ts` 对 chart 模块的 re-export 保证外部消费者 import 路径无需变更
