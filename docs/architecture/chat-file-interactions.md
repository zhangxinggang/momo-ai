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
  Policy --> Approval[RunTimeline / 操作说明与折叠代码详情]
  Approval --> Response[允许本次或拒绝 / respond]
  Response --> Tool
  Host[会话临时目录 runtime.event] --> Directory[RunTimeline 目录按钮]
  Directory --> Shell[系统文件管理器]
  Source[原件 Source Store] --> Preview[文件预览]
  Adapter[文件编辑器 Adapter] --> Preview
  Source --> Download[原始字节下载]
  Adapter --> Download
```

聊天输入框移除权限命令与底部权限入口，执行仍受现有宿主策略与逐次审批约束。审批默认展示操作和原因，代码按运行语言展示在可展开详情中；普通追问使用问题、选项及补充回答。宿主在每轮准备完成后发送临时输出目录，点击通过既有本地路径能力打开系统文件夹。原件预览与工作区文件标题均提供下载，优先使用原始字节，避免重新编码文件。

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
