# 标书分析 OpenUI 界面契约

用于“选择技能 + 上传 PDF/DOCX + 界面模式 + 解析文件”。宿主负责通用组件、语法校验、引用加载与持久化；技能负责业务结构。禁止要求基座按技能名或标书模块分支。

## 布局和显隐

- 浅色背景、白色内容区、清晰表格边框；根 Stack 包含十个固定一级 Tabs，默认基础信息，长导航横向滚动。
- 每个模块的动态二级 Tabs 和内容占满可用宽度，不生成 SplitPane、原招采文件预览或右侧文件区域。
- 二级 Tab 和表头来自本次文件的章节、条款或表单，不能固定套用参考截图栏目。
- 不输出账户区、业务侧栏、右上角业务图标、重新解析、导出或“内容由 AI 大模型生成”提示。“智能问答”一级 Tab 保留。
- Word 阅读器内部控件由 momo-file-editor 管理。模板预览只在“投标文件模板”的对应二级 Tab 内出现。

## 内容投影

以宿主注入的组件参数为准：

```text
root = Stack([moduleNavigation])
moduleNavigation = Tabs([basicItem, templateItem], "line")
basicItem = TabItem("basic", "基础信息", [basicSections])
basicSections = Tabs([actualSection], "pill")
actualSection = TabItem("project", "本次原文分组名", [actualContent])
actualContent = PlainText("本次分析内容与证据")
templateItem = TabItem("templates", "投标文件模板", [templateSections])
templateSections = Tabs([actualTemplate], "pill")
actualTemplate = TabItem("quotation", "本次原表单名", [templateFile, templateEvidence])
templateFile = FilePreview("artifact_create 返回的 sourceRef.sourceId", 800)
templateEvidence = PlainText("出处：本次原招采文件及页码/正文块范围", "muted")
```

以上仅展示嵌套关系，最终必须保留全部十个一级 Tab，替换示例事实与 ID。每个变量都须声明，TabItem.value 在所属 Tabs 内唯一。

- `table` → Table/Col，列和行动态生成；证据放在相应内容旁。
- `text` → PlainText，字面保留原文，避免执行文件里的 HTML、脚本或 Markdown。
- `template` → FilePreview，引用从原件截取且经 artifact_create 注册的 Word。不能用 PlainText、Markdown 表格、HTML 或原招采文件 ID 代替。按 [template-extraction.md](template-extraction.md) 截取、核验并注册。
- 原页图像 Word 须说明图片内容不可逐字编辑；有字体或分页差异时标注待核验，不宣称完全一致。
- 未读部分使用 coverage.partial 并列出位置；空模块保留一级 Tab 和准确 empty_message，不创建空二级 Tab。
- 智能问答展示已有答案与证据，新问题通过当前 AI 对话处理，不生成无后端能力的输入框。

## 输出

按 data-contract.md 完成 analysis.json，模板块填写工具返回的真实 sourceRef.sourceId，然后执行：

```text
python <技能目录>/scripts/render_openui.py --data analysis.json --out 标书解析结果.openui
```

脚本资源使用绝对路径；所有生成文件保存到当前 `temp/<sessionId>`。不再需要原件 sources.json 映射。脚本只校验并投影数据，不代替全文分析、Word 截取或视觉核验。

读取生成文件，完整放入唯一 openui 围栏，内部以 root = 开始，可附简短覆盖说明。不得以 HTML 链接或 JSON 骨架代替界面。后续编辑沿用原始证据及本会话真实产物引用；宿主负责按引用读取字节，源码不包含路径、URL 或 Base64。
