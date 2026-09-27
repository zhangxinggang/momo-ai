# Markdown 本地渲染

`@momo/markdown` 的代码高亮与 PlantUML 渲染资源随应用打包。Markdown 预览与富文本共用本地引擎，图表预览、PNG 下载与 DOCX 导出不调用公网 PlantUML 服务。

```mermaid
flowchart LR
  subgraph Renderer[Renderer / momo-markdown]
    Markdown[Markdown 预览] --> Highlight[highlight.js 实例和本地主题 CSS]
    Markdown --> Queue[plantuml-renderer 串行队列和缓存]
    Richtext[富文本 DiagramView] --> Queue
    Markdown --> Mermaid["renderMermaidSvg<br/>隔离的临时 DOM 容器"]
    Richtext --> Mermaid
    Mermaid --> MermaidEngine[本地 Mermaid 引擎]
    MermaidEngine --> MermaidSVG[SVG 预览]
    Queue --> Core["@plantuml/core 1.2026.8<br/>TeaVM + Viz.js / WASM"]
    Assets[打包资源<br/>emoji / openiconic / themes] --> Core
    Core --> SVG[SVG data URL 图片]
    SVG --> Preview[图表预览和全屏]
    SVG --> Canvas[浏览器 Canvas]
    Canvas --> PNG[PNG 下载 / DOCX 导出]
    Markdown --> Katex[共享 getKatexOptions / KaTeX 公式]
    RichFormula[富文本公式节点] --> Katex
    Katex --> MathML[含 emoji 时使用原生 MathML 和系统字体]
  end
```

官方 TeaVM 引擎共享内部状态，因此所有渲染串行执行；相同源码复用 Promise，最多缓存 64 项。视图更新后忽略旧的异步结果。可选脚本只从已打包的资源映射加载，未包含的大型图形库返回错误，不尝试远程脚本；外部图片和远程 include 仍属于文档自身的外部资源，不属于本地图形库。

Mermaid 在专用临时容器内渲染，并始终清理容器；语法错误不向页面挂载错误 SVG，Markdown 预览仍通过错误事件报告诊断。富文本与 Markdown 公式共用 KaTeX 配置及预览主题样式，公式节点保留原始 LaTeX 用于编辑和 Markdown 序列化。

富文本图表由 `DiagramDeletion` 在默认代码块合并命令前按完整节点删除。链接通过 `LinkEditor` 捕获选区、在文本上方确认 URL，再向原文本添加 TipTap link 标记，保留已有文字格式。

## 编辑器对齐与 Markdown 存储

```mermaid
flowchart LR
  Toolbar[对齐工具栏] --> Event[REPLACE align 指令]
  Event --> Source[CodeMirror 当前行或选区]
  Event --> Rich[TipTap 段落 / 标题 / 图片 textAlign]
  Source --> Wrapper[div data-align / text-align 包裹]
  Rich --> Serializer[保留对齐属性的序列化]
  Serializer --> Wrapper
  Serializer --> HTML[对齐列表和表格的 schema HTML]
  Wrapper --> Document[Markdown 文档]
  HTML --> Document
  Document --> Parser[Markdown 解析及对齐属性恢复]
  Parser --> Rich
  Document --> Preview[Markdown 预览与共享图片对齐样式]
```

对齐设置随 Markdown 文档保存；顶层包裹内仍使用 Markdown，保留文字格式、公式和图表语法。包含对齐段落的列表和表格保存为 schema HTML，避免 Markdown 容器语法丢失属性或破坏节点结构。未指定对齐的图片默认居中，普通段落沿用主题默认值。富文本图片节点与 Markdown 预览共用对齐样式。

## 本地服务嵌入

```mermaid
flowchart LR
  Desktop["桌面 Renderer<br/>file:// 或 localhost 开发页"] --> Frame[draw.io / 本地工具 iframe]
  Frame --> Server["@momo/server<br/>本地 HTTP 静态服务"]
  Config["skill-platform security.frameAncestors<br/>self / file: / localhost / 127.0.0.1"] --> Headers["frame-embedding<br/>CSP frame-ancestors"]
  Headers --> Server
  Default[未设置 frameAncestors 的宿主] --> Sameorigin[Helmet SAMEORIGIN 默认策略]
```

skill-platform 显式配置允许嵌入的本地来源，服务移除冲突的 `X-Frame-Options` 并使用 CSP 限定父页面。其他宿主保留默认 SAMEORIGIN；Helmet 的其他响应头继续生效。
