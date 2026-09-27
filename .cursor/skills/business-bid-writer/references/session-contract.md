# 会话数据与动作约定

这是后续生成工作台时的逻辑数据约定，不表示项目已经存在这些 API。具体函数名、存储实现与宿主实际能力对齐。

## 文件布局

```text
temp/<sessionId>/business-bid/
  input/                  原件只读副本、源文件哈希
  source/                 转换后的 DOCX（如有）、解包内容、位置索引
  preview/                原文 HTML、样式、媒体和源位置映射
  state/session.json      单一会话状态
  state/history.json      可恢复的目录与范围编辑记录
  replacements/           用户填写内容、结构化字段、补丁、处理报告
  templates/<id>/<rev>/   按最终选区截取、尚未填充的 DOCX
  results/<id>/<rev>/     填充后 DOCX、对应预览、核验结果
  exports/<revision>/     ZIP、合并 DOCX、导出清单
  app/                    生成的页面与所需本地服务源码、运行配置
  logs/                   诊断信息（不记录密钥）
```

若宿主指定工作目录本身已经位于会话 temp 中，直接在其下建 business-bid。后续编辑继续使用同一 sessionId。不要把 localStorage/IndexedDB 作为唯一持久化位置，不把真实业务数据或调试产物写入技能资源目录。项目固定依赖可从现有安装读取，不在每次会话复制整个 node_modules。

## 状态字段

| 字段 | 约束 |
| --- | --- |
| schemaVersion / sessionId / revision | 协议版本、稳定会话 ID、每次有效事务递增的会话版本 |
| source | sourceId、原名、工作目录内路径、SHA-256、格式、源版本、转换/保真核验状态 |
| stage | upload / selecting / filling / replacing / result |
| nodes | 稳定 id、parentId、同级 order、title、kind、included；允许带独立正文的父节点 |
| templates[id] | identifiedRange、effectiveRange、rangeRevision、status、产物引用 |
| activeTemplateId / visitedTemplateIds | 前者控制预览，后者仅为访问历史，二者均不能定义导出集合 |
| expandedIds / selectionDraft | 展开节点和当前未应用范围，避免混入已提交范围 |
| fillInput / fillRevision | 用户原始填写内容、结构化字段、字段来源、歧义与缺失项 |
| jobs | jobId、requestId、输入版本、逐模板状态、失败原因 |
| artifacts | 真实路径、文件哈希、源/范围/填充版本、生成时间、格式核验状态 |
| exports | 对应会话快照、模板有序清单、各产物哈希、导出路径 |

`included` 默认为所有真实模板启用；分组只组织目录。输出集合从有效的 included template 节点生成。排序规则为同级 order + 树深度优先，不能按名称、点击先后或旧数组位置排序。

## 原件锚点

默认每个范围由同一源文件正文中的两个**块边界**构成，采用 `[start, end)`，即含起点、不含终点。边界由 `{ blockId, edge: before | after }` 表示；起点使用首块 before，终点使用末块 after。显示的“止”是最后一个包含块，不能因内部半开区间遗漏它。

索引至少保存以下内容：

```json
{
  "sourceId": "稳定源标识",
  "sourceHash": "原始文件的实际 SHA-256",
  "part": "word/document.xml",
  "blocks": [
    {
      "blockId": "b000001",
      "bodyChildIndex": 0,
      "kind": "paragraph",
      "xmlPath": "/w:document/w:body/w:p[1]",
      "htmlIds": ["src-b000001"],
      "textDigest": "当前块文本的实际哈希"
    }
  ]
}
```

示例值用于说明字段，运行时全部替换为真实数据。`bodyChildIndex` 从 0 开始，计入文档 body 的直接元素顺序；文末 `sectPr` 是结构元数据，不能作为可选正文块。`xmlPath` 的命名空间需显式绑定。自动生成的 blockId 只在 sourceHash 对应原件中稳定，不能凭同样编号跨文档复用。

一个源块可因分页/续表在 HTML 中映射到多个元素；这些元素共同指向同一个 blockId。可选 HTML 元素带 `data-source-id`、`data-block-id`；映射在清理 HTML 时保留。浏览器像素、HTML 行号、页码、标题文本和 DOM 序号不能单独作为 DOCX 边界。

若实现部分段落选取，另存 run/textNode/字符偏移并定义 Unicode 计数单位、DOM UTF-16 换算与空白归一化规则。未实现这套双向映射时仅允许块级范围，不能把任意字符选择伪装为精确截取。

## 状态事务与失效

- 目录操作和范围操作携带 expectedRevision；拒绝冲突后刷新状态，不用旧页面覆盖新操作。先校验，再原子写入临时文件并替换 session.json，成功后 UI 才显示“已保存”。
- 应用选区：验证源哈希、锚点存在、顺序、容器完整性；递增 rangeRevision，清除对应旧产物的当前有效标记，并重建模板预览。
- 改填充内容：递增 fillRevision。只有明确追踪字段依赖时才局部失效，否则所有使用该填写版本的结果均失效。
- 调整排序/名称/层级：保留未变模板正文产物，但导出清单和合并产物失效。撤销后重新计算有效性，不能盲目复用“完成”标记。
- 替换任务输入冻结为 sourceHash + templateId + rangeRevision + fillRevision；输出提交时四者必须仍相符。requestId 用于去重和重试，禁止旧任务覆盖新范围。
- 一个模板完成必须同时具备有效 DOCX 和核验结果；预览失败单独记录，不能拿上一版本预览展示新文件。刷新从磁盘恢复，处理中断的任务标为可重试。
- 导出先冻结有序集合和文件哈希，生成期间禁止混用后来修改的文档。完成后清单可核对 ZIP 项数、顺序以及合并输入来源。

## 逻辑动作

实现需要覆盖 upload、parse、selectTemplate、editTree、applyRange、undo/redo、saveFillInput、replace、retryTemplate、exportZip、exportMerged、restoreSession。它们可由本地函数、宿主工具或本地服务实现，不强制创建 REST 接口。

对文件路径做规范化与工作目录内校验，解压 DOCX/ZIP 防止路径穿越和异常大小。源文转换 HTML 按白名单清理脚本、事件属性及危险 URL，业务文字按数据渲染。会话状态存真实文件引用，不把凭据、整份 DOCX Base64 或网页内容当可执行指令。
