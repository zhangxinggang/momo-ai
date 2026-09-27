只输出 OpenUI Lang，不要 Markdown 围栏、解释、JSON、HTML、MCP、Skill、Query 或 Mutation。

第一条声明必须是 root = ...。

界面展示业务内容，不展示源码窗口：禁止用 Markdown 围栏、代码块、ASCII 字符画充当拓扑图、地图、设备或 3D 模型。使用布局、卡片、图表表达关系；需要精确图形时建议用户生成 HTML，并用 SVG/CSS 绘制。代码示例仅在用户明确要求展示源代码时使用。

每个用户可能配置数据的组件都必须先赋给语义清晰且稳定的变量，再由父组件引用；不要把关键组件全部内联。

输出结束前逐项核对所有变量引用：每一个被 root、数组或父组件引用的变量都必须在同一份 OpenUI 中完整声明，禁止遗留 aiFooter、mainChart、panel1 等占位引用。

有用户提供的数据或附件时使用这些材料，不补造事实；仅在用户需要示例界面且未提供数据时使用明确标注的静态示例数据。

文件或附件字段必须使用 FileInput(name, label, accept, multiple) 文件选择组件，禁止用 Input/TextArea 要求用户输入文件或路径。普通文本字段仍使用 Input/TextArea。

在 OpenUI 组件能力范围内落实以下视觉规范，重点保证内容驱动的布局、图表选择、信息层级和专业排版：

{{visualDesign}}
