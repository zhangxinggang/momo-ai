# AI 对话文件选择与执行续接

文件输入由 `QuestionItem.inputType=file` 或原生问题 header 的 `[file]` 标记声明。宿主兼容旧问题中明确的上传措辞；文件格式、名称等普通文本问题和计划审阅仍使用原控件。

```mermaid
sequenceDiagram
  participant Agent as Harness Agent
  participant Host as ChatApplicationService
  participant UI as RunTimeline
  participant Upload as 原文件上传 / Source Store
  Agent->>Host: interaction.requested / 文件追问
  Host->>UI: 持久事件 / 问题 ID
  UI->>Upload: 文件选择器提供 File 原始字节
  Upload-->>UI: SourceRef
  UI->>Host: respond / runId / requestId / sourceRefs
  Host->>Host: 校验待答问题、附件数量、原件快照
  Host->>Agent: prepareAttachment asFile / attachmentPaths
  Agent-->>Host: 原件只读路径
  Host->>Host: 更新会话附件索引与本轮 input / 审计
  Host->>Agent: respond / 含原件路径的文本回答
  Agent->>Host: attachments_list / attachments_readFile / execution_run
  Host-->>Agent: 工具结果 / 继续当前轮
```

追问上传复用主输入框的原文件上传服务，不接受用户手填路径代替文件。原生问题回答协议仍是文本；SourceRef 只在宿主边界内验证和绑定，再转成可读取的附件描述。图片在文件追问中以原文件形式准入。文件工具在无附件轮次也注册，以接收本轮稍后上传的首个文件；代码执行仍经过 ToolBroker 的权限、计划模式与审批检查。文件索引绑定会话并供后续轮次复用。

```mermaid
flowchart LR
  Tool[Harness 或宿主工具] --> Policy[ToolBroker / 当前模式与权限检查]
  Policy -->|默认完全权限| Execute[直接执行 / 保留工具进度与审计]
  Execute --> Tool
  Policy -->|显式受限调用| Approval[RunTimeline / 操作说明与折叠代码详情]
  Approval --> Response[允许本次或拒绝 / respond]
  Response --> Tool
  Host[会话临时目录 runtime.event] --> Directory[RunTimeline 目录按钮]
  Directory --> Shell[系统文件管理器]
  Source[原件 Source Store] --> Preview[文件预览]
  Adapter[文件编辑器 Adapter] --> Preview
  Source --> Download[原始字节下载]
  Adapter --> Download
```

聊天输入框没有权限入口，桌面对话、单轮编辑与自定义工具默认完全权限。Renderer 发送时覆盖旧会话的隐藏权限值，Main 优先采用本轮显式权限并持久化；恢复旧会话时同步完全权限并放行已有待审批项。宿主工具直接执行，原生审批由 Main 自动答复并在事件中标记 `automaticApproval`，时间线不显示这类审批卡片；执行进度、审计、普通追问及计划模式保留。底层受限权限调用仍可走原有策略。宿主发送临时输出目录，通过既有本地路径能力打开文件夹；原件预览与下载使用原始字节。

```mermaid
flowchart LR
  Schema[momoOpenuiLibrary / FileInput] --> Generator[生成与校验]
  Generator --> Preview[CustomToolOpenUIPreview]
  Legacy[历史上传 Input / TextArea] --> Preview
  Preview --> Picker[FileInputView / 原生文件选择]
  Picker --> Actions[viewGeneration.render / attachFiles]
  Actions --> Composer[AiChatView 待发送附件]
  Preview --> Button[Button / Form 的 onAction]
  Button --> Submit[按钮说明与表单值 / submit]
  Submit --> Send[AiChatView 既有发送流程]
  Composer --> Send
  Send --> Context[useChatSessions / 恢复原任务和附件]
  History[当前会话历史与请求快照] --> Context
  Context -->|解析技能 / Command| Harness[Harness 原文件分析]
  Context -->|普通界面| View[读取历史附件正文 / 界面生成]
```

聊天生成界面的 `FileInput` 选择原文件后加入聊天输入框；点击同一 Form 中的 Button，经 Renderer 的 `onAction` 和宿主 `submit` 回调，提交按钮说明、表单字段、输入框补充内容和待发送附件。文件上传或提交期间禁用重复操作，失败在界面内显示并保留待发送文件。工具箱未注入聊天回调时明确提示无法提交；HTML 仍在原有 sandbox iframe 中，不注入宿主文件能力。

“请继续”等续接请求及界面按钮会在当前会话中找到原用户任务；旧版本生成的“未检测到附件”页面不会截断此前任务。续接技能保留资源 ID、revision 和行内 token，补入实际模型输入后仍由 Main 校验、展开并进入 Harness。纯界面请求也会读取此前附件的正文。`requestSnapshot.continuationOf` 和本轮实际 `sourceRefs` 随消息持久化，重开与重试复用冻结上下文；新选文件替换本次材料，显式新任务不自动继承旧技能。点击历史界面只从该界面及之前的消息恢复上下文，不读取其他会话或未来轮次附件。
