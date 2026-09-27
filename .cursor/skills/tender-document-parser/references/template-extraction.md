# 原文模板截取与 Word 预览

“投标文件模板”必须交付从原文件截取的 `.docx`，不能用抽取文本、Markdown 表格或 AI 重写内容冒充原格式。只截取实际表单及其说明，保留待填项、签章位置、表格合并、字体、边框、图片和分页；不得填造投标人信息。

## 截取

命令中的脚本使用技能资源的绝对路径。当前执行目录已经是宿主指定的 `temp/<sessionId>`；以下相对输出直接落在此目录，不要进入技能目录或创建 `work/outputs`。

DOCX：先列出正文块，再按原表单的连续范围截取（编号从 1 开始；表格或内容控件作为完整块保留）：

```text
python <技能目录>/scripts/extract_template.py <原始文件.docx> --list > template-blocks.json
python <技能目录>/scripts/extract_template.py <原始文件.docx> --start-block 42 --end-block 57 --out 授权委托书.docx
```

脚本直接复制原 DOCX 包中的样式、编号、图片、关系和页眉页脚，仅裁剪正文 XML，并保留选中范围适用的节属性。不从文本重新创建段落或表格。编号是例子，必须替换为实际边界。不要截断表格或混入相邻表单。

PDF：按已核实的物理页码截取，以整页图像按原始尺寸放入 Word，避免 PDF 转可编辑文字引起换行或表格变化：

```text
python <技能目录>/scripts/extract_template.py <原始文件.pdf> --pages 18-21 --out 报价表.docx
```

这类产物的 `extraction` 为 `page-facsimile`，界面说明“原页版式 Word（图片内容，不可逐字编辑）”。不能称为可逐字编辑的模板。多个表单在同一 PDF 页时保留整页并说明共页；不要悄悄裁掉页眉、页脚或表单说明。单个产物超过宿主 10 MiB 限制时按完整表单拆分，不能截断内容。

## 核验与注册

1. 用 momo-file-editor 查看截取后的 Word，对照原文件检查页序、文字/占位符、字体、表格合并、页眉页脚、图片和签章空白。原文件可作为核验输入，但不放在分析页右侧。
2. DOCX 的自动编号、分页、浮动对象和字体依赖渲染引擎；不能仅凭 XML 复制成功就宣称显示完全一致。有差异时，用原件的 Word/Office 渲染结果导出 PDF，再走原页截取方式；不得用文本重建作为“保真”降级。无法取得原件渲染结果或无法完成视觉核验时，明确标注待核验项，不声称已经完全一致。
3. 调用宿主 `artifact_create`，参数示例：`{"name":"报价表.docx","mimeType":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","path":"报价表.docx"}`。`path` 必须是当前会话 temp 中实际存在的文件；不把 Base64 抄入模型输出。
4. 将工具返回的 `sourceRef.sourceId` 写入模板块的 `document.source_id`，`document.name` 为实际 Word 文件名，`document.extraction` 为脚本返回的模式；证据继续引用原始招采文件及其位置。
5. `render_openui.py` 将此模板块投影为 `FilePreview(sourceId, 800)`，宿主加载 Word 字节交给 momo-file-editor。预览 ID 不能使用原招采文件 ID、文件路径、URL 或虚构 ID。

没有原模板时显示准确空状态；截取失败时显示具体原因和待核验项，不能用纯文本模板代替成功结果。显式独立 HTML 交付时，把 Word 放在 HTML 同一目录，离线页只提供 Word 链接；momo-file-editor 预览发生在宿主界面内。
